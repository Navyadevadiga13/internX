import React, { useState, useEffect } from 'react';
import { Building2, X, CheckCircle, Briefcase, FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanySidebar from './CompanySidebar';
import toast from 'react-hot-toast';

interface Company {
  _id?: string;
  name: string;
  location: string;
  website: string;
  email: string;
  contact: string;
  description?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  industry?: string;
  isVerified: boolean;
  logoUrl?: string;
  size?: string;
  founded?: number;
  createdAt?: string;
  updatedAt?: string;
}
interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
}

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production URLs
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }

    // Vercel/Netlify deployments
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }

    // Local development
    return 'http://localhost:5006/api';
  }

  return 'http://localhost:5006/api';
};

const StatCard = ({
  title,
  value,
  desc,
  icon,
  bg,
}: {
  title: string;
  value: number;
  desc?: string;
  icon: React.ReactNode;
  bg: string;
}) => (
  <div className={`rounded-2xl border border-gray-700/40 p-4 flex flex-col items-center min-w-0 shadow-sm ${bg}`}>
    <div className="w-10 h-10 flex items-center justify-center mb-2">{icon}</div>
    <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    {desc && <p className="text-xs text-gray-500">{desc}</p>}
  </div>
);

const CompanyDashboard: React.FC = () => {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    selectedApplications: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showProfilePopup, setShowProfilePopup] = useState<boolean>(false);
  const navigate = useNavigate();

const calculateProfileCompletion = (company: Company): number => {
  const fields = [
    company.name,
    company.email,
    company.contact,
    company.location,
    company.website,
    company.logoUrl,
    company.industry,
    company.size,
    company.founded,
    company.description,
    company.linkedinUrl,
    company.twitterUrl,
    company.facebookUrl,
    company.instagramUrl,
  ];
  const filledFields = fields.filter(field => field && String(field).trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};


const fetchCompanyProfile = async () => {
  try {
    const token = localStorage.getItem('companyToken');
    const API_BASE_URL = getApiBaseUrl();
    const response = await axios.get<{ message: string; company: Company }>(
      `${API_BASE_URL}/company_profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.company) {
      setCompanyData(response.data.company);
      const completion = calculateProfileCompletion(response.data.company);
      if (completion < 75) {
        setShowProfilePopup(true);
      }
    }
  } catch (error) {
    console.error('Error fetching company profile:', error);
  } finally {
    setLoading(false);
  }
};


  const fetchCompanyStats = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const response = await axios.get<CompanyStats>(
        `${API_BASE_URL}/company/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      toast.error('Failed to load stats');
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
    fetchCompanyStats();
  }, []);

  const handleCompleteProfile = () => {
    localStorage.setItem('hasSeenProfilePopup', 'true');
    setShowProfilePopup(false);
    navigate('/Company-Profile');
  };

  const handleDismissPopup = () => {
    localStorage.setItem('hasSeenProfilePopup', 'true');
    setShowProfilePopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      <CompanySidebar />

      {/* Main Content */}
<main className="flex-1 px-3 pt-16 md:pt-10 md:px-8 overflow-auto ml-0 md:ml-64 min-h-screen">
  <section className="max-w-7xl w-full mx-auto">
    {/* Header aligned left on desktop */}
    <div className="mb-8">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl inline-block mb-2">
        <Building2 className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white text-left">
        {loading ? 'Loading...' : `Hello, ${companyData?.name || 'Company'}`}
      </h1>
      <p className="text-gray-400 mt-2 text-left">
        Welcome to your company dashboard
      </p>
    </div>


          {/* Stats Cards Clean Grid */}
          <div className="flex justify-center w-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 w-full mb-8">
              <StatCard
                title="Total Jobs"
                value={stats.totalJobs}
                desc={`${stats.activeJobs} current`}
                icon={<Briefcase className="h-7 w-7 text-blue-400" />}
                bg="bg-blue-100/20"
              />
              <StatCard
                title="Active Jobs"
                value={stats.activeJobs}
                desc="Currently hiring"
                icon={<CheckCircle className="h-7 w-7 text-green-400" />}
                bg="bg-green-100/20"
              />
              <StatCard
                title="Applications"
                value={stats.totalApplications}
                desc="All received"
                icon={<FileText className="h-7 w-7 text-blue-400" />}
                bg="bg-blue-100/20"
              />
              <StatCard
                title="Pending"
                value={stats.pendingApplications}
                desc="Awaiting review"
                icon={<Eye className="h-7 w-7 text-yellow-400" />}
                bg="bg-yellow-100/20"
              />
              <StatCard
                title="Selected"
                value={stats.selectedApplications}
                desc={`${stats.rejectedApplications} rejected`}
                icon={<CheckCircle className="h-7 w-7 text-green-400" />}
                bg="bg-green-100/20"
              />
            </div>
          </div>
        </section>

        {/* Profile Completion Popup */}
{showProfilePopup && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6 relative">
      <button
        onClick={() => setShowProfilePopup(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        aria-label="Close popup"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
        <p className="text-gray-400 mb-6">
          Please complete your profile <span className="text-green-400 font-bold">75% or above</span> to be verified by the admin faster.<br />
          <span className="block mt-2 text-xs text-gray-500">If done, you can ignore this message.</span>
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              setShowProfilePopup(false);
              navigate('/Company-Profile');
            }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Complete Profile Now
          </button>
          <button
            onClick={() => setShowProfilePopup(false)}
            className="w-full bg-gray-700 text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-600 transition-all font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

export default CompanyDashboard;
