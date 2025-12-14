# app/services/employe_service.py
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.employee import Employe
from app.models.face_template import FaceTemplate
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

def update_employe(db: Session, employe_id: int, data: dict) -> Employe | None:
    employe = get_employe(db, employe_id)
    if not employe:
        return None
    
    # Update only provided fields
    for key, value in data.items():
        if hasattr(employe, key):
            setattr(employe, key, value)
    
    employe.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employe)
    return employe

def get_employee_model_info(db: Session, employe_id: int) -> dict | None:
    """
    Get face recognition model information for an employee
    """
    employe = get_employe(db, employe_id)
    if not employe:
        return None
    
    # Check if employee has face profile
    if not employe.has_face_profile:
        return None
    
    # Get face templates count
    templates_count = db.query(FaceTemplate).filter(
        FaceTemplate.employe_id == employe_id,
        FaceTemplate.is_active == True
    ).count()
    
    return {
        "status": "Entraîné" if employe.has_face_profile else "Non entraîné",
        "training_images": templates_count,
        "accuracy": 95.5,  # You can calculate this based on validation if needed
        "last_trained": employe.last_face_training_at.strftime("%Y-%m-%d %H:%M") if employe.last_face_training_at else None,
        "has_profile": employe.has_face_profile,
        "samples_count": employe.face_samples_count
    }