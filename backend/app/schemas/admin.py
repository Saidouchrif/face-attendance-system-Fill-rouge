# app/schemas/admin.py
from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminBase(BaseModel):
    nom: str
    email: EmailStr
    is_active: bool = True


class AdminCreate(AdminBase):
    password: str


class AdminRead(AdminBase):
    id: int
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
