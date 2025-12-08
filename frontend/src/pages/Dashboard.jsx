import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../services/statsService";
import { usePageTitle } from "../hooks/usePageTitle";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  usePageTitle("Dashboard");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const statCards = [
    {
      label: "Nombre d'employés",
      field: "total_employees",
      color: "blue",
    },
    {
      label: "Présents aujourd'hui",
      field: "present_today",
      color: "green",
    },
    {
      label: "En retard",
      field: "late_today",
      color: "yellow",
    },
    {
      label: "Total pointages",
      field: "total_pointages",
      color: "purple",
    },
  ];

  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
          Tableau de bord
        </h1>

        {/* Loading */}
        {loading && (
          <div className="text-center text-slate-500 text-lg py-10">
            Chargement des statistiques...
          </div>
        )}

        {/* Stats Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {statCards.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
              >
                <p className="text-slate-500 font-semibold text-sm">
                  {item.label}
                </p>
                <p className="text-4xl font-black text-slate-900 mt-2">
                  {stats[item.field]}
                </p>

                <div
                  className={`h-1 mt-4 rounded-full bg-gradient-to-r ${colors[item.color]}`}
                ></div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            className="px-6 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
            onClick={() => navigate("/add-employee")}
          >
            Ajouter un employé
          </button>

          <button
            className="px-6 py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            onClick={() => navigate("/presences")}
          >
            Voir les présences
          </button>

          <button
            className="px-6 py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
            onClick={() => navigate("/employees")}
          >
            Gérer les employés
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
