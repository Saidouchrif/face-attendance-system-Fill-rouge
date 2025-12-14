import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getStoredAdmin } from '../services/authService';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
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
  
  // Activer le rafraîchissement automatique du token
  useTokenRefresh();

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: <HomeIcon /> },
    { path: '/employees', label: 'Gestion des employés', icon: <UsersIcon /> },
    { path: '/presences', label: 'Présences', icon: <CalendarIcon /> },
    { path: '/face-punch', label: 'Captures Faciales', icon: <CameraIcon /> },
  ];

  const handleLogout = () => {
    setLoading(true);
    logout();
    navigate('/login', { replace: true });
  };

  const adminName = getStoredAdmin()?.name || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Fixed Sidebar - 260px width, hidden on mobile */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen w-[260px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-30 flex-col border-r border-slate-700/50`}>
        {/* Logo section */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <img
                src={logo2}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Système</h2>
              <p className="text-blue-300 text-xs font-medium">de Présence</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="mx-4 my-4 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
          <p className="text-blue-300 text-xs uppercase tracking-wider mb-1 font-semibold">Bienvenue</p>
          <p className="text-white font-bold text-base truncate flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {adminName}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-3 px-4">Menu Principal</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`group w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span className={`flex-shrink-0 transition-transform duration-300 ${
                    location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'
                  }`}>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                  {location.pathname === item.path && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="group w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600 hover:to-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-400 rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-red-500/50"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500"><LogoutIcon /></span>
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-slate-900 text-white p-3 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-screen w-[260px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 flex-col transform transition-transform duration-300 border-r border-slate-700/50 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo section */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <img
                src={logo2}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Système</h2>
              <p className="text-blue-300 text-xs font-medium">de Présence</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="mx-4 my-4 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
          <p className="text-blue-300 text-xs uppercase tracking-wider mb-1 font-semibold">Bienvenue</p>
          <p className="text-white font-bold text-base truncate flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {adminName}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-3 px-4">Menu Principal</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`group w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span className={`flex-shrink-0 transition-transform duration-300 ${
                    location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'
                  }`}>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                  {location.pathname === item.path && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="group w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600 hover:to-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-400 rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-red-500/50"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500"><LogoutIcon /></span>
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="min-h-screen lg:ml-[150px] bg-transparent">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
