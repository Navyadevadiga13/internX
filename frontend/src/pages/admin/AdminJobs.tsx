import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, FileSpreadsheet, Download, X, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  email: string;
  domain: string;
  position: string;
 salary: string;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  isActive: boolean;
  applicationCount: number;
  viewCount: number;
  featured: boolean;
  createdAt: string;
}

interface ExcelFile {
  _id: string;
  filename: string;
  originalName: string;
  jobsCreated: number;
  createdAt: string;
  uploadedBy: {
    username: string;
  };
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

const AdminJobs = () => {
  const [deleteLocation, setDeleteLocation] = useState('');
  const [deletingLocation, setDeletingLocation] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExcelFilesModal, setShowExcelFilesModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
 const [replaceOldLocation, setReplaceOldLocation] = useState('');
const [replaceNewLocation, setReplaceNewLocation] = useState('');
const [replacingLocation, setReplacingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    email: '',
    domain: '',
    position: '',
    salary: '',
    type: 'Full-time',
    duration: '',
    description: '',
    requirements: '',
    isActive: true,
    featured: false,
    expiryDate: ''
  });
  // --- SEARCH & AUTOCOMPLETE STATE ---
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    domain: '',
    position: '',
    minSalary: '',
    maxSalary: ''
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [domainSuggestions, setDomainSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const typingTimer = useRef<number | null>(null);

useEffect(() => {
  fetchJobs();
  fetchExcelFiles();
}, []);

useEffect(() => {
  fetchJobs();
}, [page]);

   const fetchJobs = async (overrides?: Partial<typeof searchParams>) => {
    setLoading(true);
    try {
      const params: any = { page, limit, ...searchParams, ...overrides };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === undefined) delete params[k];
      });

      const response = await axios.get(`${API_BASE_URL}/jobs`, { params });
      const data = response.data;

      if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
      } else {
        setJobs(data.jobs || []);
        const pages = data.pagination?.pages ?? 1;
        setTotalPages(pages);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };


  const fetchExcelFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/excel-files`);
      setExcelFiles(response.data);
    } catch (error) {
      console.error('Error fetching Excel files:', error);
    }
  };
    const handleSearchParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));

    if (name === 'domain' || name === 'location') startAutocomplete(name as 'domain' | 'location', value);
  };

  const startAutocomplete = (field: 'domain' | 'location', value: string) => {
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      doAutocomplete(field, value);
    }, 300);
  };

  const doAutocomplete = async (field: 'domain' | 'location', q: string) => {
    if (!q.trim()) return;
    try {
      const params: any = { autocomplete: true };
      params[field] = q;
      const resp = await axios.get(`${API_BASE_URL}/jobs`, { params });
      const suggestions = resp.data?.suggestions || [];
      if (field === 'domain') setDomainSuggestions(suggestions);
      else setLocationSuggestions(suggestions);
    } catch (err) {
      console.error('Autocomplete error', err);
    }
  };

  const applySuggestion = (field: 'domain' | 'location', value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
    if (field === 'domain') setDomainSuggestions([]);
    else setLocationSuggestions([]);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    fetchJobs({});
  };

  const handleClearFilters = () => {
    setSearchParams({
      search: '',
      location: '',
      domain: '',
      position: '',
      minSalary: '',
      maxSalary: ''
    });
    setDomainSuggestions([]);
    setLocationSuggestions([]);
    setPage(1);
    fetchJobs({});
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const jobData = {
        ...formData,
        salary: formData.salary,

        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        expiryDate: formData.expiryDate || null
      };

      if (editingJob) {
        await axios.put(`${API_BASE_URL}/admin/jobs/${editingJob._id}`, jobData);
        toast.success('Job updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/admin/jobs`, jobData);
        toast.success('Job created successfully!');
      }

      setShowModal(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      email:job.email,
      domain: job.domain,
      position: job.position,
      salary: job.salary, 
      type: job.type,
      duration: job.duration,
      description: job.description,
      requirements: job.requirements.join('\n'),
      isActive: job.isActive,
      featured: job.featured || false,
      expiryDate: ''
    });
    setShowModal(true);
  };




  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/jobs/${jobId}`);
      toast.success('Job deleted successfully!');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    }
  };


  const handleDeleteByLocation = async () => {
    if (!deleteLocation) {
      toast.error('Select a location.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete all jobs in "${deleteLocation}"? This cannot be undone.`)) return;
    setDeletingLocation(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/jobs/deletebylocation/${encodeURIComponent(deleteLocation)}`
      );
      toast.success(response.data?.message || 'Jobs deleted!');
      setDeleteLocation('');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete jobs by location.');
    } finally {
      setDeletingLocation(false);
    }
  };

const handleReplaceLocation = async () => {
  if (!replaceOldLocation || !replaceNewLocation) {
    toast.error('Please select the old location and enter a new location.');
    return;
  }

  if (!window.confirm(`Replace location "${replaceOldLocation}" with "${replaceNewLocation}" across all jobs? This cannot be undone.`)) {
    return;
  }

  setReplacingLocation(true);
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/jobs/replace_location`, {
      oldLocation: replaceOldLocation,
      newLocation: replaceNewLocation,
    });

    const msg = response.data?.message || `Replaced locations`;
    toast.success(msg);
    // clear inputs and refresh job list & unique locations
    setReplaceOldLocation('');
    setReplaceNewLocation('');
    fetchJobs();
  } catch (error: any) {
    console.error('Replace location error', error);
    toast.error(error.response?.data?.message || 'Failed to replace locations.');
  } finally {
    setReplacingLocation(false);
  }
};



  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedJobs.length} selected jobs?`)) return;

    try {
      await axios.post(`${API_BASE_URL}/admin/jobs/bulk-delete`, {
        jobIds: selectedJobs
      });
      toast.success(`Successfully deleted ${selectedJobs.length} jobs`);
      setSelectedJobs([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete jobs');
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job._id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!excelFile) {
      toast.error('Please select an Excel file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('excel', excelFile);

      const response = await axios.post(`${API_BASE_URL}/admin/jobs/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message);
      setShowBulkModal(false);
      setExcelFile(null);
      fetchJobs();
      fetchExcelFiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload jobs');
    } finally {
      setUploading(false);
    }
  };

  const downloadExcelFile = async (fileId: string, filename: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/excel-files/${fileId}/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Excel file downloaded successfully!');
    } catch (error: any) {
      toast.error('Failed to download Excel file');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      email:'',
      domain: '',
      position: '',
      salary: '',
      type: 'Full-time',
      duration: '',
      description: '',
      requirements: '',
      isActive: true,
      featured: false,
      expiryDate: ''
    });
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/jobs/${jobId}`, {
        isActive: !currentStatus
      });
      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update job status');
    }
  };
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location))).filter(Boolean);

  const filteredJobs = deleteLocation
    ? jobs.filter(job =>
      job.location &&
      job.location.toLowerCase() === deleteLocation.toLowerCase()
    )
    : jobs;


  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Management</h1>
            <p className="text-gray-400">Create, edit, and manage internship opportunities</p>
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
              onClick={() => setShowExcelFilesModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel Files
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingJob(null);
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </button>
          </div>

        </div>
                {/* SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            name="search"
            value={searchParams.search}
            onChange={handleSearchParamChange}
            placeholder="Search title or domain..."
            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
          />

          <div className="relative">
            <input
              name="domain"
              value={searchParams.domain}
              onChange={handleSearchParamChange}
              placeholder="Domain (autocomplete)"
              className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
              autoComplete="off"
            />
            {domainSuggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 mt-1 rounded">
                {domainSuggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => applySuggestion('domain', s)}
                    className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              name="location"
              value={searchParams.location}
              onChange={handleSearchParamChange}
              placeholder="Location (autocomplete)"
              className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
              autoComplete="off"
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 mt-1 rounded">
                {locationSuggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => applySuggestion('location', s)}
                    className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            name="position"
            value={searchParams.position}
            onChange={handleSearchParamChange}
            placeholder="Position"
            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
          <input
            name="minSalary"
            value={searchParams.minSalary}
            onChange={handleSearchParamChange}
            placeholder="Min salary"
            type="number"
            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
          <input
            name="maxSalary"
            value={searchParams.maxSalary}
            onChange={handleSearchParamChange}
            placeholder="Max salary"
            type="number"
            className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-700 text-white"
          />

          <div className="flex space-x-2 md:col-span-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
            >
              Clear
            </button>
            <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
              <div>Page</div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Prev
              </button>
              <div className="px-3 py-1 bg-gray-800 rounded">{page}</div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Next
              </button>
            </div>
          </div>
        </form>

        {/* filter and delete */}

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
  {/* Delete by location */}
  <div className="flex items-center gap-2">
    <select
      className="px-2 py-2 rounded border border-gray-600 text-gray-900"
      value={deleteLocation}
      onChange={e => setDeleteLocation(e.target.value)}
      style={{ minWidth: '180px' }}
    >
      <option value="">All Locations</option>
      {uniqueLocations.map(loc => (
        <option key={loc} value={loc}>{loc}</option>
      ))}
    </select>
    <button
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
      onClick={handleDeleteByLocation}
      disabled={deletingLocation || !deleteLocation}
    >
      {deletingLocation ? 'Deleting...' : `Delete "${deleteLocation}" Jobs`}
    </button>
  </div>

  {/* Replace location */}
  <div className="flex items-center gap-2">
    <select
      className="px-2 py-2 rounded border border-gray-600 text-gray-900"
      value={replaceOldLocation}
      onChange={e => setReplaceOldLocation(e.target.value)}
      style={{ minWidth: '180px' }}
    >
      <option value="">Select old location</option>
      {uniqueLocations.map(loc => (
        <option key={loc} value={loc}>{loc}</option>
      ))}
    </select>

    <input
      type="text"
      placeholder="New location (e.g., New York City)"
      value={replaceNewLocation}
      onChange={e => setReplaceNewLocation(e.target.value)}
      className="px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white"
      style={{ minWidth: '220px' }}
    />

    <button
      className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded font-medium"
      onClick={handleReplaceLocation}
      disabled={replacingLocation || !replaceOldLocation || !replaceNewLocation}
    >
      {replacingLocation ? 'Replacing...' : `Replace`}
    </button>
  </div>
</div>


        {/* start */}


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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No jobs found. Create your first job posting!
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job._id)}
                          onChange={() => handleSelectJob(job._id)}
                          className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium flex items-center">
                            {job.title}
                            {job.featured && (
                              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-sm">{job.domain} • {job.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{job.company}</td>
                      <td className="px-6 py-4 text-gray-300">{job.location}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {job.email ? job.email : <span className="italic text-gray-500">N/A</span>}
                      </td>

                      <td className="px-6 py-4 text-gray-300">₹{job.salary.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div>Applications: {job.applicationCount || 0}</div>
                          <div>Views: {job.viewCount || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleJobStatus(job._id, job.isActive)}
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${job.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          {job.isActive ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
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

        {/* Add/Edit Job Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingJob ? 'Edit Job' : 'Add New Internship'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Domain *</label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Salary (₹) *</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 3 months, 6 months"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requirements (one per line)</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Bachelor's degree in Computer Science&#10;Experience with React&#10;Strong communication skills"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label className="ml-2 text-sm text-gray-300">Active (visible to users)</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label className="ml-2 text-sm text-gray-300">Featured job</label>
                  </div>
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
                Are you sure you want to delete {selectedJobs.length} selected jobs? This action cannot be undone.
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

        {/* Bulk Upload Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Bulk Upload Jobs</h2>

              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Excel File *</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Excel should include columns: title, company, location, domain, position, salary, description, requirements, duration, type,email
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Jobs'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkModal(false);
                      setExcelFile(null);
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

        {/* Excel Files Modal */}
        {showExcelFilesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Uploaded Excel Files</h2>
                <button
                  onClick={() => setShowExcelFilesModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">File Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Jobs Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Uploaded By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Upload Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {excelFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No Excel files uploaded yet
                        </td>
                      </tr>
                    ) : (
                      excelFiles.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 text-white">{file.originalName}</td>
                          <td className="px-4 py-3 text-gray-300">{file.jobsCreated}</td>
                          <td className="px-4 py-3 text-gray-300">{file.uploadedBy.username}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => downloadExcelFile(file._id, file.originalName)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Download File"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;