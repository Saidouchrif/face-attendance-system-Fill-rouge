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
        </Route>

        {/* Default / fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
