import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Job = {
  _id: string;
  country_name: string;
  company_name: string;
  link: string;
};
// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5006/api';
    }

    // Production URLs
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }

    // Vercel/Netlify deployments
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }

    // Default to localhost for development
    return 'http://localhost:5006/api';
  }

  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();
const GlobalJob: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // For dropdown
  const [countryOptions, setCountryOptions] = useState<string[]>([]); // All unique countries
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Run filter every time jobs or selectedCountry changes
    if (!selectedCountry) {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(j => j.country_name === selectedCountry));
    }
  }, [jobs, selectedCountry]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/globaljobs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await response.json();
        setJobs(data);

        // ----> Extract unique countries
        const countries = Array.from(new Set(data.map(j => j.country_name))).sort();
        setCountryOptions(countries);

      } catch (err) {
        setError("Could not load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [navigate]);

  // This will group jobs by country_name (after filtering)
  const groupJobsByCountry = (jobs: Job[]) => {
    const grouped: { [country: string]: Job[] } = {};
    jobs.forEach(job => {
      if (!grouped[job.country_name]) {
        grouped[job.country_name] = [];
      }
      grouped[job.country_name].push(job);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 tracking-wide font-semibold text-xl">
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-600 font-semibold text-lg">
        {error}
      </div>
    );
  }

  const handleApplyClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-900 tracking-wide sm:tracking-tight drop-shadow-sm">
        Find Your <span className="text-green-700">Dream Job</span>
      </h1>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 max-w-lg mx-auto">
        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          className="block w-full md:w-auto border border-green-300 rounded-lg px-4 py-2 mb-3 md:mb-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Filter jobs by country"
        >
          <option value="">All Countries</option>
          {countryOptions.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>


   {Object.entries(groupJobsByCountry(filteredJobs)).length === 0 ? (
  <p className="text-center text-gray-500 font-medium text-lg">
    No jobs found.
  </p>
) : (
  Object.entries(groupJobsByCountry(filteredJobs)).map(([country, jobsList]) => (
   <div key={country} className="bg-white rounded-3xl shadow-lg border border-green-300 mb-12 p-6 max-w-4xl mx-auto">
  {/* Country Header */}
  <div className="bg-gradient-to-r from-green-200 via-green-50 to-white rounded-t-3xl p-6 mb-4">
    <h2 className="text-3xl font-extrabold text-green-800 tracking-wide">{country}</h2>
  </div>
      {/* Jobs under this country */}
      <div className="divide-y divide-green-100">
     {jobsList.map(({ _id, company_name, link }) => (
  <div
    key={_id}
    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 transition-transform transform hover:scale-[1.02] hover:bg-green-50 shadow-sm hover:shadow-md rounded-2xl cursor-pointer"
  >
    <div className="flex flex-col space-y-1 flex-1">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-700 font-bold text-lg sm:text-xl hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 ring-offset-1 rounded break-words"
      >
        {company_name}
      </a>
    </div>
    <button
      onClick={() => handleApplyClick(link)}
      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 transition-colors duration-300 w-full sm:w-auto mt-4 sm:mt-0 cursor-pointer"
      aria-label={`Apply to ${company_name}`}
    >
      <span>Apply Now</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
))}


      </div>
    </div>
  ))
)}


    </div>
  );
};

export default GlobalJob;
