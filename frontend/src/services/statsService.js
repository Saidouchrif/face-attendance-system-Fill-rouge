export async function getDashboardStats() {
  const response = await fetch("http://localhost:8000/api/stats/dashboard");

  if (!response.ok) {
    throw new Error("Erreur lors du chargement des statistiques");
  }

  return await response.json();
}
