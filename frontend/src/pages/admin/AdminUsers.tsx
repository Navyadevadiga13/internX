import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Search, Download, Filter, X, Shield, ShieldOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentCity: string;
  pinCode:string,
  futureGoals: string;
  section: string;
  higherEducation: string;
  twelfthPU: {
    institution: string;
    passedYear: string;
    percentage: string;
  };
  ugDegree: {
    institution: string;
    course: string;
    year: string;
    percentage: string;
  };
  pgMasters: {
    institution: string;
    course: string;
    year: string;
    percentage: string;
  };
  currentAcademicStatus:string;
  skills: string[];
  keywords: string[];
  applicationCount: number;
  isBlocked: boolean;
  createdAt: string;
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

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
const [limit, setLimit] = useState(100);
const [total, setTotal] = useState(0);



  // Date filter states
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

useEffect(() => {
  fetchUsers();
}, [page, limit]);


  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        (user.currentCity && user.currentCity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (startDate && userDate < startDate) return false;
        if (endDate && userDate > endDate) return false;
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, dateFilter]);

const fetchUsers = async () => {
  setLoading(true);
  try {
    const adminToken = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const { users: usersData, total } = response.data;
    setUsers(usersData);
    setFilteredUsers(usersData);
    setTotal(total);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
  } finally {
    setLoading(false);
  }
};




  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/users/${userId}/block`, { isBlocked });
      toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully!`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDownloadUsers = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);

      const response = await axios.get(`${API_BASE_URL}/admin/users/download?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      let filename = 'users_data';
      if (dateFilter.startDate && dateFilter.endDate) {
        filename += `_${dateFilter.startDate}_to_${dateFilter.endDate}`;
      } else if (dateFilter.startDate) {
        filename += `_from_${dateFilter.startDate}`;
      } else if (dateFilter.endDate) {
        filename += `_until_${dateFilter.endDate}`;
      }
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Users data downloaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download users data');
    } finally {
      setDownloading(false);
    }
  };

  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setShowFilterModal(false);
  };

  const applyDateFilter = () => {
    setShowFilterModal(false);
    toast.success('Date filter applied successfully!');
  };

  const getFilteredCount = () => {
    if (dateFilter.startDate || dateFilter.endDate) {
      return filteredUsers.length;
    }
    return users.length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">View and manage registered users</p>
          </div>
          
          {/* Actions */}
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Date Filter
              {(dateFilter.startDate || dateFilter.endDate) && (
                <span className="ml-2 bg-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
              )}
            </button>
            
            {/* Download Button */}
            <button
              onClick={handleDownloadUsers}
              disabled={downloading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>
        </div>

        {/* Filter Info */}
        {(dateFilter.startDate || dateFilter.endDate) && (
          <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-blue-300">
                  Filtered by date: 
                  {dateFilter.startDate && ` From ${new Date(dateFilter.startDate).toLocaleDateString()}`}
                  {dateFilter.endDate && ` To ${new Date(dateFilter.endDate).toLocaleDateString()}`}
                  {` (${getFilteredCount()} users)`}
                </span>
              </div>
              <button
                onClick={clearDateFilter}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Total Users</h3>
<p className="text-2xl font-bold text-white mt-2">
  {dateFilter.startDate || dateFilter.endDate ? getFilteredCount() : total}
</p>

            {(dateFilter.startDate || dateFilter.endDate) && (
              <p className="text-sm text-gray-400 mt-1">Filtered from {users.length} total</p>
            )}
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">With Education</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {filteredUsers.filter(user => user.ugDegree?.institution).length}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">With Location</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {filteredUsers.filter(user => user.currentCity).length}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <ShieldOff className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">Blocked Users</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {filteredUsers.filter(user => user.isBlocked).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      {searchTerm || dateFilter.startDate || dateFilter.endDate 
                        ? 'No users found matching your filters.' 
                        : 'No users found.'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            {user.skills && user.skills.length > 0 && (
                              <div className="text-gray-400 text-sm">
                                {user.skills.slice(0, 2).join(', ')}
                                {user.skills.length > 2 && ` +${user.skills.length - 2} more`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">
                          <div className="flex items-center mb-1">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.currentCity ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{user.currentCity}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {user.applicationCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.isBlocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-green-400 hover:text-green-300 transition-colors font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                            className={`font-medium transition-colors ${
                              user.isBlocked 
                                ? 'text-green-400 hover:text-green-300' 
                                : 'text-red-400 hover:text-red-300'
                            }`}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
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
    
       <div className="flex justify-center gap-4 mt-4 items-center">
  <button 
    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
  >
    Previous
  </button>

  <span className="text-white">
    Page {page} of {Math.ceil(total / limit) || 1}
  </span>

  <button
    onClick={() => {
      if (page < Math.ceil(total / limit)) {
        setPage(prev => prev + 1);
      }
    }}
    disabled={page >= Math.ceil(total / limit)}
    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
  >
    Next
  </button>
</div>


        {/* Date Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Filter by Registration Date</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={applyDateFilter}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Apply Filter
                  </button>
                  <button
                    onClick={clearDateFilter}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Name:</span>
                        <p className="text-white font-medium">{selectedUser.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Email:</span>
                        <p className="text-white">{selectedUser.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Phone:</span>
                        <p className="text-white">{selectedUser.phone}</p>
                      </div>
                      {selectedUser.currentCity && (
                        <div>
                          <span className="text-gray-400 text-sm">Current City:</span>
                          <p className="text-white">{selectedUser.currentCity}</p>
                        </div>
                      )}
                      {selectedUser.pinCode && (
                        <div>
                          <span className="text-gray-400 text-sm">PinCode:</span>
                          <p className="text-white">{selectedUser.pinCode}</p>
                        </div>
                      )}
                      {selectedUser.futureGoals && (
                        <div>
                          <span className="text-gray-400 text-sm">Future Goals:</span>
                          <p className="text-white">{selectedUser.futureGoals}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 text-sm">Status:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.isBlocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Keywords */}
                  {(selectedUser.skills?.length > 0 || selectedUser.keywords?.length > 0) && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Skills & Interests</h4>
                      <div className="space-y-3">
                        {selectedUser.skills?.length > 0 && (
                          <div>
                            <span className="text-gray-400 text-sm">Skills:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedUser.skills.map((skill, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedUser.keywords?.length > 0 && (
                          <div>
                            <span className="text-gray-400 text-sm">Keywords:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedUser.keywords.map((keyword, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* User Actions */}
                  <div>
                    <h4 className="text-white font-medium mb-3">User Actions</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleBlockUser(selectedUser._id, !selectedUser.isBlocked)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          selectedUser.isBlocked 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {selectedUser.isBlocked ? (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Unblock User
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Block User
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Educational Background */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Educational Background</h3>
                    
                    {/* 12th/PU */}
                    {selectedUser.twelfthPU?.institution && (
                      <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                        <h4 className="text-white font-medium mb-2">12th/PU</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Institution:</span>
                            <span className="text-white ml-2">{selectedUser.twelfthPU.institution}</span>
                          </div>
                          {selectedUser.twelfthPU.passedYear && (
                            <div>
                              <span className="text-gray-400">Year:</span>
                              <span className="text-white ml-2">{selectedUser.twelfthPU.passedYear}</span>
                            </div>
                          )}
                          {selectedUser.twelfthPU.percentage && (
                            <div>
                              <span className="text-gray-400">Percentage:</span>
                              <span className="text-white ml-2">{selectedUser.twelfthPU.percentage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* UG Degree */}
                    {selectedUser.ugDegree?.institution && (
                      <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                        <h4 className="text-white font-medium mb-2">UG Degree</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Institution:</span>
                            <span className="text-white ml-2">{selectedUser.ugDegree.institution}</span>
                          </div>
                          {selectedUser.ugDegree.course && (
                            <div>
                              <span className="text-gray-400">Course:</span>
                              <span className="text-white ml-2">{selectedUser.ugDegree.course}</span>
                            </div>
                          )}
                          {selectedUser.ugDegree.year && (
                            <div>
                              <span className="text-gray-400">Year:</span>
                              <span className="text-white ml-2">{selectedUser.ugDegree.year}</span>
                            </div>
                          )}
                          {selectedUser.ugDegree.percentage && (
                            <div>
                              <span className="text-gray-400">Percentage/CGPA:</span>
                              <span className="text-white ml-2">{selectedUser.ugDegree.percentage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PG/Masters */}
                    {selectedUser.pgMasters?.institution && (
                      <div className="bg-gray-700/50 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-2">PG/Masters</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Institution:</span>
                            <span className="text-white ml-2">{selectedUser.pgMasters.institution}</span>
                          </div>
                          {selectedUser.pgMasters.course && (
                            <div>
                              <span className="text-gray-400">Course:</span>
                              <span className="text-white ml-2">{selectedUser.pgMasters.course}</span>
                            </div>
                          )}
                          {selectedUser.pgMasters.year && (
                            <div>
                              <span className="text-gray-400">Year:</span>
                              <span className="text-white ml-2">{selectedUser.pgMasters.year}</span>
                            </div>
                          )}
                          {selectedUser.pgMasters.percentage && (
                            <div>
                              <span className="text-gray-400">Percentage/CGPA:</span>
                              <span className="text-white ml-2">{selectedUser.pgMasters.percentage}</span>
                            </div>
                          )}
                        

                        </div>
                      </div>
                    )}
                  </div>
  {selectedUser.currentAcademicStatus && (
  <div className="bg-gray-700/50 rounded-xl p-4 mt-4">
    <h4 className="text-white font-medium mb-2">Current Academic Status</h4>
    <div className="text-white">
      {selectedUser.currentAcademicStatus}
    </div>
  </div>
)}
                  {/* Account Info */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Account Information</h4>
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Applications:</span>
                        <span className="text-white ml-2">{selectedUser.applicationCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Joined:</span>
                        <span className="text-white ml-2">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;