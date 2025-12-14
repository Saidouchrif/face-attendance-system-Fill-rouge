# app/api/auth/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.admin import AdminCreate, AdminRead
from app.services.admin_service import create_admin, get_admin_by_email
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])


# -----------------------------------
# 🔐 LOGIN
# -----------------------------------
@router.post("/login", response_model=Token)
def login_admin(credentials: LoginRequest, db: Session = Depends(get_db)):

    admin = get_admin_by_email(db, credentials.email)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Admin inactive")

    token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token({"sub": admin.email}, token_expires)
    refresh_token = create_refresh_token({"sub": admin.email})

    return Token(access_token=access_token, refresh_token=refresh_token)


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
