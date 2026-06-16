import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, Globe, MapPin, Eye, EyeOff, ArrowLeft, Users, Calendar, Upload, Linkedin, Twitter, Facebook, Instagram, Briefcase, FileText, ArrowRight } from 'lucide-react';

// API Base URL function
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

const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    location: '',
    website: '',
    password: '',
    confirmPassword: '',
    description: '',
    industry: '',
    size: '',
    founded: '',
    linkedinUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only JPG, JPEG, PNG, or WEBP images');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const validateStep = (step: number) => {
    setError('');
    
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.contact || !formData.location || !formData.website) {
        setError('Please fill in all required fields');
        return false;
      }
      if (!logoFile) {
        setError('Please upload company logo');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please enter password');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

 const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setError('');

  // Only validate steps 1 and 2 (step 3 is optional)
  if (currentStep === 1 || currentStep === 2) {
    if (!validateStep(currentStep)) return;
  }

  setLoading(true);

  try {
    const apiBaseUrl = getApiBaseUrl();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('location', formData.location);
    submitData.append('website', formData.website);
    submitData.append('email', formData.email);
    submitData.append('contact', formData.contact);
    submitData.append('description', formData.description);
    submitData.append('industry', formData.industry);
    submitData.append('size', formData.size);
    submitData.append('founded', formData.founded);
    submitData.append('linkedinUrl', formData.linkedinUrl);
    submitData.append('twitterUrl', formData.twitterUrl);
    submitData.append('facebookUrl', formData.facebookUrl);
    submitData.append('instagramUrl', formData.instagramUrl);
    submitData.append('password', formData.password);
    submitData.append('confirmPassword', formData.confirmPassword);
    
    if (logoFile) {
      submitData.append('logo', logoFile);
    }

    const response = await fetch(`${apiBaseUrl}/register_company`, {
      method: 'POST',
      body: submitData,
    });

    const data = await response.json();

    if (response.ok) {
      alert('Company registration successful! Please login.');
      navigate('/Company-Login');
    } else {
      setError(data.message || 'Registration failed');
    }
  } catch (err) {
    setError('Server error. Please try again later.');
    console.error('Registration error:', err);
  } finally {
    setLoading(false);
  }
};


  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2 },
    { number: 2, title: 'Security', icon: Lock },
    { number: 3, title: 'Additional', icon: FileText },
  ];

  return (
 <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-2 sm:px-4 md:px-8">
  <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>

<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
  <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Building2 className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Company Registration</h2>
                <p className="text-green-100 mt-1">Join InternX and find talented interns</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          currentStep >= step.number
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <StepIcon className="h-6 w-6" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-4 rounded transition-all ${
                          currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                        style={{ marginTop: '-24px' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 transition-colors">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600 text-center">
                              {logoFile ? logoFile.name : 'Click to upload logo (JPG, PNG, WEBP)'}
                            </span>
                            <span className="text-xs text-gray-500">Max size: 5MB</span>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleLogoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </label>
                      
                      {logoPreview && (
                        <div className="w-24 h-24 border-2 border-gray-300 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="company@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="City, Country"
                        required
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://www.example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Security */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Create password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Confirm password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Details (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Tell us about your company..."
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
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
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                      <select
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
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
                  </div>

                  {/* Founded Year */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="founded"
                        value={formData.founded}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="2020"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Social Media Links</h4>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="twitterUrl"
                        value={formData.twitterUrl}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="facebookUrl"
                        value={formData.facebookUrl}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="instagramUrl"
                        value={formData.instagramUrl}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
          {/* Navigation Buttons */}
<div className="mt-8 flex justify-between">
  {currentStep > 1 && (
    <button
      type="button"
      onClick={handleBack}
      className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  )}

  <div className={currentStep === 1 ? 'ml-auto' : currentStep === 3 ? 'flex space-x-4' : ''}>
    {currentStep < 3 ? (
      <button
        type="button"
        onClick={handleNext}
        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-200"
      >
        <span>Next</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    ) : (
      <>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
        >
          Skip & Register
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </>
    )}
  </div>
</div>


            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/Company-Login" className="text-green-600 hover:text-green-700 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
