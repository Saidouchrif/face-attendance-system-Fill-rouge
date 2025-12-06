import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Entree from './pages/Entree';
import Sortie from './pages/Sortie';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import './App.css';
import AddEmployee from './pages/AddEmploye';
import Employees from './pages/Employees';

// Defines routes and uses ProtectedRoute as an AuthGuard.
function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes - redirect to dashboard if authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/entree" element={<Entree />} />
          <Route path="/sortie" element={<Sortie />} />
        </Route>

        {/* Protected routes - redirect to login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/presences" element={<div className="p-6 text-white"><h1>Présences</h1><p>Page en cours de développement...</p></div>} />
          <Route path="/captures" element={<div className="p-6 text-white"><h1>Captures faciales</h1><p>Page en cours de développement...</p></div>} />
        </Route>

        {/* Default / fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
