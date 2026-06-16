import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Briefcase, Clock, Building } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  position: string;
  salary: number;
  type: string;
  duration: string;
  description: string;
  createdAt: string;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
}

// Determine API base URL based on environment
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

const API_BASE_URL = getApiBaseUrl();

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    domain: '',
    position: '',
    minSalary: '',
    maxSalary: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [pagination.current]);

  useEffect(() => {
    // Get filters from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const newFilters = {
      search: urlParams.get('search') || '',
      location: urlParams.get('location') || '',
      domain: urlParams.get('domain') || '',
      position: urlParams.get('position') || '',
      minSalary: urlParams.get('minSalary') || '',
      maxSalary: urlParams.get('maxSalary') || ''
    };
    setFilters(newFilters);
  }, []);

  const fetchJobs = async (page = pagination.current) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await axios.get(`${API_BASE_URL}/jobs?${params.toString()}`);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchJobs(1);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      domain: '',
      position: '',
      minSalary: '',
      maxSalary: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchJobs(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Internship</h1>
          <p className="text-gray-600">Discover amazing opportunities from top companies</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Main Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Internship title, keywords, or company"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Search
            </button>
            <button
              onClick={()=> setShowFilters(!showFilters)}
              className="border border-gray-300 hover:border-green-500 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Marketing"
                    value={filters.domain}
                    onChange={(e) => handleFilterChange('domain', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"  
                    placeholder="e.g., Developer, Intern"
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.minSalary}
                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={filters.maxSalary}
                    onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSearch}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {jobs.length} of {pagination.total} internships
          </p>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your search filters to find more opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {job.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center text-green-600">
                   
                    <span className="text-lg font-bold">₹{job.salary.toLocaleString()}</span>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page === pagination.current
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;