from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.session import Base


class Employe(Base):
    __tablename__ = "employes"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    matricule = Column(String(100), unique=True, nullable=False, index=True)
    nom = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    poste = Column(String(255), nullable=False)
    departement = Column(String(255), nullable=False)
    photo_ref_path = Column(String(500), nullable=False)
    consent_biometrique = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relation avec Presence
    presences = relationship("Presence", back_populates="employe", cascade="all, delete-orphan")

