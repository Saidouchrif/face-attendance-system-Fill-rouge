from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.session import Base

class Employe(Base):
    __tablename__ = "employes"

    id = Column(Integer, primary_key=True, index=True)

    # Identité
    matricule = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(30), nullable=True)

    # Infos professionnelles
    poste = Column(String(100), nullable=True)
    departement = Column(String(100), nullable=True)
    date_embauche = Column(Date, nullable=True)

    # Statut
    is_active = Column(Boolean, default=True)

    has_face_profile = Column(Boolean, default=False)
    face_samples_count = Column(Integer, default=0)
    last_face_training_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relations
    presences = relationship("Presence", back_populates="employe")
    face_templates = relationship("FaceTemplate", back_populates="employe")