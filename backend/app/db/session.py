from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import socket

# Detect Docker
def is_docker():
    try:
        socket.gethostbyname("db")
        return True
    except:
        return False

db_host = "db" if is_docker() else "127.0.0.1"
env_database_url = os.getenv("DATABASE_URL")

# Main URL (with DB)
if env_database_url:
    DATABASE_URL = env_database_url
    DATABASE_URL_NO_DB = None
else:
    DATABASE_URL = f"mysql+pymysql://gp_user:gp_password@{db_host}:3306/gestion_presence"
    # URL WITHOUT database (for creation)
    DATABASE_URL_NO_DB = f"mysql+pymysql://gp_user:gp_password@{db_host}:3306/"

# Create DB if not exists
def create_database_if_not_exists():
    if DATABASE_URL_NO_DB is None:
        return
    print("🔎 Vérification de la base...")

    temp_engine = create_engine(
        DATABASE_URL_NO_DB,
        echo=True,
        isolation_level="AUTOCOMMIT"
    )

    with temp_engine.connect() as conn:
        result = conn.execute(text("SHOW DATABASES LIKE 'gestion_presence'"))
        if not result.fetchone():
            print("📌 Base absente → création…")
            conn.execute(text(
                "CREATE DATABASE gestion_presence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            ))
            print("✅ Base créée")
        else:
            print("✔ Base déjà existante")

    temp_engine.dispose()

# MUST RUN BEFORE ENGINE
create_database_if_not_exists()

# Final engine
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
