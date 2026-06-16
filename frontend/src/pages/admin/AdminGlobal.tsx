import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface GlobalJob {
  _id: string;
  country_name: string;
  company_name: string;
  link: string;
  continents: string;
  createdAt: string;
}

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc')
      return 'https://api.internx.cc/api';
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app'))
      return 'https://api.internx.cc/api';
    return 'http://localhost:5006/api';
  }
  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();

const AdminGlobal = () => {
  const [jobs, setJobs] = useState<GlobalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<GlobalJob | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    country_name: '',
    company_name: '',
    link: '',
    continents: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/globaljobs`);
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching global jobs', error);
      toast.error('Failed to fetch global jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        // Update existing job
        await axios.put(
          `${API_BASE_URL}/admin/globals/${editingJob._id}`,
          formData
        );
        toast.success('Global job updated successfully!');
      } else {
        // Create new job
        await axios.post(`${API_BASE_URL}/admin/globals`, formData);
        toast.success('Global job created successfully!');
      }
      setShowModal(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save global job');
    }
  };

  const handleEdit = (job: GlobalJob) => {
    setEditingJob(job);
    setFormData({
      country_name: job.country_name,
      company_name: job.company_name,
      link: job.link,
      continents: job.continents,
    });
    setShowModal(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this global job?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/globals/${jobId}`);
      toast.success('Global job deleted successfully!');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete global job');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs to delete');
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedJobs.length} selected global jobs? This cannot be undone.`
      )
    ) return;

    try {
      await axios.post(`${API_BASE_URL}/admin/globals/bulk-delete`, {
        jobIds: selectedJobs,
      });
      toast.success(`Deleted ${selectedJobs.length} global jobs`);
      setSelectedJobs([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to bulk delete global jobs');
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedJobs([]);
    else setSelectedJobs(jobs.map(job => job._id));
    setSelectAll(!selectAll);
  };

  const resetForm = () => {
    setFormData({
      country_name: '',
      company_name: '',
      link: '',
      continents: '',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Global Job Management</h1>
            <p className="text-gray-400">Create, edit, and manage global jobs</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {selectedJobs.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedJobs.length})
              </button>
            )}
            <button
              onClick={() => {
                resetForm();
                setEditingJob(null);
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Global Job
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                    Continent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">
                    Link
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No global jobs found. Create your first global job!
                    </td>
                  </tr>
                ) : (
                  jobs.map(job => (
                    <tr key={job._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job._id)}
                          onChange={() => handleSelectJob(job._id)}
                          className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-300">{job.country_name}</td>
                      <td className="px-6 py-4 text-gray-300">{job.company_name}</td>
                      <td className="px-6 py-4 text-gray-300">{job.continents}</td>
                      <td className="px-6 py-4 text-blue-400 hover:underline">
                        <a href={job.link} target="_blank" rel="noopener noreferrer">
                          Visit Link
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Global Job Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingJob ? 'Edit Global Job' : 'Add New Global Job'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country Name *</label>
                  <input
                    type="text"
                    name="country_name"
                    value={formData.country_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Link *</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Continent *</label>
                  <input
                    type="text"
                    name="continents"
                    value={formData.continents}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Bulk Delete</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {selectedJobs.length} selected global jobs? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Delete Jobs
                </button>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGlobal;
