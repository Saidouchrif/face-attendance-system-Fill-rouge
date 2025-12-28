# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
import os

# ---------------- Security config ----------------
SECRET_KEY = os.getenv("SECRET_KEY", "Saidouchrif12345")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ---------------- Password hashing engine ----------------
pwd_context = CryptContext(
    schemes=["argon2"],     # ⚡ أقوى و بدون مشاكل
    deprecated="auto"
)

# ---------------- Password helpers ----------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie le mot de passe en utilisant Argon2.
    Retourne False si le hash est invalide au lieu de lever une exception.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Génère un hash Argon2 sécurisé pour stockage."""
    return pwd_context.hash(password)

# ---------------- JWT helpers ----------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    ))

    to_encode.update({"exp": expire, "type": "access"})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crée un refresh token avec une durée de vie plus longue."""
    to_encode = data.copy()

    expire = datetime.utcnow() + (expires_delta or timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    ))

    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
