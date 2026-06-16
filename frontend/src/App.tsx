import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyRegister from './pages/company/CompanyRegister'; 
import CompanyLogin from './pages/company/CompanyLogin'; 
import CompanySidebar from './pages/company/CompanySidebar';
import CompanyDashboard from './pages/company/CompanyDashboard'; 
import CompanyInternships from './pages/company/CompanyInternships'; 
import CompanyApplications from './pages/company/CompanyApplications'; 
import CompanyProfile from './pages/company/CompanyProfile';
import CompanySettings from './pages/company/CompanySettings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Internships from './pages/Internships';
import InternshipDetail from './pages/InternshipDetail';
import GlobalJob from './pages/global-jobs';
import Dashboard from './pages/Dashboard';
import About from './pages/about';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminGlobal from './pages/admin/AdminGlobal';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Preloader from './components/Preloader';
import AIChat from './components/AIChat';
import AIService from './components/AIService'; // No need to specify .tsx extension
import Maintenance from './pages/Maintenance';



function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/jobs" element={
              <AdminRoute>
                <AdminJobs />
              </AdminRoute>
            } />
            <Route path="/admin/companies" element={
              <AdminRoute>
                <AdminCompanies />
              </AdminRoute>
            } />
            <Route path="/admin/global" element={
              <AdminRoute>
                <AdminGlobal />
              </AdminRoute>
            } />
            <Route path="/admin/applications" element={
              <AdminRoute>
                <AdminApplications />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            } />

                <Route path="/Company-Sidebar" element={<CompanySidebar />} />
                <Route path="/Company-Dashboard" element={<CompanyDashboard />} />
                <Route path="/Company-Internships" element={<CompanyInternships />} />
                <Route path="/Company-Applications" element={<CompanyApplications />} />
                <Route path="/Company-Profile" element={<CompanyProfile />} />
                <Route path="/Company-Settings" element={<CompanySettings />} />
            {/* Public Routes */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/Company-Register" element={<CompanyRegister />} />
                  <Route path="/Company-Login" element={<CompanyLogin />} />
              
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/internships" element={<Internships />} />
                  <Route path="/internships/:id" element={<InternshipDetail />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/global-jobs" element={<GlobalJob />} />
                  <Route path="/https://ai.internx.io" element={<AIService />} />
                  <Route path="/maintenance" element={<Maintenance />} />




                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
                <AIChat />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;