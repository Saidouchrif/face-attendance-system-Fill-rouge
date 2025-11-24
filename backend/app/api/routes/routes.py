from fastapi import APIRouter

from app.api.auth.auth import router as auth_router
from app.api.routes.admins import router as admins_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(admins_router)
