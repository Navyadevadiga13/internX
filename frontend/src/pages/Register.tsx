
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  otp: string;
  currentCity: string;
  pinCode: string;
  studyPreference: string;
}

const Register: React.FC = () => {
  const { register, sendOTP } = useAuth();
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
    currentCity: '',
    pinCode: '',
studyPreference: 'India'
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await sendOTP(formData.email);
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   if (
  !formData.name.trim() ||
  !formData.email.trim() ||
  !formData.phone.trim() ||
  !formData.password.trim() ||
  !formData.confirmPassword.trim() ||
  !formData.otp.trim() ||
  !formData.currentCity.trim() ||
  !formData.pinCode.trim() ||
  !formData.studyPreference
) {
      toast.error('Please fill all required fields');
      return;
    }
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

if (!strongPasswordRegex.test(formData.password)) {
  toast.error(
    'Password must contain 8+ characters, uppercase, lowercase, number and special character'
  );
  return;
}
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept Terms & Conditions');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      otp: formData.otp,
      currentCity: formData.currentCity,
      pinCode: formData.pinCode,
      studyPreference: formData.studyPreference
    };

    try {
      setLoading(true);
      await register(payload);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-2xl">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold">Join InternX</h2>
          <p className="text-gray-600">
            Create your account and start your journey
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Send OTP */}
            <button
              type="button"
              onClick={handleSendOTP}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            {/* OTP */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
             <div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    name="password"
    value={formData.password}
    onChange={handleInputChange}
    className="w-full p-3 border rounded pr-10 focus:ring-2 focus:ring-green-500"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3 text-gray-500"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

<p className="text-xs text-gray-500 mt-1">
  Password must contain at least 8 characters, one uppercase letter,
  one lowercase letter, one number and one special character.
</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Current City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current City *
              </label>
              <input
                type="text"
                name="currentCity"
                value={formData.currentCity}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Pin Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin Code *
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Study Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
             Career Path *
              </label>
             <select
  name="studyPreference"
  value={formData.studyPreference}
  onChange={handleInputChange}
  required
>
  <option value="">Select Career Path</option>
  <option value="India">Study in India</option>
  <option value="Abroad">Study Abroad</option>
  <option value="Both">Both</option>
  <option value="Work">Work</option>
</select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I accept the{' '}
                <a href="/privacy" className="text-green-600 underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-green-600 underline">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full bg-green-600 text-white py-3 rounded font-medium disabled:bg-gray-400"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
