import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Briefcase, Home, Sparkles , Search, Info, ChevronDown } from 'lucide-react';


const Navbar = () => {
  const { user, logout, token } = useAuth(); 
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setShowUserDropdown(false);
  };


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    setShowSignupDropdown(false);
    setShowLoginDropdown(false);
  };


  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100' 
        : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          
         <Link to="/" className="group">
  <div className="relative p-2.5 transition-all duration-300 group-hover:scale-105 mt-4 -ml-8">
    <img 
      src="/internx-logo.png" 
      alt="InternX Logo" 
      className="h-40 w-22 object-contain"
    />
    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
</Link>



          <div className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" icon={Home} text="Home" />
            
              {user && (
              <a // Use a standard <a> tag for external links
                href={token ? `https://ai.internx.io/?token=${token}` : "/login"} // Build the URL dynamically with the token
                target="_blank" // Open in a new tab
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium group"
              >
                <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>InternX-AI</span>
              </a>
            )}


            <NavLink to="/internships" icon={Search} text="Find Internships" />
            <NavLink to="/global-jobs" icon={Briefcase} text="Global Jobs" />


            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 px-4 py-2.5 rounded-xl transition-all duration-300 border border-green-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium hidden xl:block">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                 <div className="relative">
                  <button
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-4 py-2.5 rounded-xl hover:bg-green-50 transition-all duration-300 font-medium"
                  >
                    <span>Login</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showLoginDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLoginDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        to="/login"
                        onClick={() => setShowLoginDropdown(false)}
                        className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors font-medium"
                      >
                        Intern
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <Link
                        to="/company-login"
                        onClick={() => setShowLoginDropdown(false)}
                        className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors font-medium"
                      >
                        Company
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Sign Up Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSignupDropdown(!showSignupDropdown)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-green-200 hover:scale-105"
                  >
                    <span>Sign Up</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showSignupDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSignupDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        to="/register"
                        onClick={() => setShowSignupDropdown(false)}
                        className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors font-medium"
                      >
                        Intern
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <Link
                        to="/Company-Register"
                        onClick={() => setShowSignupDropdown(false)}
                        className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors font-medium"
                      >
                        Company
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>


        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="border-t border-green-100 pt-4">
            <div className="flex flex-col space-y-2">
              <MobileNavLink to="/" icon={Home} text="Home" onClick={closeMenu} />

            {user && (
                <a // Use a standard <a> tag
                  href={token ? `https://ai.internx.io/?token=${token}` : "/login"} // Build the URL dynamically
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>InternX-AI</span>
                </a>
              )}
              
              <MobileNavLink to="/internships" icon={Search} text="Find Internships" onClick={closeMenu} />
              <MobileNavLink to="/global-jobs" icon={Briefcase} text="Global Jobs" onClick={closeMenu} />
              
              {user ? (
                <div className="pt-4 mt-4 border-t border-green-100">
                  <div className="flex items-center space-x-3 mb-4 px-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Hi, {user.name}</p>
                      <p className="text-sm text-green-600">Welcome back!</p>
                    </div>
                  </div>
                  <MobileNavLink to="/dashboard" icon={User} text="Dashboard" onClick={closeMenu} />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-3 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-green-100 space-y-3">
              <div className="space-y-2">
  <p className="text-sm text-gray-600 text-center font-medium">Login As:</p>
  <Link
    to="/login"
    onClick={closeMenu}
    className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl transition-all duration-300 font-medium shadow-lg"
  >
    Intern
  </Link>
  <Link
    to="/company-login"
    onClick={closeMenu}
    className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl transition-all duration-300 font-medium shadow-lg"
  >
    Company
  </Link>
</div>

                  
                  {/* Mobile Sign Up Dropdown */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center font-medium">Sign Up As:</p>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl transition-all duration-300 font-medium shadow-lg"
                    >
                      Intern
                    </Link>
                    <Link
                      to="/Company-Register"
                      onClick={closeMenu}
                      className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl transition-all duration-300 font-medium shadow-lg"
                    >
                      Company
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};


const NavLink = ({ to, icon: Icon, text }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium group"
  >
    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
    <span>{text}</span>
  </Link>
);


const MobileNavLink = ({ to, icon: Icon, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium"
  >
    <Icon className="h-5 w-5" />
    <span>{text}</span>
  </Link>
);

 
export default Navbar;
