import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Lock,
  Loader,
  Trash,
  Menu,
  X
} from 'lucide-react';
import CompanySidebar from './CompanySidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const CompanySettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('security');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Password fields & submit state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Deactivation type: temporary or permanent
  const [deactivationType, setDeactivationType] = useState<'temporary' | 'permanent'>('temporary');

  useEffect(() => {
    fetchCompanyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();

      if (!token) {
        toast.error('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/company_profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompanyData(response.data.company);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      const msg = error?.response?.data?.message || 'Failed to load company profile';
      toast.error(msg);
      if (error?.response?.status === 401) {
        localStorage.removeItem('companyToken');
        navigate('/company-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'account') {
      navigate('/Company-Profile');
    } else {
      setActiveTab(tab);
    }
    setMobileSidebarOpen(false);
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password should be at least 6 characters');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setSubmitting(true);
      const API_BASE_URL = getApiBaseUrl();
      const token = localStorage.getItem('companyToken');

      if (!token) {
        toast.error('Not authenticated. Please log in.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/company_reset_password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      toast.success(response?.data?.message || 'Password updated');
      resetForm();
    } catch (err: any) {
      console.error('Password reset error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update password';
      toast.error(msg);

      if (err?.response?.status === 401) {
        localStorage.removeItem('companyToken');
        navigate('/company-login');
      }
    } finally {
      setSubmitting(false);
    }
  };

const handleDeactivateAccount = async () => {
  const confirm = window.confirm(
    `Are you sure you want to ${
      deactivationType === 'temporary'
        ? 'temporarily deactivate your account for 2 days'
        : 'permanently delete your account'
    }?${deactivationType === 'permanent' ? ' This action cannot be undone.' : ''}`
  );
  if (!confirm) return;

  try {
    setLoading(true);
    const token = localStorage.getItem('companyToken');
    const API_BASE_URL = getApiBaseUrl();

    if (!token) {
      toast.error('Not authenticated. Please log in.');
      return;
    }

    const response = await axios.post(
      `${API_BASE_URL}/company_deactivate`,
      { type: deactivationType },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(response?.data?.message || 'Account deactivated successfully.');

    // Always logout after deactivation, both temporary and permanent
    localStorage.removeItem('companyToken');
    navigate('/company-login');
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Failed to deactivate account';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};


  return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-x-hidden">
      {/* Desktop fixed sidebar (unchanged) */}
      <div className=" md:block md:fixed md:top-0 md:left-0 md:w-64 md:h-full z-30">
        <CompanySidebar />
      </div>

      {/* Mobile sidebar slide-over (unchanged) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f1724] p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div />
              <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-md text-white hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CompanySidebar />
          </div>
        </div>
      )}

      {/* MAIN: center and expand content on large screens, responsive on small */}
      <main className="flex-1 w-full md:ml-64">
        {/* page container: full-bleed on very large screens, constrained and centered on medium */}
        <div className="max-w-full lg:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 md:pt-12 pb-12">
          {/* Header card */}
     {/* Header card (replace your current header card with this) */}
<div className="mb-6">
  <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl border border-green-500/30 p-4 sm:p-6 lg:p-8 w-full box-border overflow-visible">
  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
    <div className="flex items-center gap-4 min-w-0">
      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm flex-shrink-0">
        <Settings className="h-8 w-8 text-white" />
      </div>
      <div className="break-words">
        <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-white break-words">
          {getCurrentGreeting()}, {companyData?.name || 'Company'}! 👋
        </h1>
        <p className="text-green-100 text-xs sm:text-sm break-words">
          Manage your account settings and preferences
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3" />
  </div>
</div>

</div>


          {/* content navigation */}
          <div className="mb-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('account')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Account</span>
                </button>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'security' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Security</span>
                </button>
                <button
                  onClick={() => handleTabChange('deactivate')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'deactivate' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  <Trash className="h-4 w-4" />
                  <span className="text-sm">Deactivate Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* main card: expanded layout on large screens */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-5 sm:p-6 lg:p-8 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-10 w-10 text-green-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Security tab: on lg show fields in 3-column layout for compactness */}
                {activeTab === 'security' && (
                  <div className="max-w-full lg:max-w-5xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Security Settings</h2>
                    <p className="text-gray-400 text-sm mb-6">Change your password and manage security preferences</p>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs sm:text-sm mb-2">Current Password</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Current password"
                            autoComplete="current-password"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs sm:text-sm mb-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="New password (min 6 chars)"
                            autoComplete="new-password"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 text-xs sm:text-sm mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Repeat new password"
                            autoComplete="new-password"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} w-full sm:w-auto`}
                        >
                          {submitting ? 'Updating...' : 'Update Password'}
                        </button>

                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={submitting}
                          className="px-4 py-2 rounded-lg font-medium transition-all bg-gray-700 hover:bg-gray-600 text-white w-full sm:w-auto"
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Deactivate tab */}
                {activeTab === 'deactivate' && (
                  <div className="max-w-full lg:max-w-5xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Deactivate Account</h2>
                    <p className="text-gray-400 text-sm mb-4">Choose how you want to deactivate your account:</p>

                    <div className="space-y-4 mb-4">
                      <label className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deactivationType"
                          value="temporary"
                          checked={deactivationType === 'temporary'}
                          onChange={() => setDeactivationType('temporary')}
                          className="form-radio h-4 w-4 text-green-500 mt-1"
                        />
                     <span className="text-white">Temporary (disable for 2 days, then auto-reactivate)</span>

                      </label>

                      <label className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deactivationType"
                          value="permanent"
                          checked={deactivationType === 'permanent'}
                          onChange={() => setDeactivationType('permanent')}
                          className="form-radio h-4 w-4 text-red-500 mt-1"
                        />
                <span className="text-white">Permanent (delete account and data immediately)</span>

                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDeactivateAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg w-full sm:w-auto"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Deactivate Account'}
                      </button>
                      <button
                        onClick={() => setDeactivationType('temporary')}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanySettings;
