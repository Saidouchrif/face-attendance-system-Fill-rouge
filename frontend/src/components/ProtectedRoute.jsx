import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../services/authService';
import AdminLayout from './AdminLayout';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // نتاكد من التوكن مرة وحدة فقط
    const token = getToken();
    console.log("ProtectedRoute: checking token", !!token);

    if (token) {
      console.log("ProtectedRoute: token found, allowing access");
      setAllowed(true);
    } else {
      console.log("ProtectedRoute: no token, redirecting to login");
      setAllowed(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center text-white p-10">Loading...</div>;
  }

  return allowed ? <AdminLayout><Outlet /></AdminLayout> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
