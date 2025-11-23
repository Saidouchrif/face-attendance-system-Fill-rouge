from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(50), default="admin")
    is_superadmin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
