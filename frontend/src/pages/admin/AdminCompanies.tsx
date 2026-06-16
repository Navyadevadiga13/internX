import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Check, X, ChevronLeft, ChevronRight, Eye, Mail, Phone, MapPin, Globe, Calendar, Users, Briefcase, FileText, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Company {
  _id: string;
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
  logoUrl: string | null;
  size: string;
  founded: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API base URL
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

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage]);

  const fetchCompanies = async (page: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login as admin first');
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/admin/companies?page=${page}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCompanies(response.data.companies);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      console.error('Error fetching companies:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch companies');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (companyId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login as admin first');
        navigate('/admin/login');
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/admin/companies/${companyId}/verify`,
        { isVerified: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success(`Company ${!currentStatus ? 'verified' : 'unverified'} successfully!`);
      fetchCompanies(currentPage);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update verification status');
      }
    }
  };

  const handleDelete = async (companyId: string) => {
  if (!confirm('Are you sure you want to delete this company?')) return;

  try {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login as admin first');
      navigate('/admin/login');
      return;
    }

    await axios.delete(`${API_BASE_URL}/admin/companies/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    toast.success('Company deleted successfully!');
    fetchCompanies(currentPage);
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    } else {
      toast.error(error.response?.data?.message || 'Failed to delete company');
    }
  }
};


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Company Management</h1>
            <p className="text-gray-400">
              Manage registered companies and verification ({total} total)
            </p>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No companies registered yet.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        {company.logoUrl ? (
                          <img
                            src={`${API_BASE_URL.replace('/api', '')}${company.logoUrl}`}
                            alt={company.name}
                            className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedLogo(`${API_BASE_URL.replace('/api', '')}${company.logoUrl}`)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Logo';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                            No Logo
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{company.name}</div>
                        <div className="text-gray-400 text-sm">{company.contact}</div>
                      </td>

                      <td className="px-6 py-4 text-gray-300">{company.email}</td>
                      <td className="px-6 py-4 text-gray-300">{company.location}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleVerifyToggle(company._id, company.isVerified)}
                          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${company.isVerified
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          {company.isVerified ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Unverified
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedCompany(company)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(company._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && companies.length > 0 && (
            <div className="bg-gray-700/50 px-6 py-4 flex items-center justify-between border-t border-gray-700/50">
              <div className="text-sm text-gray-400">
                Showing page {currentPage} of {totalPages} ({total} total companies)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <span className="text-white font-medium px-4">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company Details Modal */}
        {selectedCompany && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCompany(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-gray-800 rounded-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {selectedCompany.logoUrl && (
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${selectedCompany.logoUrl}`}
                        alt={selectedCompany.name}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Logo';
                        }}
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedCompany.name}</h2>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium mt-2 ${selectedCompany.isVerified
                          ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                          : 'bg-red-500/20 text-red-100 border border-red-400/30'
                        }`}>
                        <span>{selectedCompany.isVerified ? '✓' : '⚠️'}</span>
                        <span>{selectedCompany.isVerified ? 'Verified' : 'Unverified'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>


              {/* Modal Body */}
              <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.email || 'Not Specified'}</p>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Phone className="h-4 w-4" />
                      <span>Contact Number</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.contact || 'Not Specified'}</p>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.location || 'Not Specified'}</p>
                  </div>

                  {/* Website */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </div>
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 text-lg hover:text-green-300 break-all"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      <p className="text-white text-lg">Not Specified</p>
                    )}
                  </div>

                  {/* Industry */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Industry</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.industry || 'Not Specified'}</p>
                  </div>

                  {/* Company Size */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Users className="h-4 w-4" />
                      <span>Company Size</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.size || 'Not Specified'}</p>
                  </div>

                  {/* Founded Year */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Founded Year</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.founded || 'Not Specified'}</p>
                  </div>

                  {/* Registration Date */}
                  <div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Registered On</span>
                    </div>
                    <p className="text-white text-lg">
                      {selectedCompany.createdAt
                        ? new Date(selectedCompany.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'Not Specified'
                      }
                    </p>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                      <FileText className="h-4 w-4" />
                      <span>Description</span>
                    </div>
                    <p className="text-white text-lg">{selectedCompany.description || 'Not Specified'}</p>
                  </div>

                  {/* Social Media - Always show section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* LinkedIn */}
                      <div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn</span>
                        </div>
                        {selectedCompany.linkedinUrl ? (
                          <a
                            href={selectedCompany.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {selectedCompany.linkedinUrl}
                          </a>
                        ) : (
                          <p className="text-white">Not Specified</p>
                        )}
                      </div>

                      {/* Twitter */}
                      <div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                          <Twitter className="h-4 w-4" />
                          <span>Twitter</span>
                        </div>
                        {selectedCompany.twitterUrl ? (
                          <a
                            href={selectedCompany.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 break-all"
                          >
                            {selectedCompany.twitterUrl}
                          </a>
                        ) : (
                          <p className="text-white">Not Specified</p>
                        )}
                      </div>

                      {/* Facebook */}
                      <div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                          <Facebook className="h-4 w-4" />
                          <span>Facebook</span>
                        </div>
                        {selectedCompany.facebookUrl ? (
                          <a
                            href={selectedCompany.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {selectedCompany.facebookUrl}
                          </a>
                        ) : (
                          <p className="text-white">Not Specified</p>
                        )}
                      </div>

                      {/* Instagram */}
                      <div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram</span>
                        </div>
                        {selectedCompany.instagramUrl ? (
                          <a
                            href={selectedCompany.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all"
                          >
                            {selectedCompany.instagramUrl}
                          </a>
                        ) : (
                          <p className="text-white">Not Specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ⬇️ ADD MODAL FOOTER HERE */}
              <div className="bg-gray-700/30 px-8 py-4 rounded-b-2xl border-t border-gray-700/50 flex items-center justify-between">
                <div className="text-gray-400 text-sm">
                  Company ID: {selectedCompany._id}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      handleVerifyToggle(selectedCompany._id, selectedCompany.isVerified);
                      setSelectedCompany({
                        ...selectedCompany,
                        isVerified: !selectedCompany.isVerified
                      });
                    }}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all ${
                      selectedCompany.isVerified
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    }`}
                  >
                    {selectedCompany.isVerified ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Unverify Company</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Verify Company</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Modal */}
        {selectedLogo && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLogo(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-gray-800 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLogo(null)}
                className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-2 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={selectedLogo}
                alt="Company Logo"
                className="w-full h-full object-contain p-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Logo+Not+Found';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCompanies;
