from fastapi import APIRouter
from sqlalchemy.orm import Session
from datetime import date

from app.db.session import SessionLocal
from app.models.employee import Employe
from app.models.presence import Presence

router = APIRouter(prefix="/api", tags=["Statistics"])

@router.get("/stats/dashboard")
def dashboard_stats():

    db: Session = SessionLocal()

    # Total employees
    total_employees = db.query(Employe).count()

    # Employees present today
    present_today = db.query(Presence).filter(
        Presence.jour == date.today()
    ).count()

    # Employees late today
    late_today = db.query(Presence).filter(
        Presence.jour == date.today(),
        Presence.status == "late"
    ).count()

    # Total pointages
    total_pointages = db.query(Presence).count()

    db.close()

    return {
        "success": True,
        "total_employees": total_employees,
        "present_today": present_today,
        "late_today": late_today,
        "total_pointages": total_pointages
    }
