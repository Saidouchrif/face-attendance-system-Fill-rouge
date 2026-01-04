const rawEnvUrl = import.meta.env.VITE_API_URL?.trim() || "https://facepresence-backend.onrender.com";
const DEV_HOST = "localhost";
const DEV_PORT = "8000";

function normalizeBaseUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function computeBaseUrl() {
  if (rawEnvUrl) {
    return normalizeBaseUrl(rawEnvUrl);
  }

  const isDev = import.meta.env.DEV;
  if (!rawEnvUrl) {
    const fallback = isDev
      ? `http://${DEV_HOST}:${DEV_PORT}`
      : typeof window !== "undefined"
        ? `${window.location.origin.replace(/\/$/, "")}/api`
        : "/api";

    console.warn(
      "[FaceAttendance] VITE_API_URL is not defined. Falling back to",
      fallback
    );
    return normalizeBaseUrl(fallback);
  }

  return "";
}

export const API_BASE_URL = computeBaseUrl();

if (import.meta.env.PROD) {
  console.info("[FaceAttendance] API_BASE_URL:", API_BASE_URL);
}

export function buildApiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
  const url = buildApiUrl(path);
  return fetch(url, options);
}
