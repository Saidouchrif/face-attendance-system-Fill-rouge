# app/services/admin_service.py
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.core.security import get_password_hash


def get_admin_by_email(db: Session, email: str) -> Admin | None:
    return db.query(Admin).filter(Admin.email == email).first()


def set_admin_last_login(db: Session, admin: Admin) -> Admin:
    admin.last_login = datetime.utcnow()
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


# Optionnel: création admin (ila bghiti endpoint / seed)
def create_admin(
    db: Session,
    nom: str,
    email: str,
    password: str,
    is_active: bool = True,
) -> Admin:
    hashed = get_password_hash(password)
    admin = Admin(
        nom=nom,
        email=email,
        password_hash=hashed,
        is_active=is_active,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
