import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

// PublicRoute redirects authenticated users to dashboard
const PublicRoute = () => {
  const authenticated = isAuthenticated();

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
