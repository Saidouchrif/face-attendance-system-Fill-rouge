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
    { label: 'Ajouter un employé', path: '/employees/new', color: 'blue' },
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
    <>
      {/* Page header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-slate-600 text-sm lg:text-base">
          Système de gestion de présence
        </p>
      </div>

          {/* Statistics cards - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 lg:p-6 border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-600 text-xs lg:text-sm font-medium mb-1 truncate">
                      {stat.label}
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-br ${getStatColor(stat.color)} text-white flex-shrink-0 ml-3`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions - Responsive grid */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-100">
            <h2 className="text-lg lg:text-xl font-semibold text-slate-900 mb-4 lg:mb-6">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`px-4 lg:px-6 py-3 lg:py-4 rounded-xl text-white font-semibold shadow-md transform transition duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm lg:text-base ${getActionColor(action.color)}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional sections for larger screens */}
          <div className="hidden xl:block mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent activity placeholder */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Activité récente
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600">Employé {i} - Entrée</span>
                      </div>
                      <span className="text-xs text-slate-400">08:3{i}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System status placeholder */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  État du système
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Base de données</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Service caméra</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Opérationnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Dernière sauvegarde</span>
                    <span className="text-xs text-slate-400">Il y a 2 heures</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default Dashboard;
