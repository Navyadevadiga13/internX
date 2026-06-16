import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Clock, Loader, X, Edit, Trash2, AlertCircle, Search } from 'lucide-react';
import CompanySidebar from './CompanySidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  domain?: string;
  position: string;
  salary: string;
  type: string;
  duration: string;
  description?: string;
  requirements: string[];
  isActive: boolean;
  applicationCount: number;
  viewCount: number;
  featured: boolean;
  expiryDate?: Date;
  email: string;
  createdAt: string;
  updatedAt: string;
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

const CompanyInternships: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [checkingVerification, setCheckingVerification] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    domain: '',
    position: '',
    salary: '',
    type: 'Full-time',
    duration: '',
    description: '',
    requirements: '',
    expiryDate: ''
  });

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const response = await axios.get(`${API_BASE_URL}/company_profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsVerified(response.data.company.isVerified);
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  const fetchJobs = async (search?: string) => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const response = await axios.get(`${API_BASE_URL}/get_internships`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let filteredJobs = response.data.jobs || [];
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredJobs = filteredJobs.filter((job: Job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.domain?.toLowerCase().includes(searchLower) ||
          job.position.toLowerCase().includes(searchLower)
        );
      }
      setJobs(filteredJobs);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVerificationStatus();
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetchJobs(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      location: job.location,
      domain: job.domain || '',
      position: job.position,
      salary: job.salary,
      type: job.type,
      duration: job.duration,
      description: job.description || '',
      requirements: job.requirements.join('\n'),
      expiryDate: job.expiryDate ? new Date(job.expiryDate).toISOString().split('T')[0] : ''
    });
    setShowEditForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const requirementsArray = formData.requirements
        .split('\n')
        .filter(req => req.trim() !== '')
        .map(req => req.trim());
      const jobData = {
        ...formData,
        requirements: requirementsArray,
        expiryDate: formData.expiryDate || undefined
      };
      if (editingJob) {
        await axios.put(
          `${API_BASE_URL}/update_internships/${editingJob._id}`,
          jobData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        toast.success('Internship updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/add_internships`,
          jobData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        toast.success('Internship posted successfully!');
      }
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingJob(null);
      setFormData({
        title: '',
        location: '',
        domain: '',
        position: '',
        salary: '',
        type: 'Full-time',
        duration: '',
        description: '',
        requirements: '',
        expiryDate: ''
      });
      fetchJobs(searchQuery);
    } catch (error: any) {
      console.error('Error saving job:', error);
      if (error.response?.status === 403 && !error.response?.data?.verified) {
        toast.error(error.response.data.message, { duration: 6000, icon: '⚠️' });
        setShowAddForm(false);
        setShowEditForm(false);
      } else {
        toast.error(error.response?.data?.message || `Failed to ${editingJob ? 'update' : 'post'} internship`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      await axios.delete(`${API_BASE_URL}/delete_internships/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Internship deleted successfully');
      fetchJobs(searchQuery);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete internship');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 z-30">
        <CompanySidebar />
      </div>
      {/* Main Content */}
<main className="flex-1 w-full ml-0 md:ml-64 px-2 sm:px-4 lg:px-8 pt-16 md:pt-10 max-w-7xl mx-auto">

        {/* Header */}
<div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 md:p-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-2xl">
              <Briefcase className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold text-white">Internships</h1>
              <p className="text-gray-400 mt-2 text-sm md:text-base">Create and manage your internship postings</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isVerified) {
                toast.error('Please complete profile verification to post internships', {
                  icon: '⚠️',
                  duration: 4000,
                });
                return;
              }
              setShowAddForm(true);
            }}
            disabled={!isVerified || checkingVerification}
            className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all ${
              isVerified
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Post Internship</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        {/* Warning Banner */}
        {!checkingVerification && !isVerified && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-xl font-semibold text-yellow-400 mb-2">Account Not Verified</h3>
                <p className="text-yellow-300/90 mb-4 text-sm md:text-base">
                  Your company account is pending verification. Wait for admin approval to post internships.
                </p>
                <button
                  onClick={() => window.location.href = '/Company-Profile'}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 md:px-6 py-2 rounded-xl font-medium transition-all text-sm md:text-base"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Search Bar */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-2 md:p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, domain, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 md:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {/* Jobs List */}
        {loading ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 flex items-center justify-center">
            <Loader className="h-12 w-12 text-green-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
            <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No internships found' : 'No internships posted yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search query' : 'Start by posting your first internship opportunity'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  if (!isVerified) {
                    toast.error('Please complete profile verification to post internships', {
                      icon: '⚠️',
                      duration: 4000,
                    });
                    return;
                  }
                  setShowAddForm(true);
                }}
                disabled={!isVerified}
                className={`px-6 py-3 rounded-xl transition-all ${
                  isVerified
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Post First Internship
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[700px]">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Position</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Salary</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Applications</th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{job.title}</div>
                          <div className="text-xs text-gray-400">{job.company}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{job.position}</div>
                        {job.domain && <div className="text-xs text-gray-500">{job.domain}</div>}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-300">{job.location}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{job.salary}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-300">{job.duration}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          <div className="font-semibold text-green-400">{job.applicationCount}</div>
                          <div className="text-xs text-gray-500">{job.viewCount} views</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(job)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-700/30 px-4 md:px-6 py-3 border-t border-gray-600">
              <div className="text-sm text-gray-400">
                {searchQuery ? (
                  <>Found <span className="font-semibold text-white">{jobs.length}</span> internship{jobs.length !== 1 ? 's' : ''}</>
                ) : (
                  <>Total Internships: <span className="font-semibold text-white">{jobs.length}</span></>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Modal */}
        {(showAddForm || showEditForm) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-3xl w-full p-4 md:p-8 relative my-8">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingJob(null);
                  setFormData({
                    title: '',
                    location: '',
                    domain: '',
                    position: '',
                    salary: '',
                    type: 'Full-time',
                    duration: '',
                    description: '',
                    requirements: '',
                    expiryDate: ''
                  });
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">{editingJob ? 'Edit Internship' : 'Post New Internship'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Frontend Developer Intern"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please Add City,State,Country"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Junior Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Domain</label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Web Development"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Salary *</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., ₹15,000 - ₹25,000/month"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 3-6 months"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe the role, responsibilities, and what the intern will learn..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Requirements (one per line)</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="React.js experience&#10;Good communication skills&#10;Problem-solving mindset"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                      setEditingJob(null);
                      setFormData({
                        title: '',
                        location: '',
                        domain: '',
                        position: '',
                        salary: '',
                        type: 'Full-time',
                        duration: '',
                        description: '',
                        requirements: '',
                        expiryDate: ''
                      });
                    }}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>{editingJob ? 'Updating...' : 'Posting...'}</span>
                      </>
                    ) : (
                      <>
                        {editingJob ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        <span>{editingJob ? 'Update Internship' : 'Post Internship'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyInternships;
