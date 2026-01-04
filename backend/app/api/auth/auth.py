# app/api/auth/auth.py
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.deps import get_db
from app.schemas.admin import AdminCreate, AdminRead
from app.services.admin_service import create_admin, get_admin_by_email, set_admin_last_login
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM,
)
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)


# -----------------------------------
# 🔐 LOGIN
# -----------------------------------
@router.post("/login", response_model=Token)
def login_admin(credentials: LoginRequest, db: Session = Depends(get_db)):
    try:
        admin = get_admin_by_email(db, credentials.email)
        if not admin:
            logger.info("Login failed for %s: admin not found", credentials.email)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        try:
            is_valid_password = verify_password(credentials.password, admin.password_hash)
        except Exception as password_error:
            logger.exception("Password verification error for %s", credentials.email)
            raise HTTPException(status_code=500, detail="Password hashing error") from password_error

        if not is_valid_password:
            logger.info("Login failed for %s: invalid password", credentials.email)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not admin.is_active:
            logger.info("Login failed for %s: admin inactive", credentials.email)
            raise HTTPException(status_code=403, detail="Admin inactive")

        # Optional: update last login timestamp for auditing purposes
        try:
            set_admin_last_login(db, admin)
        except Exception:
            db.rollback()
            logger.warning("Failed to update last_login for %s", credentials.email, exc_info=True)
        else:
            db.commit()

        token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": admin.email}
        access_token = create_access_token(payload, token_expires)
        refresh_token = create_refresh_token(payload)

        return Token(access_token=access_token, refresh_token=refresh_token)

    except HTTPException:
        # FastAPI will convert HTTPException to JSON response
        raise
    except Exception as unexpected_error:
        db.rollback()
        logger.exception("Unexpected error during login for %s", credentials.email)
        raise HTTPException(status_code=500, detail="Internal server error") from unexpected_error


# -----------------------------------
# 🆕 CREATE ADMIN
# -----------------------------------
@router.post("/create-admin", response_model=AdminRead)
def create_new_admin(admin: AdminCreate, db: Session = Depends(get_db)):

    exist = get_admin_by_email(db, admin.email)
    if exist:
        raise HTTPException(status_code=400, detail="Admin already exists")

    new_admin = create_admin(
        db=db,
        nom=admin.nom,
        email=admin.email,
        password=admin.password,
        is_active=admin.is_active
    )

    return new_admin


# -----------------------------------
# 🔄 REFRESH TOKEN
# -----------------------------------
@router.post("/refresh", response_model=Token)
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Rafraîchit l'access token en utilisant le refresh token.
    Permet de renouveler automatiquement la session sans re-authentification.
    """
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        admin = get_admin_by_email(db, email)
        if not admin:
            raise HTTPException(status_code=401, detail="User not found")
        
        if not admin.is_active:
            raise HTTPException(status_code=400, detail="Admin inactive")
        
        token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token({"sub": email}, token_expires)
        new_refresh_token = create_refresh_token({"sub": email})
        
        return Token(access_token=new_access_token, refresh_token=new_refresh_token)
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
