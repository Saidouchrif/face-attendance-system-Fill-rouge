from pydantic import BaseModel, EmailStr

class AdminBase(BaseModel):
    username: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str

class AdminUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None

class AdminOut(AdminBase):
    id: int

    class Config:
        orm_mode = True
