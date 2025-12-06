# app/services/employe_service.py
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.employee import Employe
from app.schemas.employee import EmployeCreate

def get_employes(db: Session):
    return db.query(Employe).order_by(Employe.created_at.desc()).all()

def get_employe(db: Session, employe_id: int) -> Employe | None:
    return db.query(Employe).filter(Employe.id == employe_id).first()

def create_employe(db: Session, data: EmployeCreate) -> Employe:
    employe = Employe(
        matricule=data.matricule,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        poste=data.poste,
        departement=data.departement,
        date_embauche=data.date_embauche,
        is_active=True,
        has_face_profile=False,
        face_samples_count=0,
        last_face_training_at=None,
    )
    db.add(employe)
    db.commit()
    db.refresh(employe)
    return employe

def delete_employe(db: Session, employe_id: int) -> bool:
    employe = get_employe(db, employe_id)
    if not employe:
        return False
    db.delete(employe)
    db.commit()
    return True
def get_employee_by_matricule(db: Session, matricule: str):
    return db.query(Employe).filter(Employe.matricule == matricule).first()