import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Pagehome/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Entree from './pages/Entree_employee/Entree';
import Sortie from './pages/Sortiee_employee/Sortie';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminLayout from './components/AdminLayout';
import './App.css';
import AddEmployee from './pages/Employes/AddEmploye';
import Employees from './pages/Employes/Employees';
import EditEmploye from './pages/Employes/EditEmploye';
import DetailsEmploye from './pages/Employes/DetailsEmploye';
import Presence from './pages/Presence/Presence';
import FacePunch from './pages/Components/FacePunch';
import TrainFace from './pages/TrainFace';

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
          <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/employees" element={<AdminLayout><Employees /></AdminLayout>} />
          <Route path="/add-employee" element={<AdminLayout><AddEmployee /></AdminLayout>} />
          <Route path="/edit-employee/:id" element={<AdminLayout><EditEmploye /></AdminLayout>} />
          <Route path="/employee-details/:id" element={<AdminLayout><DetailsEmploye /></AdminLayout>} />
          <Route path="/presences" element={<AdminLayout><Presence /></AdminLayout>} />
          <Route path="/face-punch" element={<AdminLayout><FacePunch /></AdminLayout>} />
          <Route path="/train-face/:id" element={<AdminLayout><TrainFace /></AdminLayout>} />
        </Route>

        {/* Default / fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
