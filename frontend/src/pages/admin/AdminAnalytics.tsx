import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, PieChart, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalUsers: number;
  applicationsByStatus: Array<{ _id: string; count: number }>;
  jobsByDomain: Array<{ _id: string; count: number }>;
  monthlyRegistrations: Array<{ _id: { year: number; month: number }; count: number }>;
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

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'from-yellow-500 to-yellow-600';
      case 'Reviewed':
        return 'from-blue-500 to-blue-600';
      case 'Accepted':
        return 'from-green-500 to-green-600';
      case 'Rejected':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDomainColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-gray-500 to-gray-600'
    ];
    return colors[index % colors.length];
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-400">
          Failed to load analytics data
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights into platform performance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Total Internships</h3>
            <p className="text-2xl font-bold text-white mt-2">{analytics.totalJobs}</p>
            <p className="text-green-400 text-sm mt-1">{analytics.activeJobs} active</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Total Users</h3>
            <p className="text-2xl font-bold text-white mt-2">{analytics.totalUsers}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Applications</h3>
            <p className="text-2xl font-bold text-white mt-2">{analytics.totalApplications}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Success Rate</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {analytics.totalApplications > 0 
                ? Math.round((analytics.applicationsByStatus.find(s => s._id === 'Accepted')?.count || 0) / analytics.totalApplications * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Applications by Status */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center mb-6">
              <PieChart className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Applications by Status</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.applicationsByStatus.map((status, index) => {
                const percentage = analytics.totalApplications > 0 
                  ? (status.count / analytics.totalApplications) * 100 
                  : 0;
                
                return (
                  <div key={status._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">{status._id}</span>
                      <span className="text-white font-bold">{status.count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getStatusColor(status._id)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jobs by Domain */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Jobs by Domain</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.jobsByDomain.map((domain, index) => {
                const percentage = analytics.totalJobs > 0 
                  ? (domain.count / analytics.totalJobs) * 100 
                  : 0;
                
                return (
                  <div key={domain._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">{domain._id}</span>
                      <span className="text-white font-bold">{domain.count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getDomainColor(index)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-sm">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Registrations */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-purple-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Monthly User Registrations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {analytics.monthlyRegistrations.slice(-6).map((month, index) => {
              const maxCount = Math.max(...analytics.monthlyRegistrations.map(m => m.count));
              const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
              
              return (
                <div key={`${month._id.year}-${month._id.month}`} className="text-center">
                  <div className="bg-gray-700 rounded-lg h-32 flex items-end justify-center p-2 mb-2">
                    <div 
                      className="bg-gradient-to-t from-green-500 to-green-400 rounded w-full transition-all duration-500"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    ></div>
                  </div>
                  <div className="text-white font-bold text-lg">{month.count}</div>
                  <div className="text-gray-400 text-sm">
                    {getMonthName(month._id.month)} {month._id.year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 text-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Acceptance Rate</h3>
            <p className="text-3xl font-bold text-green-400">
              {analytics.totalApplications > 0 
                ? Math.round((analytics.applicationsByStatus.find(s => s._id === 'Accepted')?.count || 0) / analytics.totalApplications * 100)
                : 0}%
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Avg Applications per Job</h3>
            <p className="text-3xl font-bold text-blue-400">
              {analytics.totalJobs > 0 
                ? Math.round(analytics.totalApplications / analytics.totalJobs)
                : 0}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Active Job Ratio</h3>
            <p className="text-3xl font-bold text-purple-400">
              {analytics.totalJobs > 0 
                ? Math.round((analytics.activeJobs / analytics.totalJobs) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;