// AuthService: handles authentication, token storage, and current admin retrieval

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ADMIN_KEY = 'currentAdmin';

// Adjust if your backend runs on a different origin/port
const API_BASE_URL = 'http://localhost:8000';

function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function login(email, password) {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail || 'Login failed. Please check your credentials.';
    throw new Error(message);
  }

  const data = await response.json();
  const token = data.access_token;
  const refreshToken = data.refresh_token;

  if (!token || !refreshToken) {
    throw new Error('Invalid login response: no tokens received.');
  }

  saveToken(token);
  saveRefreshToken(refreshToken);

  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      saveAdmin(admin);
    }
  } catch (err) {
    // If fetching current admin fails, still consider login successful but clear stored admin
    clearAdmin();
  }

  return data;
}

export function logout() {
  clearToken();
  clearRefreshToken();
  clearAdmin();
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const response = await fetch(getApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearToken();
    clearRefreshToken();
    clearAdmin();
    throw new Error('Failed to refresh token. Please log in again.');
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;

  if (!newAccessToken || !newRefreshToken) {
    throw new Error('Invalid refresh response: no tokens received.');
  }

  saveToken(newAccessToken);
  saveRefreshToken(newRefreshToken);

  return newAccessToken;
}

export function saveAdmin(admin) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function getStoredAdmin() {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdmin() {
  localStorage.removeItem(ADMIN_KEY);
}

export async function getCurrentAdmin() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(getApiUrl('/admins/me'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    clearToken();
    clearAdmin();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail || 'Failed to load current admin.';
    throw new Error(message);
  }

  const admin = await response.json();
  return admin;
}

// Example of using token in another protected request
export async function fetchProtectedResource() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(getApiUrl('/some/protected/resource'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch protected resource');
  }

  return response.json();
}
