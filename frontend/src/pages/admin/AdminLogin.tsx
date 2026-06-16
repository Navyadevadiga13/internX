import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(formData.username, formData.password);
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          
        </div>

        {/* Back to Main Site */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;