from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.session import Base


class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    periode_type = Column(String(50), nullable=False)  # "jour", "semaine", "mois"
    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    generated_by_admin_id = Column(CHAR(36), ForeignKey("admins.id"), nullable=False, index=True)
    file_path = Column(String(500), nullable=True)
    format = Column(String(10), nullable=False)  # "PDF" ou "XLSX"
    status = Column(String(50), nullable=False, default="SUCCESS")  # "SUCCESS" ou "FAILED"

    # Relation avec Admin
    admin = relationship("Admin", backref="rapports", foreign_keys=[generated_by_admin_id])

