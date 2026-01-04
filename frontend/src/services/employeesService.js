import { getToken } from "./authService";
import { apiFetch } from "./apiClient";

// 🟦 Fetch all employees
export async function fetchEmployees() {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch("/employees/", {
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

export async function downloadEmployeesPdf() {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch("/api/reports/pdf/employees", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to generate employees PDF");
  }

  return response.blob();
}

// 🟩 Create employee
export async function createEmployee(employeeData) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch("/employees/", {
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

// 🟥 Delete employee
export async function deleteEmployee(employeeId) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch(`/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete employee");
  }

  return response.json();
}

// 🟨 Update employee
export async function updateEmployee(employeeId, employeeData) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch(`/employees/${employeeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(employeeData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update employee");
  }

  return response.json();
}

// 🟦 Get employee by ID
export async function getEmployeeById(employeeId) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch(`/employees/${employeeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load employee");
  }

  return response.json();
}

// 🟪 Get employee face recognition model info
export async function getEmployeeModelInfo(employeeId) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch(`/api/face/model-info/${employeeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // If 404, it means no model info exists (employee has no face profile)
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to load model information");
  }

  return response.json();
}
