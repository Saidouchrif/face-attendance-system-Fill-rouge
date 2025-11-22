from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.session import Base


class Presence(Base):
    __tablename__ = "presences"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(CHAR(36), ForeignKey("employes.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # "ENTREE" ou "SORTIE"
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    source = Column(String(50), nullable=False)  # "WEB" ou "MOBILE"
    confidence_score = Column(Float, nullable=True)
    image_capture_path = Column(String(500), nullable=True)

    # Relation avec Employe
    employe = relationship("Employe", back_populates="presences", foreign_keys=[employee_id])

