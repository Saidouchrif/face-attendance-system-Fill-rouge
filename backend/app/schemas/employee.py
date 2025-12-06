from pydantic import BaseModel, EmailStr
from datetime import datetime, date

class EmployeBase(BaseModel):
    matricule: str
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    poste: str | None = None
    departement: str | None = None
    date_embauche: date | None = None

class EmployeCreate(EmployeBase):
    # is_active خليته default = True فالموديل
    pass

class EmployeRead(EmployeBase):
    id: int
    is_active: bool
    has_face_profile: bool
    face_samples_count: int
    last_face_training_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
