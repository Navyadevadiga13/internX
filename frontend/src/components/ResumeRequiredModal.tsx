import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, X } from 'lucide-react';

interface ResumeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResumeRequiredModal: React.FC<ResumeRequiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUploadResume = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-orange-500" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Resume Required!</h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            To apply for internships, you need to upload your resume first. This helps companies understand your background and qualifications.
          </p>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">Why upload your resume?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Increases application success rate by 80%
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Helps companies match you with suitable roles
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Required for all internship applications
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUploadResume}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Resume
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Later
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            Accepted format: PDF only • Max size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeRequiredModal;