# Face Attendance System

Plateforme de pointage automatique des employés combinant FastAPI, React/Vite et DeepFace (modèle Facenet) pour reconnaître les visages via webcam. Ce document décrit l’architecture complète, la mise en place, les diagrammes UML fournis et la chaîne de traitement Facenet.

---

## 1. Structure du dépôt

```
face-attendance-system-Fill-rouge/
├── backend/                # API FastAPI + logique business
├── frontend/               # SPA React + Vite
├── Diagrammes/
│   ├── Diagramme de classe/      # UML (PlantUML + PNG)
│   ├── Diagramme de use cas/     # Cas d’utilisation
│   └── diagramme de sequince/    # Séquences principales
├── docker-compose.yml      # Orchestration complète (backend, frontend, MySQL, phpMyAdmin)
├── .env.example            # Variables à copier en .env local
└── README.md
```

- **backend/** : FastAPI, SQLAlchemy, DeepFace, endpoints `/api/presence/*`, `/api/reports/*`, `/auth/*`.
- **frontend/** : React Router, tailwind-like styles, pages publiques (`/`, `/entree`, `/sortie`, `/login`) et espace admin (`/dashboard`, `/employees`, `/presences`, `/train-face/:id`, etc.).
- **Diagrammes/** : diagrammes UML exportés + sources `.puml` pour mise à jour rapide.

---

## 2. UML & Documentation visuelle

| Diagramme | Emplacement | Contenu |
|-----------|-------------|---------|
| Diagramme de classes | `Diagrammes/Diagramme de classe/02_class_diagram.puml` (+ `image.png`) | Entités principales (Employe, Presence, FaceTemplate, Admin) + relations DB |
| Diagrammes de séquence | `Diagrammes/diagramme de sequince/` | Scénarios : pointage entrée, pointage sortie, entraînement |
| Diagrammes de cas d’usage | `Diagrammes/Diagramme de use cas/` | Interactions Admin / Employé / Système |

Ouvrez les `.puml` avec PlantUML ou VSCode PlantUML pour régénérer les PNG.

---

## 3. Architecture applicative

| Couche | Technologies | Détails |
|--------|--------------|---------|
| **Frontend** | React 18, Vite, Tailwind CSS-like styles | SPA responsive, appelle l’API via `fetch` + bearer token |
| **Backend** | FastAPI, SQLAlchemy, DeepFace (Facenet), Uvicorn | API REST, génération de PDF (ReportLab), envoi e-mail (SMTP) |
| **Reconnaissance faciale** | DeepFace (modèle Facenet) | Embeddings 128D, comparaison cosine ≥ 0.70 |
| **Base de données** | MySQL 8 | Stocke employés, présences, templates faciaux, tokens rafraîchissement |
| **Conteneurisation** | Docker Compose v2 | Services `backend`, `frontend`, `db`, `phpmyadmin` |

---

## 4. Pipeline Facenet dans le projet

1. **Capture caméra** (frontend `Entree.jsx` / `Sortie.jsx`) → envoi d’une image `multipart/form-data`.
2. **Traitement API** (`backend/app/api/routes/presence.py`) :
   - Sauvegarde temporaire.
   - Appel `DeepFace.represent(..., model_name="Facenet")`.
   - Chargement des encodages existants (`FaceTemplate.encoding_path`).
   - Similarité cosinus et seuil `0.70`.
3. **Résultat** :
   - Si match : appel `record_check_in` ou `record_check_out` (statut `present/late/out_of_hours`).
   - Si échec : message explicite + score.
4. **Nettoyage** : suppression de l’image temporaire, persistance de la présence et retour JSON (employee info, statut, confiance).

Entraînement des visages : route `POST /api/face/capture-training` depuis `frontend/src/pages/TestFace/TrainFace.jsx`, qui capture 20 frames par employé et alimente `FaceTemplate`.

---

## 5. Variables d’environnement

Copier `.env.example` à la racine en `.env` (non commité) :

```
cp .env.example .env
```

Variables clés :
- `DATABASE_URL` ou `DB_*`
- `SECRET_KEY`, `JWT_SECRET`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM_NAME`
- `FRONTEND_URL`, `CORS_ORIGINS`

Dans `docker-compose.yml`, chaque variable possède un fallback (`${VAR:-default}`) pour éviter les plantages sans `.env`.

---

## 6. Installation & exécution

### 6.1. Mode Docker Compose (recommandé)

```powershell
docker compose build
docker compose up --build -d   # (ou sans -d pour logs en direct)
```

Services exposés :
- Backend FastAPI : http://localhost:8000 (Swagger: `/docs`)
- Frontend Vite : http://localhost:5173
- phpMyAdmin : http://localhost:8080
- MySQL : port 3306

Arrêt :
```powershell
docker compose down
```

### 6.2. Mode développeur (hors Docker)

#### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate      # PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Assurez-vous que MySQL tourne, et configurez `DATABASE_URL`.

#### Frontend
```powershell
cd frontend
npm install
npm run dev -- --host --port 5173
```

---

## 7. Points clés du code

- **Authentification** : JWT (access + refresh). `frontend/src/services/authService.js` gère stockage local + refresh.
- **Exports PDF & Email** : routes `api/reports/pdf/*` génèrent PDF (ReportLab) et peuvent être envoyées par e-mail.
- **Composants UI** : `frontend/src/pages/Presence/Presence.jsx` propose export PDF/Excel et envoi e-mail (jour/semaine/mois).
- **Docker** :
  - `backend/Dockerfile`: image Python 3.11, dépendances OpenCV, stockage dans `/app`.
  - `frontend/Dockerfile`: build multi-stage Node 20, Vite dev server exposé sur 5173.
  - `docker-compose.yml`: configure restarts, volumes hot-reload (`backend/app` et `frontend/`).

---

## 8. Ressources supplémentaires

- **Swagger UI** : http://localhost:8000/docs
- **Collection Postman** : à générer via `http://localhost:8000/openapi.json`
- **PlantUML** : ouvrez `.puml` depuis `Diagrammes/**` pour modifier les diagrammes.

---

## 9. Checklist de mise en production

1. Définir toutes les variables sensibles (`SECRET_KEY`, SMTP, DSN).
2. Générer et stocker les modèles faciaux (`/api/face/capture-training`).
3. Configurer HTTPS (proxy Nginx / Traefik).
4. Surveiller l’espace disque (`storage/reports`, `storage/presence_tmp`).
5. Activer les sauvegardes MySQL (`volume mysql_data`).

---

## 10. Support & contribution

1. **Issues / tickets** : ouvrir un ticket GitHub avec étapes de reproduction.
2. **Workflow recommandé** :
   - `git checkout -b feature/...`
   - `npm run lint` / `pytest` (si tests ajoutés)
   - PR → code review.
3. **Contact** : administrateur principal du dépôt GitHub ou via e-mail défini dans `.env`.

Bonne exploration 