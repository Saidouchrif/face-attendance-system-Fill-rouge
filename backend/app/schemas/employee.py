from pydantic import BaseModel, EmailStr
from datetime import datetime

class EmployeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    role: str

class EmployeCreate(EmployeBase):
    pass

class EmployeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role: str | None = None

class EmployeOut(EmployeBase):
    id: int
    has_face_profile: bool
    face_samples_count: int
    last_face_training_at: datetime | None

    class Config:
        orm_mode = True
