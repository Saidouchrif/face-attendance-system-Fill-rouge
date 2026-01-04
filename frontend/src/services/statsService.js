import { apiFetch } from "./apiClient";

export async function getDashboardStats() {
  const response = await apiFetch("/api/stats/dashboard");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des statistiques");
  }

  return await response.json();
}
