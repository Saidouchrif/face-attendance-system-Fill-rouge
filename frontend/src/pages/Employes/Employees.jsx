import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees, downloadEmployeesPdf, deleteEmployee } from "../../services/employeesService";
import * as XLSX from "xlsx";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    console.log("Employees component mounted");

    setLoading(true);
    fetchEmployees()
      .then((data) => {
        console.log("DATA:", data);
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const departments = useMemo(() => {
    const unique = new Set(
      employees
        .map((emp) => emp.departement)
        .filter((dept) => dept && dept.trim().length > 0)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    return employees.filter((emp) => {
      const matchesDepartment =
        departmentFilter === "all" ||
        (emp.departement || "").toLowerCase() === departmentFilter.toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [emp.first_name, emp.last_name, emp.matricule]
          .filter(Boolean)
          .map((value) => value.toLowerCase())
          .some((value) => value.includes(normalizedSearch));

      if (!dateFrom && !dateTo) {
        return matchesDepartment && matchesSearch;
      }

      const hireDateRaw = emp.date_embauche;
      const hireDate = hireDateRaw ? new Date(hireDateRaw) : null;
      if (!hireDate || Number.isNaN(hireDate.getTime())) {
        return false;
      }

      const matchesFrom = !fromDate || hireDate >= fromDate;
      const matchesTo = !toDate || hireDate <= toDate;

      return matchesDepartment && matchesSearch && matchesFrom && matchesTo;
    });
  }, [employees, searchTerm, departmentFilter, dateFrom, dateTo]);

  const filtersApplied =
    searchTerm.trim().length > 0 ||
    departmentFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Export functions
  const exportToPDF = async () => {
    if (employees.length === 0 || pdfLoading) return;

    try {
      setPdfLoading(true);
      const pdfBlob = await downloadEmployeesPdf();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "liste-employes.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
      alert("Impossible de générer le PDF pour le moment. Veuillez réessayer.");
    } finally {
      setPdfLoading(false);
    }
  };

  const exportToExcel = () => {
    if (filteredEmployees.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredEmployees.map((emp) => ({
      "Matricule": emp.matricule || "",
      "Nom": emp.last_name || "",
      "Prénom": emp.first_name || "",
      "Email": emp.email || "",
      "Téléphone": emp.phone || "",
      "Poste": emp.poste || "",
      "Département": emp.departement || "",
      "Date d'embauche": emp.date_embauche || ""
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees.xlsx");
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    setDeleting(true);
    try {
      await deleteEmployee(selectedEmployee.id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert(err.message || 'Erreur lors de la suppression de l\'employé');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleViewDetails = (employee) => {
    navigate(`/employee-details/${employee.id}`);
  };

  const handleEdit = (employee) => {
    navigate(`/edit-employee/${employee.id}`);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Liste des employés
          </h1>
          <p className="text-slate-600 text-base lg:text-lg">
            Gestion complète et exportation des données
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">
                  {filteredEmployees.length}
                </span>
                <span className="text-[11px] text-slate-500">
                  sur {employees.length}
                </span>
              </div>
              <span className="text-sm text-slate-600">employés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons with enhanced styling */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-xl border border-slate-200 p-6 lg:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Actions rapides</span>
          </h2>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Cliquez pour effectuer une action</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/add-employee')}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-3 font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Ajouter un employé</span>
          </button>

          <button
            onClick={exportToPDF}
            disabled={employees.length === 0 || pdfLoading}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center space-x-3 font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            {pdfLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
            ) : (
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            <span className="relative z-10">{pdfLoading ? "Génération..." : "Exporter PDF"}</span>
          </button>

          <button
            onClick={exportToExcel}
            disabled={filteredEmployees.length === 0}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center space-x-3 font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-4V8a2 2 0 00-2-2H8a2 2 0 00-2 2v8m5-4h4" />
            </svg>
            <span className="relative z-10">Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Filtres avancés</span>
          </h3>
          <button
            onClick={handleResetFilters}
            disabled={!filtersApplied}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réinitialiser
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Recherche (nom, prénom, matricule)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: EMP123456 ou Dupont"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Département
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
            >
              <option value="all">Tous les départements</option>
              {departments.map((dept) => (
                <option key={dept} value={dept.toLowerCase()}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Date d'embauche (du)
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Date d'embauche (au)
            </label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 text-lg font-medium">Chargement des employés...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && employees.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun employé trouvé</h3>
              <p className="text-slate-600 mb-4">Commencez par ajouter votre premier employé</p>
              <button
                onClick={() => navigate('/add-employee')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter un employé
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && employees.length > 0 && filteredEmployees.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 mb-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-100">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun résultat</h3>
              <p className="text-slate-600 mb-4">
                Aucun employé ne correspond aux filtres sélectionnés.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employees table */}
      {!loading && !error && filteredEmployees.length > 0 && (
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Liste complète des employés</span>
              </h2>
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Défilement horizontal activé</span>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
                <tr className="border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Matricule</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Nom</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Prénom</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Téléphone</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Poste</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Département</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Date d'embauche</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <div className="flex items-center justify-center space-x-1">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={`group hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-purple-50/50 hover:to-blue-50/80 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500 cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm group-hover:scale-125 transition-transform"></div>
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{employee.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {employee.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {employee.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{employee.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{employee.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 rounded-lg text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                        {employee.poste}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 rounded-lg text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                        {employee.departement}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{employee.date_embauche}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(employee)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Voir détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer l'employé <span className="font-bold">{selectedEmployee?.first_name} {selectedEmployee?.last_name}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}