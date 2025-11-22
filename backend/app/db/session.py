from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
import socket

# Chargement des variables d'environnement
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
elif os.path.exists(".env"):
    load_dotenv(".env")

# Détection Docker : vérifie si le hostname 'db' est résolvable
def is_docker():
    try:
        socket.gethostbyname("db")
        return True
    except:
        return False

# Construction de l'URL de base de données
db_host = "db" if is_docker() else "127.0.0.1"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://gp_user:gp_password@{db_host}:3306/gestion_presence"
)

engine = create_engine(
    DATABASE_URL,
    echo=True,         
    pool_pre_ping=True   
)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base des modèles
Base = declarative_base()
