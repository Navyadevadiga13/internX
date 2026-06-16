import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Mail, Save, Shield, AlertTriangle, Users, Briefcase, Globe } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const AdminSettings = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);
  
  const [profileData, setProfileData] = useState({
    username: admin?.username || '',
    email: admin?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    maxApplicationsPerUser: 3,
    emailNotifications: true,
    autoApproval: false,
    maintenanceMode: false,
    registrationEnabled: true,
    platformName: 'InternX',
    supportEmail: 'support@internx.io'
  });

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      setFetchingSettings(true);
      const response = await axios.get(`${API_BASE_URL}/admin/settings`);
      setSystemSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch system settings');
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsUpdate = async () => {
    setLoading(true);
    
    try {
      await axios.put(`${API_BASE_URL}/admin/settings`, systemSettings);
      toast.success('System settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'system', name: 'System Settings', icon: Settings },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  if (fetchingSettings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your admin account and system settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              
              {/* System Settings Tab */}
              {activeTab === 'system' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Settings className="h-6 w-6 text-green-400 mr-3" />
                    <h2 className="text-xl font-bold text-white">System Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    
                    {/* Application Limits */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Application Management
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Applications Per User
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={systemSettings.maxApplicationsPerUser}
                            onChange={(e) => handleSettingChange('maxApplicationsPerUser', parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Users can apply to a maximum of this many internships
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform Settings */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        Platform Configuration
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={systemSettings.platformName}
                            onChange={(e) => handleSettingChange('platformName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Support Email
                          </label>
                          <input
                            type="email"
                            value={systemSettings.supportEmail}
                            onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Feature Controls
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium">Email Notifications</h4>
                            <p className="text-gray-400 text-sm">Send email notifications for applications and updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={systemSettings.emailNotifications}
                              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium">Auto Approval</h4>
                            <p className="text-gray-400 text-sm">Automatically approve job applications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={systemSettings.autoApproval}
                              onChange={(e) => handleSettingChange('autoApproval', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium">User Registration</h4>
                            <p className="text-gray-400 text-sm">Allow new users to register</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={systemSettings.registrationEnabled}
                              onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-red-600/20 border border-red-500/50 rounded-xl">
                          <div>
                            <h4 className="text-white font-medium flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                              Maintenance Mode
                            </h4>
                            <p className="text-gray-400 text-sm">Put the site in maintenance mode (blocks user access)</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={systemSettings.maintenanceMode}
                              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSystemSettingsUpdate}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center mb-6">
                    <User className="h-6 w-6 text-green-400 mr-3" />
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Lock className="h-6 w-6 text-green-400 mr-3" />
                    <h2 className="text-xl font-bold text-white">Security Settings</h2>
                  </div>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;