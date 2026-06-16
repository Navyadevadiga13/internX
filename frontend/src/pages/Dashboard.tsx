import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import banner from './banner_wizdom.jpg';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  School, 
  BookOpen, 
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  MapPin,
  Target,
  Globe,
  Award,
  TrendingUp,
  Eye,
  Building
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: number;
  };
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  appliedAt: string;
  coverLetter: string;
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

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state - Enhanced with all fields
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentCity: user?.currentCity || '',
    futureGoals: user?.futureGoals || '',
    studyPreference: user?.studyPreference || 'India',
    section: user?.section || '',
    higherEducation: user?.higherEducation || '',
    twelfthPU: {
      institution: user?.twelfthPU?.institution || '',
      passedYear: user?.twelfthPU?.passedYear || '',
      percentage: user?.twelfthPU?.percentage || ''
    },
    ugDegree: {
      institution: user?.ugDegree?.institution || '',
      course: user?.ugDegree?.course || '',
      year: user?.ugDegree?.year || '',
      percentage: user?.ugDegree?.percentage || ''
    },
    pgMasters: {
      institution: user?.pgMasters?.institution || '',
      course: user?.pgMasters?.course || '',
      year: user?.pgMasters?.year || '',
      percentage: user?.pgMasters?.percentage || ''
    },
    skills: user?.skills || [],
    keywords: user?.keywords || [],
    profilePicture: null as File | null,
    resume: null as File | null
  });

  const [skillInput, setSkillInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchApplications();
    if (user?.profilePicture) {
      setProfilePictureUrl(`${API_BASE_URL}/profile-picture/${user.id}`);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        currentCity: user.currentCity || '',
        futureGoals: user.futureGoals || '',
        studyPreference: user.studyPreference || 'India',
        section: user.section || '',
        higherEducation: user.higherEducation || '',
        twelfthPU: {
          institution: user.twelfthPU?.institution || '',
          passedYear: user.twelfthPU?.passedYear || '',
          percentage: user.twelfthPU?.percentage || ''
        },
        ugDegree: {
          institution: user.ugDegree?.institution || '',
          course: user.ugDegree?.course || '',
          year: user.ugDegree?.year || '',
          percentage: user.ugDegree?.percentage || ''
        },
        pgMasters: {
          institution: user.pgMasters?.institution || '',
          course: user.pgMasters?.course || '',
          year: user.pgMasters?.year || '',
          percentage: user.pgMasters?.percentage || ''
        },
        skills: user.skills || [],
        keywords: user.keywords || [],
        profilePicture: null,
        resume: null
      });
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/my-applications`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePicture' | 'resume') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file types
      if (type === 'resume' && file.type !== 'application/pdf') {
        toast.error('Please select a PDF file for resume');
        return;
      }
      if (type === 'profilePicture' && !file.type.startsWith('image/')) {
        toast.error('Please select an image file for profile picture');
        return;
      }
      
      setEditData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !editData.skills.includes(skillInput.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !editData.keywords.includes(keywordInput.trim())) {
      setEditData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setEditData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
      // Update profile picture URL if changed
      if (editData.profilePicture) {
        setProfilePictureUrl(`${API_BASE_URL}/profile-picture/${user?.id}?t=${Date.now()}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit data to current user data
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        currentCity: user.currentCity || '',
        futureGoals: user.futureGoals || '',
        studyPreference: user.studyPreference || 'India',
        section: user.section || '',
        higherEducation: user.higherEducation || '',
        twelfthPU: {
          institution: user.twelfthPU?.institution || '',
          passedYear: user.twelfthPU?.passedYear || '',
          percentage: user.twelfthPU?.percentage || ''
        },
        ugDegree: {
          institution: user.ugDegree?.institution || '',
          course: user.ugDegree?.course || '',
          year: user.ugDegree?.year || '',
          percentage: user.ugDegree?.percentage || ''
        },
        pgMasters: {
          institution: user.pgMasters?.institution || '',
          course: user.pgMasters?.course || '',
          year: user.pgMasters?.year || '',
          percentage: user.pgMasters?.percentage || ''
        },
        skills: user.skills || [],
        keywords: user.keywords || [],
        profilePicture: null,
        resume: null
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Reviewed':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'Accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'Pending').length,
      reviewed: applications.filter(app => app.status === 'Reviewed').length,
      accepted: applications.filter(app => app.status === 'Accepted').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
    };
  };

  const stats = getApplicationStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Promotional Banner */}


<div className="mb-8">
 <a href="https://www.wizx.org/enquiry" target="_blank" rel="noopener noreferrer">
  <img
    src={banner}
    alt="Study Free in Europe promotional banner"
    className="w-full rounded-3xl shadow-lg object-cover"
  />
</a>

</div>

        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
                <p className="text-green-100 text-lg">Track your career journey and manage your applications</p>
              </div>
             <div className="mt-6 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-green-100 text-sm">Total Applications</div>
                </div>        
              </div> 
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Enhanced Profile Section */}
          <div className="lg:col-span-4">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Profile Picture Upload */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-200 shadow-lg">
                        {profilePictureUrl ? (
                          <img 
                            src={profilePictureUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={() => setProfilePictureUrl(null)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <User className="h-16 w-16 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profilePicture')}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="cursor-pointer text-green-600 hover:text-green-700 text-sm flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Change Photo
                    </label>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
                    <input
                      type="text"
                      name="currentCity"
                      value={editData.currentCity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Study Preference</label>
                    <select
                      name="studyPreference"
                      value={editData.studyPreference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="India">Study in India</option>
                      <option value="Abroad">Study Abroad</option>
                      <option value="Both">Open to Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Future Goals</label>
                    <textarea
                      name="futureGoals"
                      value={editData.futureGoals}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Twelfth PU */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      12th/PU Education
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          name="twelfthPU.institution"
                          value={editData.twelfthPU.institution}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passed Year</label>
                        <input
                          type="text"
                          name="twelfthPU.passedYear"
                          value={editData.twelfthPU.passedYear}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                        <input
                          type="text"
                          name="twelfthPU.percentage"
                          value={editData.twelfthPU.percentage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UG Degree */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Undergraduate Degree
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          name="ugDegree.institution"
                          value={editData.ugDegree.institution}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <input
                          type="text"
                          name="ugDegree.course"
                          value={editData.ugDegree.course}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="text"
                          name="ugDegree.year"
                          value={editData.ugDegree.year}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                        <input
                          type="text"
                          name="ugDegree.percentage"
                          value={editData.ugDegree.percentage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PG Masters */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Postgraduate Degree
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          name="pgMasters.institution"
                          value={editData.pgMasters.institution}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <input
                          type="text"
                          name="pgMasters.course"
                          value={editData.pgMasters.course}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="text"
                          name="pgMasters.year"
                          value={editData.pgMasters.year}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                        <input
                          type="text"
                          name="pgMasters.percentage"
                          value={editData.pgMasters.percentage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'resume')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    {!user.resume && (
                      <p className="text-red-600 text-xs mt-1">Resume is required to apply for internships</p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-600" />
                      Skills
                    </h3>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="Add a skill"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 hover:shadow-md transition-all duration-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-600" />
                      Keywords
                    </h3>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="Add a keyword"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 hover:shadow-md transition-all duration-200"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-200 shadow-lg">
                        {profilePictureUrl ? (
                          <img 
                            src={profilePictureUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={() => setProfilePictureUrl(null)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <User className="h-16 w-16 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                    <p className="text-gray-600 text-lg">{user.email}</p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900">{user.phone}</div>
                      </div>
                    </div>

                    {user.currentCity && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Current City</div>
                          <div className="font-medium text-gray-900">{user.currentCity}</div>
                        </div>
                      </div>
                    )}

                    {user.studyPreference && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Study Preference</div>
                          <div className="font-medium text-gray-900">{user.studyPreference}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Education Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {user.twelfthPU?.institution && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <div className="flex items-start">
                            <School className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                              <div className="font-semibold text-gray-900">{user.twelfthPU.institution}</div>
                              {user.twelfthPU.passedYear && (
                                <div className="text-sm text-gray-600">Graduated: {user.twelfthPU.passedYear}</div>
                              )}
                              {user.twelfthPU.percentage && (
                                <div className="text-sm text-gray-600">Percentage: {user.twelfthPU.percentage}%</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {user.ugDegree?.institution && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                          <div className="flex items-start">
                            <BookOpen className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                            <div>
                              <div className="font-semibold text-gray-900">{user.ugDegree.institution}</div>
                              {user.ugDegree.course && (
                                <div className="text-sm text-gray-600">{user.ugDegree.course}</div>
                              )}
                              {user.ugDegree.year && (
                                <div className="text-sm text-gray-600">Year: {user.ugDegree.year}</div>
                              )}
                              {user.ugDegree.percentage && (
                                <div className="text-sm text-gray-600">Percentage: {user.ugDegree.percentage}%</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {user.pgMasters?.institution && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                          <div className="flex items-start">
                            <GraduationCap className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                            <div>
                              <div className="font-semibold text-gray-900">{user.pgMasters.institution}</div>
                              {user.pgMasters.course && (
                                <div className="text-sm text-gray-600">{user.pgMasters.course}</div>
                              )}
                              {user.pgMasters.year && (
                                <div className="text-sm text-gray-600">Year: {user.pgMasters.year}</div>
                              )}
                              {user.pgMasters.percentage && (
                                <div className="text-sm text-gray-600">Percentage: {user.pgMasters.percentage}%</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Future Goals */}
                  {user.futureGoals && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-green-600" />
                        Future Goals
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700 text-sm leading-relaxed">{user.futureGoals}</p>
                      </div>
                    </div>
                  )}

                  {/* Resume Status */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Resume
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm">
                        {user.resume ? (
                          <span className="text-green-600 font-medium">Uploaded</span>
                        ) : (
                          <span className="text-red-600 font-medium">Not uploaded</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-green-600" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 hover:shadow-md transition-all duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords Section */}
                  {user.keywords && user.keywords.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-green-600" />
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-300 hover:shadow-md transition-all duration-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Stats Cards */}
            {/* <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 text-center border border-yellow-200">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-800 mb-1">{stats.pending}</div>
                <div className="text-sm text-yellow-700 font-medium">Pending</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 text-center border border-blue-200">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-1">{stats.reviewed}</div>
                <div className="text-sm text-blue-700 font-medium">Reviewed</div>
              </div>
            </div> */}

            {/* Quick Action */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white text-center shadow-xl">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-200" />
              <h3 className="text-lg font-bold mb-2">Ready for More?</h3>
              <p className="text-green-100 text-sm mb-4">Explore new opportunities and advance your career</p>
              <a
                href="/internships"
                className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 inline-block"
              >
                Browse Internships
              </a>
            </div>
          </div>

          {/* Applications Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h2>
                  <p className="text-gray-600">Track the status of your job applications</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Live Updates</span>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Applications Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start your career journey by applying for internships and opportunities
                  </p>
                  <a
                    href="/internships"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
                  >
                    Explore Opportunities
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((application, index) => (
                    <div 
                      key={application._id} 
                      className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 mb-4 lg:mb-0">
                          <div className="flex items-start mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                              <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {application.jobId.title}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="font-medium">{application.jobId.company}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>{application.jobId.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-green-600 font-bold">₹{application.jobId.salary.toLocaleString()}</span>
                                  <span className="ml-1">per month</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center">
                            {getStatusIcon(application.status)}
                            <span className={`ml-3 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {application.coverLetter && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex items-center mb-3">
                            <FileText className="w-4 h-4 text-gray-500 mr-2" />
                            <h4 className="font-semibold text-gray-900">Cover Letter</h4>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                              {application.coverLetter}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;