import React, { useState, useEffect } from 'react';
import { Building2,Briefcase,User,FileText, Mail,Phone,MapPin,Globe,Calendar, Users,Save,Loader, X,Edit,Linkedin,Twitter,Facebook, Instagram,} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CompanySidebar from './CompanySidebar'; // Import the sidebar

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

const CompanyProfile: React.FC = () => {
  const [companyData, setCompanyData] = useState<Company>({
    name: '',
    location: '',
    website: '',
    email: '',
    contact: '',
    description: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    industry: '',
    isVerified: false,
    logoUrl: '',
    size: '',
    founded: undefined,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    const fields = [
      companyData.name,
      companyData.email,
      companyData.contact,
      companyData.location,
      companyData.website,
      companyData.logoUrl,
      companyData.industry,
      companyData.size,
      companyData.founded,
      companyData.description,
      companyData.linkedinUrl,
      companyData.twitterUrl,
      companyData.facebookUrl,
      companyData.instagramUrl,
    ];

    const filledFields = fields.filter((field) => field && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const API_BASE_URL = getApiBaseUrl();

        const response = await axios.get<{ message: string; company: Company }>(`${API_BASE_URL}/company_profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.company) setCompanyData(response.data.company);
      } catch (error) {
        console.error('Error fetching company profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: name === 'founded' ? (value ? parseInt(value as string, 10) : undefined) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();

      const response = await axios.put(`${API_BASE_URL}/company_profile`, companyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Profile updated successfully!');
      if (response.data.company) setCompanyData(response.data.company);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const resolveLogoSrc = (logoUrl?: string) => {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${getServerBaseUrl()}${logoUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      {/* Sidebar unchanged — keep it fixed as in your original design */}
      <div className="md:fixed md:top-0 md:left-0 md:w-64 md:h-full z-30">
        <CompanySidebar />
      </div>

      {/* MAIN: use md:ml-64 so on desktop main content sits to the right of fixed sidebar,
          and on smaller screens it's full width (no forced left margin). */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-20 md:pt-10 md:ml-64">
        {/* NOTE: removed any extra inner ml-64 that caused double offset on mobile */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {loading ? (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading profile...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-4 md:p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white font-bold text-2xl mb-1 flex items-center">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg mr-3">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        Profile Completion
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Complete your profile to <span className="text-green-400 font-medium">verify your account faster</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" strokeWidth="8" stroke="rgba(255,255,255,0.06)" fill="transparent" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${profileCompletion * 2.64} 264`}
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            stroke={profileCompletion === 100 ? '#10b981' : profileCompletion >= 75 ? '#3b82f6' : profileCompletion >= 50 ? '#f59e0b' : '#ef4444'}
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${profileCompletion === 100 ? 'text-green-400' : profileCompletion >= 75 ? 'text-blue-400' : profileCompletion >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {profileCompletion}%
                          </span>
                        </div>
                      </div>

                    <div className="hidden sm:block text-right">
  {profileCompletion === 100 ? (
    <>
      <p className="font-medium text-green-300">Profile Complete!</p>
      <p className="text-gray-400 text-sm mt-1">Your profile is ready for verification. Great job!</p>
    </>
  ) : (
    <>
      <p className={`font-medium ${profileCompletion >= 75 ? 'text-blue-300' : profileCompletion >= 50 ? 'text-yellow-300' : 'text-red-300'}`}>
        {profileCompletion >= 75 ? 'Almost there!' : profileCompletion >= 50 ? 'Good progress!' : "Let's get started!"}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        {profileCompletion >= 75 ? "Just a few more details to go." : profileCompletion >= 50 ? 'Keep filling in your details.' : 'Complete your basic information to improve visibility.'}
      </p>
    </>
  )}
</div>

                    </div>
                  </div>

                  {/* small-screen summary */}
                  <div className="mt-4 sm:hidden">
                    <p className="text-gray-400 text-sm">{profileCompletion === 100 ? 'Profile Complete!' : `Progress: ${profileCompletion}%`}</p>
                  </div>
                </div>
              </div>

              {/* Header card */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 md:p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                  {/* Logo */}
                  <div
                    className="relative w-32 h-32 flex-shrink-0 cursor-pointer group mb-4 md:mb-0"
                    onClick={() => companyData.logoUrl && setSelectedLogo(resolveLogoSrc(companyData.logoUrl))}
                  >
                    <div className="w-full h-full rounded-full bg-gray-700/50 border-4 border-gray-600 group-hover:border-green-500 transition-all overflow-hidden flex items-center justify-center p-3">
                      {companyData.logoUrl ? (
                        <img
                          src={resolveLogoSrc(companyData.logoUrl)}
                          alt="Company Logo"
                          className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Logo'; }}
                        />
                      ) : (
                        <Building2 className="h-16 w-16 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 truncate">{companyData.name || 'Unnamed Company'}</h1>

                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mb-4 ${companyData.isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {companyData.isVerified ? (
                        <>
                          <span className="text-xs">✓</span>
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">⚠️</span>
                          <span>Unverified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit button (keeps original styling) */}
                  <div className="mt-3 md:mt-0">
                    <button
                      onClick={() => setIsEditing((s) => !s)}
                      className="flex items-center space-x-1.5 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all border border-gray-600 hover:border-gray-500"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm font-medium">{isEditing ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable form */}
              {isEditing && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 md:p-8 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Company Name */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Building2 className="h-4 w-4" />
                        <span>Company Name <span className="text-red-400">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={companyData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Enter company name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Mail className="h-4 w-4" />
                        <span>Email <span className="text-red-400">*</span></span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={companyData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                        placeholder="company@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Phone className="h-4 w-4" />
                        <span>Contact Number <span className="text-red-400">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="contact"
                        value={companyData.contact}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location <span className="text-red-400">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={companyData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="City, Country"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Globe className="h-4 w-4" />
                        <span>Website <span className="text-red-400">*</span></span>
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={companyData.website}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Industry</span>
                      </label>
                      <select
                        name="industry"
                        value={companyData.industry || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Company Size */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Users className="h-4 w-4" />
                        <span>Company Size</span>
                      </label>
                      <select
                        name="size"
                        value={companyData.size || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>

                    {/* Founded */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Founded Year</span>
                      </label>
                      <input
                        type="number"
                        name="founded"
                        value={companyData.founded || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="2020"
                        min={70}
                        max={new Date().getFullYear()}
                      />
                    </div>

                    {/* Description */}
              {/* Read-only description — replaces the previous <p> */}
{/* Description (read-only) */}
<div className="md:col-span-2">
  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
    <FileText className="h-4 w-4" />
    <span className="font-medium">Description</span>
  </div>

  <div className="w-full">
    <p
      className="text-white text-sm md:text-lg leading-relaxed
                 whitespace-pre-wrap break-words
                 max-h-48 sm:max-h-72 overflow-auto pr-2"
      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
    >
      {companyData.description ? companyData.description : 'Not Mentioned'}
    </p>
  </div>
</div>



                    {/* Social media */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Social Media Links</h3>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Linkedin className="h-4 w-4" /> <span>LinkedIn URL</span></label>
                      <input name="linkedinUrl" value={companyData.linkedinUrl || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Twitter className="h-4 w-4" /> <span>Twitter URL</span></label>
                      <input name="twitterUrl" value={companyData.twitterUrl || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Facebook className="h-4 w-4" /> <span>Facebook URL</span></label>
                      <input name="facebookUrl" value={companyData.facebookUrl || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-gray-400 text-sm mb-2"><Instagram className="h-4 w-4" /> <span>Instagram URL</span></label>
                      <input name="instagramUrl" value={companyData.instagramUrl || ''} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white" />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all">
                      <span>Cancel</span>
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Read-only view */}
              {!isEditing && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Mail className="h-4 w-4" /><span>Email</span></div>
                      <p className="text-white text-lg">{companyData.email || 'Not Mentioned'}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Phone className="h-4 w-4" /><span>Contact Number</span></div>
                      <p className="text-white text-lg">{companyData.contact || 'Not Mentioned'}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><MapPin className="h-4 w-4" /><span>Location</span></div>
                      <p className="text-white text-lg">{companyData.location || 'Not Mentioned'}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Globe className="h-4 w-4" /><span>Website</span></div>
                      {companyData.website ? (
                        <a href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`} target="_blank" rel="noopener noreferrer" className="text-green-400 text-lg hover:text-green-300 break-all">
                          {companyData.website}
                        </a>
                      ) : (
                        <p className="text-white text-lg">Not Mentioned</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Briefcase className="h-4 w-4" /><span>Industry</span></div>
                      <p className="text-white text-lg">{companyData.industry || 'Not Mentioned'}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Users className="h-4 w-4" /><span>Company Size</span></div>
                      <p className="text-white text-lg">{companyData.size || 'Not Mentioned'}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2"><Calendar className="h-4 w-4" /><span>Founded Year</span></div>
                      <p className="text-white text-lg">{companyData.founded || 'Not Mentioned'}</p>
                    </div>

               <textarea
  name="description"
  value={companyData.description || ''}
  onChange={handleInputChange}
  rows={4}
  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all
             text-sm md:text-base leading-relaxed
             whitespace-pre-wrap break-words
             min-h-[120px] md:min-h-[140px] resize-y md:resize-none"
  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
  placeholder="Tell us about your company..."
/>


                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Linkedin className="h-4 w-4" /><span>LinkedIn</span></div>
                          {companyData.linkedinUrl ? (<a href={companyData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 break-all">{companyData.linkedinUrl}</a>) : (<p className="text-white">Not Mentioned</p>)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Twitter className="h-4 w-4" /><span>Twitter</span></div>
                          {companyData.twitterUrl ? (<a href={companyData.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 break-all">{companyData.twitterUrl}</a>) : (<p className="text-white">Not Mentioned</p>)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Facebook className="h-4 w-4" /><span>Facebook</span></div>
                          {companyData.facebookUrl ? (<a href={companyData.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 break-all">{companyData.facebookUrl}</a>) : (<p className="text-white">Not Mentioned</p>)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Instagram className="h-4 w-4" /><span>Instagram</span></div>
                          {companyData.instagramUrl ? (<a href={companyData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 break-all">{companyData.instagramUrl}</a>) : (<p className="text-white">Not Mentioned</p>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {/* Logo modal */}
          {selectedLogo && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLogo(null)}>
              <div className="relative max-w-4xl max-h-[90vh] bg-gray-800 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedLogo(null)} className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-2 transition-colors z-10">
                  <X className="h-6 w-6" />
                </button>
                <img src={selectedLogo} alt="Company Logo" className="w-full h-full object-contain p-8" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Logo+Not+Found'; }} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
