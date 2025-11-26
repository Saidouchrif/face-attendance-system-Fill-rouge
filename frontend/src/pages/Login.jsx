import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, isAuthenticated } from '../services/authService';

// Login page: UI + logic
const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginRequest(email, password);
      // On success, navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Admin Login
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Sign in with your administrator account.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.25rem',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 4,
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.25rem',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 4,
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {error && (
            <div
              style={{ marginBottom: '1rem', color: '#b91c1c', fontSize: '0.85rem' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: 4,
              border: 'none',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
