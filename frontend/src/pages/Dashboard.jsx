import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  logout,
  getStoredAdmin,
  getCurrentAdmin,
  fetchProtectedResource,
} from '../services/authService';

// Simple Dashboard page. Protected by ProtectedRoute.
// Shows "Welcome Admin" and demonstrates using token in protected calls.
const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getStoredAdmin());
  const [protectedMessage, setProtectedMessage] = useState('');
  const [error, setError] = useState('');

  // Load current admin info from backend (validates token)
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const data = await getCurrentAdmin();
        setAdmin(data);
      } catch (err) {
        // If token invalid/expired -> logout and redirect to login
        logout();
        navigate('/login', { replace: true });
      }
    };

    loadAdmin();
  }, [navigate]);

  // Example of calling another protected endpoint with the token
  useEffect(() => {
    const loadProtected = async () => {
      try {
        const result = await fetchProtectedResource();
        setProtectedMessage(JSON.stringify(result));
      } catch (err) {
        setError(err.message || 'Failed to load protected resource.');
      }
    };

    // Optional: décommente pour tester l’appel protégé
    // loadProtected();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const adminName = admin?.name || admin?.email || 'Admin';

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f9fafb',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>
          Welcome {adminName}
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main>
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          This is the admin dashboard.
        </p>

        {error && (
          <div style={{ marginBottom: '1rem', color: '#b91c1c', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {protectedMessage && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 6,
              backgroundColor: '#e5e7eb',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            Protected resource data:
            <br />
            {protectedMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
