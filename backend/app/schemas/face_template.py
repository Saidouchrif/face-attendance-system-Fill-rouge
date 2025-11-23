from pydantic import BaseModel
from datetime import datetime

class FaceTemplateBase(BaseModel):
    embedding: str

class FaceTemplateCreate(FaceTemplateBase):
    employe_id: int

class FaceTemplateOut(FaceTemplateBase):
    id: int
    employe_id: int
    created_at: datetime

    class Config:
        orm_mode = True
