# ===============================
# 1️⃣ Base image Python
# ===============================
FROM python:3.11-slim

# ===============================
# 2️⃣ Installation des dépendances système
# OpenCV / face-recognition ont besoin de CMake et bibliothèques graphiques
# ===============================
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# 3️⃣ Dossier de travail
# ===============================
WORKDIR /app

# ===============================
# 4️⃣ Copier les dépendances Python
# ===============================
COPY backend/requirements.txt /app/requirements.txt

# ===============================
# 5️⃣ Installer les dépendances Python
# ===============================
RUN pip install --no-cache-dir -r /app/requirements.txt

# ===============================
# 6️⃣ Copier le code source FastAPI
# ===============================
COPY backend/app /app/app

# ===============================
# 7️⃣ Variables d’environnement
# ===============================
ENV PYTHONUNBUFFERED=1
ENV FASTAPI_ENV=production
ENV PORT=8000

# ===============================
# 8️⃣ Exposer le port de l’API
# ===============================
EXPOSE 8000

# ===============================
# 9️⃣ Commande de démarrage du serveur
# ===============================
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
