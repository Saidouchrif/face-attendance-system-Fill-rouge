from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, DateTime, Date,
    ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import JSON
from app.db.session import Base

class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(Integer, primary_key=True, index=True)

    # Période du rapport
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Fichier généré (PDF par exemple)
    file_path = Column(String(500), nullable=True)

    # Statistiques globales du rapport
    stats_json = Column(JSON, nullable=True)
    # Exemple contenu:
    # {
    #   "total_employes": 35,
    #   "total_presents": 32,
    #   "total_absents": 3,
    #   "total_retards": 5
    # }

    # Admin qui a généré le rapport (optionnel)
    generated_by_admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    commentaire = Column(Text, nullable=True)

    # Relation
    admin = relationship("Admin")
