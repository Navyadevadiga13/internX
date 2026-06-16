import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Building, Clock, Calendar, Briefcase, ArrowLeft, Send, CheckCircle, Upload, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  position: string;
  salary: number;
  type: string;
  duration: string;
  description: string;
  requirements: string[];
  createdAt: string;
}

interface ApplicationStatus {
  hasApplied: boolean;
  status: string | null;
  appliedAt: string | null;
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

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({
    hasApplied: false,
    status: null,
    appliedAt: null
  });
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkApplicationStatus();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to fetch internship details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}/application-status`);
      setApplicationStatus(response.data);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for internships');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await axios.post(`${API_BASE_URL}/jobs/${id}/apply`, {
        coverLetter
      });
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      setCoverLetter('');
      // Update application status
      setApplicationStatus({
        hasApplied: true,
        status: 'Pending',
        appliedAt: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.response?.data?.requiresResume) {
        setShowResumeModal(true);
      } else if (error.response?.data?.applicationLimitReached) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || 'Failed to apply for internship');
      }
    } finally {
      setApplying(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Internship not found</h2>
          <p className="text-gray-600 mb-4">The internship you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Internships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Internships
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <div className="flex items-center space-x-4 text-green-100">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">{job.salary.toLocaleString()}</div>
                <div className="text-green-100">per month</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            
            {/* Application Status */}
            {applicationStatus.hasApplied && (
              <div className={`mb-6 p-4 rounded-xl border ${getStatusColor(applicationStatus.status || '')}`}>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    You have applied for this internship
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p>Status: <span className="font-medium">{applicationStatus.status}</span></p>
                  {applicationStatus.appliedAt && (
                    <p>Applied on: {new Date(applicationStatus.appliedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Internship Type</span>
                </div>
                <p className="text-gray-600">{job.type}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Duration</span>
                </div>
                <p className="text-gray-600">{job.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Posted</span>
                </div>
                <p className="text-gray-600">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Internship Description</h2>
              <div className="prose max-w-none text-gray-600">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Section */}
            <div className="border-t border-gray-200 pt-8">
              {applicationStatus.hasApplied ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Application Submitted</h3>
                  <p className="text-gray-600 mb-6">
                    Your application has been submitted successfully. You can track its status in your dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Dashboard
                  </button>
                </div>
              ) : !showApplicationForm ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Apply?</h3>
                  <p className="text-gray-600 mb-6">
                    This is a great opportunity to kickstart your career. Click below to submit your application.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to apply for internships');
                        navigate('/login');
                        return;
                      }
                      setShowApplicationForm(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Application</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter (Optional)
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tell us why you're interested in this internship and what makes you a great fit..."
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {applying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Required Modal */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to upload your resume before applying for internships. Please update your profile with your resume.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowResumeModal(false);
                      navigate('/dashboard');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </button>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;