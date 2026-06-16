import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  User,
  FileText,
  LogOut,
  Cog,
  Menu,
  X,
  ShieldCheck, // <- new import
  AlertTriangle, // <- fallback icon for unverified (optional)
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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

const getServerBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') return 'https://api.internx.cc';
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) return 'https://api.internx.cc';

    return 'http://localhost:5006';
  }
  return 'http://localhost:5006';
};

const CompanySidebar: React.FC = () => {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Building2, path: '/Company-Dashboard' },
    { id: 'internships', name: 'Internships', icon: Briefcase, path: '/Company-Internships' },
    { id: 'applications', name: 'Applications', icon: FileText, path: '/Company-Applications' },
    { id: 'profile', name: 'Profile', icon: User, path: '/Company-Profile' },
    { id: 'settings', name: 'Settings', icon: Cog, path: '/Company-Settings' },
  ];

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const API_BASE_URL = getApiBaseUrl();

        const response = await axios.get<{ message: string; company: Company }>(
          `${API_BASE_URL}/company_profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.company) {
          setCompanyData(response.data.company);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('companyToken');
    navigate('/Company-Login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile header with hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800/80 p-4 flex items-center justify-between md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
          className="text-white focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-white font-bold truncate max-w-xs">
          {loading ? 'Loading...' : companyData?.name || 'Company'}
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="text-red-400 hover:text-red-300"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      {/* Overlay on mobile */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      ></div>

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-800/75 backdrop-blur-xl border-r border-gray-700/50 flex flex-col z-50 transform transition-transform duration-300
          md:fixed md:translate-x-0 md:flex
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto
        `}
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between md:justify-start">
          <div className="flex items-center space-x-3 mb-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gray-700/50 border-2 border-gray-600 overflow-hidden flex items-center justify-center flex-shrink-0">
              {!loading && companyData?.logoUrl ? (
                <img
                  src={`${getServerBaseUrl()}${companyData.logoUrl}`}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="bg-gradient-to-r from-green-500 to-green-600 w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M6 3v18"/><path d="M18 3v18"/></svg></div>';
                    }
                  }}
                />
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>

            <div className="hidden md:block flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg truncate">
                {loading ? 'Loading...' : companyData?.name || 'Company'}
              </h2>
              {/* Classy verification badge placed under company name (subtle) */}
              {!loading && companyData && (
                <div
                  title={companyData.isVerified ? 'This company is verified' : 'This company is not verified'}
                  className={`mt-1 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium select-none
                    ${companyData.isVerified
                      ? 'bg-gradient-to-r from-green-600/10 to-transparent text-green-300 border border-green-600/20 shadow-sm'
                      : 'bg-amber-500/8 text-amber-300 border border-amber-500/15 shadow-sm'}
                    `}
                >
                  {companyData.isVerified ? (
                    <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className="truncate">
                    {companyData.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white"
            aria-label="Close Menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActivePath(item.path)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CompanySidebar;
