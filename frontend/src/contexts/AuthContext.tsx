import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentCity: string;
  futureGoals: string;
  studyPreference: string; 
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
  skills: string[];
  keywords: string[];
  resume: boolean;
  profilePicture: boolean;
  applicationCount: number;
}
interface Admin {
  id: string;
  username: string;
  email: string;
}

// --- FIX 1: Add 'token' to the context type ---
interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  token: string | null; // <-- ADD THIS LINE
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5006/api';
    }
    
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') {
      return 'https://api.internx.cc/api';
    }
    
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return 'https://api.internx.cc/api';
    }
    
    return 'http://localhost:5006/api';
  }
  
  return 'http://localhost:5006/api';
};

const API_BASE_URL = getApiBaseUrl();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null); // <-- ADD THIS STATE
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken); // <-- SET THE TOKEN IN STATE
      
      if (userType === 'admin') {
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
          setAdmin(JSON.parse(adminData));
        }
      } else {
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const sendOTP = async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/send-otp`, { email });
    return response.data;
  };

  const register = async (userData: any) => {
    let registrationData = { ...userData };

    if (userData.resume instanceof File) {
      const base64 = await convertFileToBase64(userData.resume);
      registrationData.resumeData = base64;
      registrationData.resumeFilename = userData.resume.name;
      registrationData.resumeContentType = userData.resume.type;
      delete registrationData.resume;
    }

    if (userData.profilePicture instanceof File) {
      const base64 = await convertFileToBase64(userData.profilePicture);
      registrationData.profilePictureData = base64;
      registrationData.profilePictureFilename = userData.profilePicture.name;
      registrationData.profilePictureContentType = userData.profilePicture.type;
      delete registrationData.profilePicture;
    }

    if (Array.isArray(userData.skills)) {
      registrationData.skills = userData.skills;
    }
    if (Array.isArray(userData.keywords)) {
      registrationData.keywords = userData.keywords;
    }

    const response = await axios.post(`${API_BASE_URL}/register`, registrationData);

    const { token: newToken, user: newUser } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('userData', JSON.stringify(newUser));
    localStorage.setItem('userType', 'user');
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(newUser);
    setToken(newToken); // <-- SET THE TOKEN IN STATE
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userType', 'user');
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    setToken(newToken); // <-- SET THE TOKEN IN STATE
  };

  const adminLogin = async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, { username, password });
    const { token: newToken, admin: adminData } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    localStorage.setItem('userType', 'admin');
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setAdmin(adminData);
    setToken(newToken); // <-- SET THE TOKEN IN STATE
  };

  const updateProfile = async (userData: any) => {
    let updateData = { ...userData };

    if (userData.profilePicture instanceof File) {
      const base64 = await convertFileToBase64(userData.profilePicture);
      updateData.profilePictureData = base64;
      updateData.profilePictureFilename = userData.profilePicture.name;
      updateData.profilePictureContentType = userData.profilePicture.type;
      delete updateData.profilePicture;
    }

    if (userData.resume instanceof File) {
      const base64 = await convertFileToBase64(userData.resume);
      updateData.resumeData = base64;
      updateData.resumeFilename = userData.resume.name;
      updateData.resumeContentType = userData.resume.type;
      delete updateData.resume;
    }

    const response = await axios.put(`${API_BASE_URL}/profile`, updateData);
    const { user: updatedUser } = response.data;
    
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminData');
    localStorage.removeItem('userType');
    
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdmin(null);
    setToken(null); // <-- CLEAR THE TOKEN FROM STATE
  };

  // --- FIX 2: Add 'token' to the returned context value ---
  return (
    <AuthContext.Provider value={{
      user,
      admin,
      token, // <-- ADD THIS LINE
      isLoading,
      login,
      adminLogin,
      register,
      logout,
      sendOTP,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};