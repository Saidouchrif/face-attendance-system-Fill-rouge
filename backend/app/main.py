from fastapi import FastAPI
from app.db.session import engine, Base, DATABASE_URL
from sqlalchemy import create_engine, text
# Import des modèles pour qu'ils soient enregistrés dans Base.metadata
import app.db.base  # noqa: F401

app = FastAPI()

def create_database_if_not_exists():
    """Crée la base de données si elle n'existe pas"""
    # Extraire le nom de la base de données de l'URL
    db_name = "gestion_presence"
    
    # Créer une URL sans le nom de la base de données
    if "/" in DATABASE_URL:
        base_url = DATABASE_URL.rsplit("/", 1)[0]
    else:
        base_url = DATABASE_URL
    
    # Se connecter sans spécifier la base de données (avec autocommit pour CREATE DATABASE)
    temp_engine = create_engine(
        base_url, 
        echo=False,
        isolation_level="AUTOCOMMIT"
    )
    
    try:
        with temp_engine.connect() as conn:
            # Vérifier si la base de données existe
            result = conn.execute(text(f"SHOW DATABASES LIKE '{db_name}'"))
            if not result.fetchone():
                # Créer la base de données
                conn.execute(text(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                print(f" ✓ Base de données '{db_name}' créée")
            else:
                print(f" ✓ Base de données '{db_name}' existe déjà")
    except Exception as e:
        print(f" ⚠ Erreur lors de la vérification/création de la base de données: {e}")
    finally:
        temp_engine.dispose()

@app.on_event("startup")
def create_tables():
    print(" Vérification de la base de données…")
    create_database_if_not_exists()
    print(" Vérification des tables…")
    Base.metadata.create_all(bind=engine)
    print(" ✓ Tables vérifiées / créées")
