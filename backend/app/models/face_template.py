from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class FaceTemplate(Base):
    __tablename__ = "face_templates"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)

    image_path = Column(String(500), nullable=False)

    encoding_path = Column(String(500), nullable=True)

    type = Column(String(50), default="training")

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation inverse
    employe = relationship("Employe", back_populates="face_templates")
