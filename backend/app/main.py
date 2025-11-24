# app/main.py
from fastapi import FastAPI
from app.db.session import engine, Base
from app.api.routes.routes import router as api_router
import app.db.base # Ensures all models are imported
app = FastAPI(title="Face Attendance System - Backend")


@app.on_event("startup")
def on_startup():
    print("🔎 Vérification des tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables ok")


# Inclure tous les routers
app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
