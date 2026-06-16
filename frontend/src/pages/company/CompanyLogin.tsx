import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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

const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();

  // Login states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Forgot password modal states
  const [fpStep, setFpStep] = useState<'requestOtp' | 'resetPassword'>('requestOtp');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpEmail, setFpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Handle login input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/login_company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('companyToken', data.token);
        localStorage.setItem('companyData', JSON.stringify(data.company));
        toast.success('Login successful!');
        navigate('/Company-Dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password: send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');

    if (!fpEmail) {
      setFpError('Please enter your company email');
      return;
    }

    setFpLoading(true);
    try {
      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(`${API_BASE_URL}/company-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent to your email');
        setFpStep('resetPassword');
      } else {
        setFpError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setFpError('Server error. Please try again later.');
      console.error(err);
    } finally {
      setFpLoading(false);
    }
  };

  // Forgot password: reset with OTP and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');

    if (!otp || !newPassword) {
      setFpError('Please enter OTP and new password');
      return;
    }

    if (newPassword.length < 6) {
      setFpError('Password must be at least 6 characters');
      return;
    }

    setFpLoading(true);
    try {
      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(`${API_BASE_URL}/company-forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful. Please login.');
        setIsForgotOpen(false);
        setFpStep('requestOtp');
        setOtp('');
        setNewPassword('');
        setFpEmail('');
      } else {
        setFpError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setFpError('Server error. Please try again later.');
      console.error(err);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
  <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Company Login</h2>
                  <p className="text-green-100 mt-1">Access your company account</p>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="company@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login to Company Account'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have a company account?{' '}
                  <Link to="/company-register" className="text-green-600 hover:text-green-700 font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto z-50">
  <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setIsForgotOpen(false);
                setFpStep('requestOtp');
                setFpError('');
                setFpEmail('');
                setOtp('');
                setNewPassword('');
              }}
              aria-label="Close"
            >
              ✕
            </button>

            {fpStep === 'requestOtp' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
                <p className="text-gray-600 mb-4">Enter your company email to receive a password reset OTP.</p>

                {fpError && <p className="text-red-600 mb-2">{fpError}</p>}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="fpEmail"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    placeholder="company@example.com"
                    className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={fpLoading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  {fpLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {fpStep === 'resetPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>

                {fpError && <p className="text-red-600">{fpError}</p>}

                <div>
                  <label className="block mb-1 font-medium">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block mb-1 font-medium">New Password</label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={fpLoading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  {fpLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyLogin;
