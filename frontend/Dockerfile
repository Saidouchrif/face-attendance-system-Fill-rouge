# ============================
# 1. Base Image
# ============================
FROM node:20-alpine

# ============================
# 2. Dossier de travail
# ============================
WORKDIR /app

# ============================
# 3. Copier les fichiers package
# ============================
COPY frontend/package*.json ./

# ============================
# 4. Installer dépendances npm
# ============================
RUN npm install

# ============================
# 5. Copier le code source React
# ============================
COPY frontend/ .

# ============================
# 6. Exposer le port (Vite dev)
# ============================
EXPOSE 5173

# ============================
# 7. Commande de développement
# ============================
CMD ["npm", "run", "dev", "--", "--host"]
