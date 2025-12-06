import { getToken } from "./authService";

const API_BASE_URL = "http://localhost:8000";

function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

// 🟦 Fetch all employees
export async function fetchEmployees() {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await fetch(getApiUrl("/employees/"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load employees");
  }

  return response.json();
}

// 🟩 Create employee
export async function createEmployee(employeeData) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await fetch(getApiUrl("/employees/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(employeeData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create employee");
  }

  return response.json();
}
