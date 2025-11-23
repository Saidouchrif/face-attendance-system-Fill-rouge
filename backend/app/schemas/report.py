from pydantic import BaseModel
from datetime import datetime

class RapportBase(BaseModel):
    month: int
    year: int
    file_path: str

class RapportCreate(RapportBase):
    employe_id: int

class RapportOut(RapportBase):
    id: int
    employe_id: int
    generated_at: datetime

    class Config:
        orm_mode = True
