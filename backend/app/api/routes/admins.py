from fastapi import APIRouter, Depends

from app.core.deps import get_current_admin, get_db
from app.schemas.admin import AdminRead
from app.models.admin import Admin

router = APIRouter(prefix="/admins", tags=["Admins"])

@router.get("/me", response_model=AdminRead)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin