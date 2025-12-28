import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getToken } from '../services/authService';

export default function Presence() {
  const navigate = useNavigate();
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, present, late, out_of_hours
  const [dateFilter, setDateFilter] = useState(''); // Date filter
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPresences();
  }, []);

  async function loadPresences() {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Token manquant, veuillez vous reconnecter.');
      }

      const response = await fetch('http://localhost:8000/api/presence/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPresences(data.presences);
      } else {
        setError(data.message || 'Erreur lors du chargement des présences');
      }
    } catch (err) {
      console.error('Error loading presences:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'present':
        return "À l'heure";
      case 'late':
        return 'En retard';
      case 'out_of_hours':
        return 'Hors horaire';
      default:
        return status || '-';
    }
  };

  const filteredPresences = presences.filter(p => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // Filter by status
    let statusMatch = true;
    if (filter === 'present') statusMatch = p.status === 'present';
    else if (filter === 'late') statusMatch = p.status === 'late';
    else if (filter === 'out_of_hours') statusMatch = p.status === 'out_of_hours';
    
    // Filter by date
    let dateMatch = true;
    if (dateFilter) {
      dateMatch = p.date === dateFilter;
    }
    
    const searchMatch =
      normalizedSearch.length === 0 ||
      [
        p.employee?.first_name,
        p.employee?.last_name,
        p.employee?.matricule,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));

    return statusMatch && dateMatch && searchMatch;
  });

  // Export to PDF
  const exportToPDF = async () => {
    if (filteredPresences.length === 0 || pdfLoading) return;

    try {
      setPdfLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Token manquant, veuillez vous reconnecter.');
      }

      const response = await fetch('http://localhost:8000/api/reports/pdf/presences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de générer le PDF des présences');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'historique-presences.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement du PDF:', err);
      alert(err.message || 'Impossible de générer le PDF pour le moment. Veuillez réessayer.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPresences.map(p => ({
      'Date': p.date || '',
      'Employé': `${p.employee.first_name} ${p.employee.last_name}`,
      'Matricule': p.employee.matricule || '',
      'Poste': p.employee.poste || '',
      'Heure d\'entrée': p.check_in_time || '-',
      'Heure de sortie': p.check_out_time || '-',
      'Statut': formatStatus(p.status),
      'Confiance': p.confidence ? `${p.confidence}%` : '-'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presences');
    XLSX.writeFile(workbook, 'presences.xlsx');
  };

  const getStatusBadge = (status) => {
    if (status === 'present') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
          À l'heure
        </span>
      );
    } else if (status === 'late') {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
          En retard
        </span>
      );
    } else if (status === 'out_of_hours') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
          Hors horaire
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 text-lg font-medium">Chargement des présences...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Erreur de chargement</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Liste des présences
            </h1>
            <p className="text-slate-600 text-base lg:text-lg">
              Historique des entrées et sorties des employés
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-slate-800">{filteredPresences.length}</span>
                <span className="text-sm text-slate-600">présences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Export Buttons */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 w-full lg:w-auto">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Rechercher (nom, matricule)
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: EMP123 ou Dupont"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Filtrer par date:</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(dateFilter || searchTerm) && (
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setSearchTerm('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportToPDF}
                disabled={filteredPresences.length === 0 || pdfLoading}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {pdfLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                <span>{pdfLoading ? 'Génération...' : 'Exporter PDF'}</span>
              </button>
              <button
                onClick={exportToExcel}
                disabled={filteredPresences.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-4V8a2 2 0 00-2-2H8a2 2 0 00-2 2v8m5-4h4" />
                </svg>
                <span>Exporter Excel</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-slate-700">Filtrer par statut:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tous ({presences.length})
              </button>
              <button
                onClick={() => setFilter('present')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'present'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                À l'heure ({presences.filter(p => p.status === 'present').length})
              </button>
              <button
                onClick={() => setFilter('late')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'late'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                En retard ({presences.filter(p => p.status === 'late').length})
              </button>
              <button
                onClick={() => setFilter('out_of_hours')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'out_of_hours'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hors horaire ({presences.filter(p => p.status === 'out_of_hours').length})
              </button>
            </div>
            <button
              onClick={loadPresences}
              className="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filteredPresences.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune présence trouvée</h3>
                <p className="text-slate-600">Aucune présence ne correspond aux critères de filtrage</p>
              </div>
            </div>
          </div>
        )}

        {/* Presences table */}
        {filteredPresences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Historique des présences</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
                  <tr className="border-b-2 border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Heure d'entrée
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Heure de sortie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Confiance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPresences.map((presence, index) => (
                    <tr
                      key={presence.id}
                      className={`group hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-purple-50/50 hover:to-blue-50/80 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {presence.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {presence.employee.first_name} {presence.employee.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {presence.employee.matricule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold">
                          {presence.employee.poste}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">{presence.check_in_time || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">{presence.check_out_time || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(presence.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {presence.confidence ? (
                          <span className="font-semibold text-blue-600">{presence.confidence}%</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
