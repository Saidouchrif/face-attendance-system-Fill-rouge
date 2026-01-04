// src/services/faceService.js
import { getToken } from "./authService";
import { apiFetch } from "./apiClient";

export async function sendTrainingFrame(employeId, imageDataUrl) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await apiFetch("/face/capture-training", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      employe_id: employeId,
      image: imageDataUrl, // dataURL (base64)
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur lors de l'envoi de la capture");
  }

  return response.json();
}
