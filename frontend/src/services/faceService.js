// src/services/faceService.js
import { getToken } from "./authService";

const API_BASE_URL = "http://localhost:8000";

function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function sendTrainingFrame(employeId, imageDataUrl) {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const response = await fetch(getApiUrl("/face/capture-training"), {
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
