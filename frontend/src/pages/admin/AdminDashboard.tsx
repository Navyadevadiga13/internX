import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Shield,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalUsers: number;
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

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Internship',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Internships',
      value: stats.activeJobs,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Internship',
      description: 'Create and publish new internship opportunities',
      icon: Briefcase,
      link: '/admin/jobs',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Manage Applications',
      description: 'Review and process job applications',
      icon: FileText,
      link: '/admin/applications',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Monitor platform performance and metrics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {admin.username}!</h1>
              <p className="text-gray-300">Here's what's happening with your internship portal today.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <Shield className="h-12 w-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`bg-gradient-to-r ${card.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{card.title}</p>
                    <p className="text-white text-2xl font-bold">
                      {loading ? '...' : card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-900 font-medium">Database</span>
                </div>
                <span className="text-green-600 font-semibold">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-900 font-medium">Email Service</span>
                </div>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-900 font-medium">File Storage</span>
                </div>
                <span className="text-green-600 font-semibold">Available</span>
              </div>
            </div>
          </div>

          {/* Platform Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Platform Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Response Time</span>
                <span className="text-2xl font-bold text-blue-600">2.3s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="text-2xl font-bold text-purple-600">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;