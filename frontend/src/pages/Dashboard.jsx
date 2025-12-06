import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStoredAdmin,
  getCurrentAdmin,
  fetchProtectedResource,
} from '../services/authService';
import { usePageTitle } from '../hooks/usePageTitle';

// Icons (using simple SVG components)
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdmin());
  const [loading, setLoading] = useState(false);

  usePageTitle('Dashboard');

  // Statistics data (dummy for now)
  const stats = [
    { label: 'Nombre d\'employés', value: '124', icon: <UsersIcon />, color: 'blue' },
    { label: 'Présents aujourd\'hui', value: '98', icon: <CalendarIcon />, color: 'green' },
    { label: 'En retard', value: '7', icon: <CalendarIcon />, color: 'yellow' },
    { label: 'Total pointages', value: '105', icon: <CameraIcon />, color: 'purple' },
  ];

  // Quick actions (removed entry/exit buttons)
  const quickActions = [
    { label: 'Ajouter un employé', path: '/add-employee', color: 'blue' },
    { label: 'Voir les présences', path: '/presences', color: 'green' },
    { label: 'Gérer les employés', path: '/employees', color: 'purple' },
  ];


  const getStatColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600',
    };
    return colors[color] || 'from-slate-500 to-slate-600';
  };

  const getActionColor = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    };
    return colors[color] || 'bg-gradient-to-r from-slate-500 to-slate-600';
  };

  return (
    <div className="p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-slate-600 text-base lg:text-lg">
            Vue d'ensemble du système de gestion de présence
          </p>
        </div>
        {/* Statistics cards - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 lg:p-6 border border-slate-200 hover:border-slate-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getStatColor(stat.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 text-xs lg:text-sm font-semibold mb-2 truncate uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl lg:text-4xl font-black text-slate-900 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 lg:p-4 rounded-xl bg-gradient-to-br ${getStatColor(stat.color)} text-white flex-shrink-0 ml-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
              
              {/* Progress bar animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${getStatColor(stat.color)} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions - Responsive grid */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl p-6 lg:p-8 border border-slate-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Actions rapides</span>
            </h2>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Accès rapide aux fonctionnalités</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`group relative px-5 lg:px-6 py-4 lg:py-5 rounded-xl text-white font-bold shadow-lg transform transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 text-sm lg:text-base overflow-hidden ${getActionColor(action.color)}`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <span>{action.label}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional sections for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent activity placeholder */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl p-6 lg:p-7 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Activité récente</span>
              </h3>
              <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-semibold">Live</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-green-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900">Employé {i}</span>
                        <span className="text-xs text-green-600 font-medium ml-2">• Entrée</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500">08:3{i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System status placeholder */}
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl p-6 lg:p-7 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>État du système</span>
              </h3>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">Tout fonctionne</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Base de données</span>
                </div>
                <span className="text-xs bg-green-200 text-green-900 px-3 py-1.5 rounded-lg font-bold shadow-sm">Active</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Service caméra</span>
                </div>
                <span className="text-xs bg-blue-200 text-blue-900 px-3 py-1.5 rounded-lg font-bold shadow-sm">Opérationnel</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Dernière sauvegarde</span>
                </div>
                <span className="text-xs text-slate-600 font-medium">Il y a 2 heures</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
