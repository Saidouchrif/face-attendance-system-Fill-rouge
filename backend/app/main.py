# backend/app/main.py
from fastapi import FastAPI
from app.db.session import engine, Base
import app.db.base  

app = FastAPI()

@app.on_event("startup")
def startup_event():
    print("🔎 Vérification / création des tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables OK !")

@app.get("/health")
def health_check():
    return {"status": "ok"}
