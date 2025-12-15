# Face Attendance System

Application de gestion de présence avec reconnaissance faciale.

## Architecture

- **Backend**: FastAPI (Uvicorn) dans `backend/`
- **Frontend**: React + Vite dans `frontend/`
- **DB**: MySQL (local ou via Docker Compose)

## Prérequis

- **Python** 3.10+
- **Node.js** 18+ (recommandé: 20)
- **MySQL** 8 (si vous lancez en local sans Docker)

## Lancer le projet en local (sans Docker)

### 1) Backend (FastAPI)

Ouvrir PowerShell puis exécuter:

```powershell
# Depuis le dossier backend
PS C:\Users\saido\Desktop\face-attendance-system-Fill-rouge\backend> \.venv310\Scripts\Activate.ps1

pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
```

- **API**: `http://localhost:8000`
- **Swagger**: `http://localhost:8000/docs`
- **Healthcheck**: `http://localhost:8000/health`

#### Configuration (.env)

Le backend charge automatiquement un fichier `.env.local` ou `.env` depuis le dossier courant.

- **Emplacement recommandé**: `backend/.env` (ou `backend/.env.local`)
- Variables possibles:
  - `SECRET_KEY`
  - `ALGORITHM` (par défaut `HS256`)
  - `ACCESS_TOKEN_EXPIRE_MINUTES` (par défaut `60`)
  - `REFRESH_TOKEN_EXPIRE_DAYS` (par défaut `7`)

#### Base de données (mode local)

En mode local (sans Docker), le backend tente de se connecter à MySQL sur `127.0.0.1:3306`.
Assurez-vous que MySQL est démarré et que l’utilisateur DB correspond à la configuration actuelle du projet.

### 2) Frontend (React + Vite)

Ouvrir un autre terminal:

```powershell
# Depuis le dossier frontend
PS C:\Users\saido\Desktop\face-attendance-system-Fill-rouge\frontend> npm install
PS C:\Users\saido\Desktop\face-attendance-system-Fill-rouge\frontend> npm run dev
```

- **Frontend**: `http://localhost:5173`

## Lancer avec Docker Compose (recommandé)

Si vous voulez lancer **backend + frontend + mysql + phpmyadmin** en une seule commande:

```powershell
PS C:\Users\saido\Desktop\face-attendance-system-Fill-rouge> docker compose up --build
```

- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:5173`
- **phpMyAdmin**: `http://localhost:8080`

Pour arrêter:

```powershell
docker compose down
```