from fastapi import APIRouter

from app.api.auth.auth import router as auth_router
from app.api.routes.admins import router as admins_router
from app.api.routes.face import router as face_router
from app.api.routes.employes import router as employees_router
router = APIRouter()

router.include_router(auth_router)
router.include_router(admins_router)
router.include_router(face_router)
router.include_router(employees_router)
