import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Entree from './pages/Entree';
import Sortie from './pages/Sortie';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminLayout from './components/AdminLayout';
import './App.css';
import AddEmployee from './pages/AddEmploye';
import Employees from './pages/Employees';
import EditEmploye from './pages/EditEmploye';
import DetailsEmploye from './pages/DetailsEmploye';
import Presence from './pages/Presence';
import FacePunch from './pages/FacePunch';
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
