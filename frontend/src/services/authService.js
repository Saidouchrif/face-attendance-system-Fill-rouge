// AuthService: handles authentication, token storage, and current admin retrieval

const TOKEN_KEY = 'authToken';
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

  if (!token) {
    throw new Error('Invalid login response: no access token received.');
  }

  saveToken(token);

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
