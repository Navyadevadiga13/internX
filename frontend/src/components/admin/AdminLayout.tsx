import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Internships', href: '/admin/jobs', icon: Briefcase },
    { name: 'Companies', href: '/admin/companies', icon: Briefcase },
    { name: 'Jobs', href: '/admin/global', icon: Briefcase },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">InternX</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Admin info and logout */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-white">{admin?.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Welcome back!</p>
                <p className="text-xs text-gray-400">Manage your internship portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;