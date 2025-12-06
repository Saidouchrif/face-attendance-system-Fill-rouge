import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getStoredAdmin } from '../services/authService';
import logo2 from '../images/logo2.jpg';

// Icons (using simple SVG components)
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <HomeIcon /> },
    { path: '/employees', label: 'Gestion des employés', icon: <UsersIcon /> },
    { path: '/presences', label: 'Présences', icon: <CalendarIcon /> },
    { path: '/captures', label: 'Captures faciales', icon: <CameraIcon /> },
  ];

  const handleLogout = () => {
    setLoading(true);
    logout();
    navigate('/login', { replace: true });
  };

  const adminName = getStoredAdmin()?.name || 'Admin';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Hidden on mobile, shown on larger screens */}
      <aside className={`fixed lg:relative lg:flex lg:w-64 bg-slate-900 shadow-xl h-screen z-20 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo section */}
          <div className="p-4 lg:p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src={logo2}
                alt="Logo"
                className="h-8 lg:h-10 w-auto object-contain"
              />
              <div>
                <h2 className="text-white font-semibold text-base lg:text-lg">Système</h2>
                <p className="text-slate-400 text-xs">de Présence</p>
              </div>
            </div>
          </div>

          {/* Admin info */}
          <div className="p-3 lg:p-4 border-b border-slate-800">
            <p className="text-slate-300 text-xs lg:text-sm">Bienvenue,</p>
            <p className="text-white font-medium text-sm lg:text-base truncate">{adminName}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
            <ul className="space-y-1 lg:space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false); // Close mobile menu after navigation
                    }}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-xs lg:text-sm font-medium truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-3 lg:p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogoutIcon />
              <span className="text-xs lg:text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-slate-900 text-white p-2 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
