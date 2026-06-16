import React, { useState, useEffect } from 'react';
import { FileText, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Loader, Download, Briefcase, User as UserIcon, Eye } from 'lucide-react';
import CompanySidebar from './CompanySidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentCity: string;
  pinCode: string;
  skills: string[];
  resume?: string;
  twelfthPU: { institution: string; passedYear?: string; percentage?: string; };
  ugDegree: { institution: string; course?: string; year?: string; percentage?: string; };
  pgMasters?: { institution?: string; course?: string; year?: string; percentage?: string; };
  currentAcademicStatus: string;
  profilePicture?: string;
}

interface Application {
  _id: string;
  status: 'Pending' | 'sent' | 'undelivered' | 'application received' | 'received' | 'rejected' | 'selected';
  coverLetter?: string;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  jobId: { _id: string; title: string; company: string; location: string; position: string; };
  userId: User;
  createdAt: string;
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

const CompanyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'selected' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const response = await axios.get(`${API_BASE_URL}/get_applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications || []);
    } catch (error: any) {
      toast.error('Failed to load applications');
    } finally { setLoading(false); }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'Pending' | 'selected' | 'rejected') => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      await axios.patch(
        `${API_BASE_URL}/update_application_status/${applicationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Application ${status} successfully`);
      fetchApplications();
    } catch {
      toast.error('Failed to update application status');
    }
  };

  const downloadResume = async (userId: string, userName: string) => {
    try {
      const token = localStorage.getItem('companyToken');
      const API_BASE_URL = getApiBaseUrl();
      const response = await axios.get(`${API_BASE_URL}/resume/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded successfully!');
    } catch { toast.error('Failed to download resume'); }
  };
const filteredApplications = applications.filter(app => {
  if (filter === 'all') return true;
  if (filter === 'Pending') {
    // Treat anything not 'selected' or 'rejected' as Pending
    return app.status !== 'selected' && app.status !== 'rejected';
  }
  return app.status === filter;
});


const getStats = () => ({
  total: applications.length,
  pending: applications.filter(app => app.status !== 'selected' && app.status !== 'rejected').length,
  selected: applications.filter(app => app.status === 'selected').length,
  rejected: applications.filter(app => app.status === 'rejected').length
});

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col md:flex-row">
      {/* Sidebar: fixed on desktop, togglable for mobile inside CompanySidebar */}
      <div className="md:fixed md:top-0 md:left-0 md:w-64 md:h-full z-30">
        <CompanySidebar />
      </div>
      {/* Main content */}
      <main className="flex-1 w-full px-2 sm:px-4 md:px-8 pt-16 md:pt-10 ml-0 md:ml-64 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 md:p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Applications</h1>
              <p className="text-gray-400 mt-2">Manage applications for your posted internships</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <FileText className="h-12 w-12 text-gray-600" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selected</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.selected}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
              </div>
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs (responsive) */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            {(['all', 'Pending', 'selected', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  filter === status
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 flex items-center justify-center">
            <Loader className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="text-gray-400">No {filter !== 'all' ? filter : ''} applications yet</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredApplications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-700/30 transition-colors">
                      {/* Candidate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {application.userId?.profilePicture ? (
                            <img
                              src={application.userId.profilePicture}
                              alt={application.userId.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{application.userId?.name}</div>
                            <div className="text-xs text-gray-400">{application.userId?.currentAcademicStatus}</div>
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{application.jobId?.title}</div>
                        <div className="text-xs text-gray-400">{application.jobId?.position}</div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-300">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="truncate max-w-[150px]">{application.userId?.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-300">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{application.userId?.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm text-gray-300">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{application.userId?.currentCity}</span>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm text-gray-300">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application._id, e.target.value as 'Pending' | 'selected' | 'rejected')}
                          className={`w-32 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all focus:outline-none focus:ring-2 bg-transparent ${
                            application.status === 'selected'
                              ? 'text-green-400 border-green-500/30 focus:ring-green-500/50'
                              : application.status === 'rejected'
                              ? 'text-red-400 border-red-500/30 focus:ring-red-500/50'
                              : 'text-yellow-400 border-yellow-500/30 focus:ring-yellow-500/50'
                          }`}
                        >
                          <option value="Pending" className="bg-gray-800 text-yellow-400">Pending</option>
                          <option value="selected" className="bg-gray-800 text-green-400">Selected</option>
                          <option value="rejected" className="bg-gray-800 text-red-400">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'selected')}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                title="Select"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table Footer */}
            <div className="bg-gray-700/30 px-6 py-3 border-t border-gray-600">
              <div className="text-sm text-gray-400">
                Showing <span className="font-semibold text-white">{filteredApplications.length}</span> of <span className="font-semibold text-white">{applications.length}</span> applications
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Application Details</h2>
              {/* Candidate Info */}
              <div className="flex items-start space-x-4 mb-6">
                {selectedApplication.userId?.profilePicture ? (
                  <img
                    src={selectedApplication.userId.profilePicture}
                    alt={selectedApplication.userId.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedApplication.userId?.name}</h3>
                  <p className="text-gray-400">Applied for: {selectedApplication.jobId?.title}</p>
                  <p className="text-sm text-gray-500">{selectedApplication.userId?.currentAcademicStatus}</p>
                </div>
              </div>

              {/* Contact & Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-gray-500">Email:</span> {selectedApplication.userId?.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedApplication.userId?.phone}</p>
                    <p><span className="text-gray-500">Location:</span> {selectedApplication.userId?.currentCity}, {selectedApplication.userId?.pinCode}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedApplication.userId?.skills && selectedApplication.userId.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.userId.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Cover Letter</h4>
                  <p className="text-gray-300 bg-gray-700/30 p-4 rounded-lg text-sm">{selectedApplication.coverLetter}</p>
                </div>
              )}

              {/* Resume Download */}
              {selectedApplication.userId?.resume && (
                <div>
                  <button
                    onClick={() => downloadResume(selectedApplication.userId._id, selectedApplication.userId.name)}
                    className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Resume</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyApplications;
