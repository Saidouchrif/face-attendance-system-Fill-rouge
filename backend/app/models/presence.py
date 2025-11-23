from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, ForeignKey, Date, Time,
    String, Float, DateTime
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class Presence(Base):
    __tablename__ = "presences"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)

    # Date d'attendance
    jour = Column(Date, nullable=False, index=True)

    # Heures entrées / sorties
    check_in_time = Column(Time, nullable=True)
    check_out_time = Column(Time, nullable=True)

    # Statut: present / absent / late / missing_check_out ...
    status = Column(String(30), default="present")

    # Source: face / manual / admin
    source = Column(String(30), default="face")

    # Confiance du modèle de reconnaissance (0-1)
    face_confidence = Column(Float, nullable=True)

    # Optionnel: poste de pointage / device
    device_name = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation inverse
    employe = relationship("Employe", back_populates="presences")

