import React, { useState, useEffect } from 'react';
import { useParams,useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Building, Clock, Calendar, Briefcase, ArrowLeft, Send, CheckCircle, AlertCircle, Star, Users, Heart, Globe, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ResumeRequiredModal from '../components/ResumeRequiredModal';
import { Bot } from 'lucide-react';
import banner from './banner_wizdom.jpg';

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

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5006/api';
    }

    // Production URLs
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }

    // Vercel/Netlify deployments
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }

    // Default to localhost for development
    return 'http://localhost:5006/api';
  }

  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();

const InternshipDetail = () => {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false); // false by default
  const [willReachOut, setWillReachOut] = useState(false);

  const [noGuaranteeAccepted, setNoGuaranteeAccepted] = useState(false);

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
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const location = useLocation();
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

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    if (resumeFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file for resume');
      return;
    }

    setUploadingResume(true);
    try {
      const formData = { resume: resumeFile };
      await updateProfile(formData);
      toast.success('Resume uploaded successfully!');
      setResumeFile(null);
      setShowResumeModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for internships');
      navigate('/login');
      return;
    }

    // Check if user has uploaded resume
    if (!user.resume) {
      setShowResumeModal(true);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-green-300 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Internship not found</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">The internship you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-gray-600 hover:text-green-600 mb-8 transition-all duration-300 transform hover:scale-105"
          >
      

            <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg group-hover:bg-green-50 transition-all duration-300 mr-4">
              <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300 ml-1" />
            </div>
            <span className="font-semibold">Back to Internships</span>
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
       onClick={() => navigate(`/internships${location.search}`)}
          className="group flex items-center text-gray-600 hover:text-green-600 mb-8 transition-all duration-300 transform hover:scale-105"
        >
          <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg group-hover:bg-green-50 transition-all duration-300 mr-4">
            <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300 ml-1" />
          </div>

          <span className="font-semibold">Back to Internships</span>
        </button>
         <div className="mb-8">
  <a href="https://www.wizx.org/enquiry" target="_blank" rel="noopener noreferrer">
    <img
      src={banner}
      alt="Study Free in Europe promotional banner"
      className="w-full rounded-3xl shadow-lg object-cover"
    />
  </a>
</div>


        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-all duration-500">
          {/* Header with Enhanced Design */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-600 to-green-700 px-8 py-10 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-20 translate-y-20"></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className=".mb-6 lg:mb-0 lg:flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-green-500 bg-opacity-30 rounded-full text-green-100 text-sm font-medium mb-4 backdrop-blur-sm">
                    <Star className="h-4 w-4 mr-2" />
                    Featured Internship
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight animate-fade-in">{job.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 text-green-100">
                    <div className="flex items-center group">
                      <div className="p-2 rounded-full bg-white bg-opacity-20 mr-3 group-hover:bg-opacity-30 transition-all duration-300">
                        <Building className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-lg">{job.company}</span>
                    </div>
                    <div className="flex items-center group">
                      <div className="p-2 rounded-full bg-white bg-opacity-20 mr-3 group-hover:bg-opacity-30 transition-all duration-300">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-lg">{job.location}</span>
                    </div>
                    <div className="flex items-center group">
                      <div className="p-2 rounded-full bg-white bg-opacity-20 mr-3 group-hover:bg-opacity-30 transition-all duration-300">
                        <Globe className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-lg">{job.domain}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:text-right">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-30">
                    <div className="flex items-center justify-center lg:justify-end mb-2">
                      <span className="text-4xl font-bold">{job.salary.toLocaleString()}</span>
                    </div>
                    <div className="text-green-100 font-medium">per month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
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

          

            {/* Enhanced Job Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors duration-300">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Internship Type</span>
                </div>
                <p className="text-gray-700 font-medium text-lg">{job.type}</p>
              </div>

              <div className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors duration-300">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Duration</span>
                </div>
                <p className="text-gray-700 font-medium text-lg">{job.duration}</p>
              </div>

              <div className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors duration-300">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Posted</span>
                </div>
                <p className="text-gray-700 font-medium text-lg">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Enhanced Job Description */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">About This Internship</h2>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
                <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </div>
            </div>

            {/* Enhanced Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">What We're Looking For</h2>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
                  <div className="grid gap-4">
                    {job.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4 group-hover:bg-green-200 transition-colors duration-300">
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-lg leading-relaxed">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Application Section */}
            <div className="border-t border-gray-200 pt-12">
              {applicationStatus.hasApplied ? (
                <div className="text-center">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <Heart className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted</h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        Your application has been submitted successfully. You can track its status in your dashboard.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              ) : !showApplicationForm ? (
                <div className="text-center">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <Heart className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make Your Mark?</h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        This is a fantastic opportunity to grow your career and make a meaningful impact. Take the next step and join an amazing team.
                      </p>
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">



                      <button
                        onClick={() => {
                          if (!user) {
                            toast.error('Please login to apply for internships');
                            navigate('/login');
                            return;
                          }
                          if (!user.resume) {
                            setShowResumeModal(true);
                            return;
                          }
                          setShowApplicationForm(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 group"
                      >
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          Apply Now
                        </div>
                      </button>
                      
                      {/* Only show Ask AI button if user is logged in */}
                      {user && (
                        <button
                          onClick={() => window.open('https://ai.internx.io/', '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 group"
                        >
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                            Ask AI
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-green-200 rounded-xl mr-4">
                        <Send className="h-6 w-6 text-green-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Submit Your Application</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Cover Letter (Optional)
                        </label>

                        <div className="relative">
                          <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={6}
                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white"
                            placeholder="Tell us why you're interested in this internship and what makes you a great fit for the role..."
                          />
                          <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                            {coverLetter.length} characters
                          </div>
                        </div>
                      </div>

                      {/*Terms and condition button here */}
                      {/* Terms and condition buttons with consistent styling */}
                      <div className="space-y-4"> {/* Add wrapper for consistent spacing */}
                        <div className="flex items-start gap-3"> {/* Use gap instead of ml-2 */}
                          <input
                            type="checkbox"
                            id="termsAccepted"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="flex-shrink-0 mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                            I accept the{' '}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline font-medium">
                              Terms and Conditions
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline font-medium">
                              Privacy Policy
                            </a>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="noGuaranteeAccepted"
                            checked={noGuaranteeAccepted}
                            onChange={(e) => setNoGuaranteeAccepted(e.target.checked)}
                            className="flex-shrink-0 mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="noGuaranteeAccepted" className="text-sm text-gray-700">
                            I understand that InternX is just a platform to access internship opportunities. InternX does not guarantee internships.
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="willReachOut"
                          checked={willReachOut}
                          onChange={(e) => setWillReachOut(e.target.checked)}
                          className="flex-shrink-0 mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="willReachOut" className="text-sm text-gray-700">
                          If I do not receive a response within 5 days of submitting my internship application, I will contact the organization directly via email or phone
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>

                      <div className="flex flex-row gap-4 justify-center">  {/* Changed: flex-col sm:flex-row → flex-row, added justify-center */}
                        <button
                          onClick={handleApply}
                          disabled={applying || !termsAccepted || !noGuaranteeAccepted || !willReachOut || !willReachOut}
                          className={`
      flex items-center justify-center px-6 py-2 rounded-lg font-medium text-base transition-all duration-300 transform
      ${(applying || !termsAccepted || !noGuaranteeAccepted || !willReachOut)
                              ? 'bg-gray-400 cursor-not-allowed opacity-60 text-gray-200'
                              : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 hover:shadow-xl active:scale-95'
                            }
    `}
                        >
                          {applying ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-3" />
                              Submit Application
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setShowApplicationForm(false)}
                          className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
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
        </div>

        {/* Resume Required Modal */}
        <ResumeRequiredModal
          isOpen={showResumeModal}
          onClose={() => setShowResumeModal(false)}
        />
      </div>
    </div>
  );
};

export default InternshipDetail;


