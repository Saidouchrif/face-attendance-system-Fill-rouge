from pydantic import BaseModel
from datetime import datetime

class PresenceBase(BaseModel):
    status: str    # "ENTREE" / "SORTIE"
    device_id: str | None = None

class PresenceCreate(PresenceBase):
    employe_id: int

class PresenceOut(PresenceBase):
    id: int
    employe_id: int
    timestamp: datetime

    class Config:
        orm_mode = True
