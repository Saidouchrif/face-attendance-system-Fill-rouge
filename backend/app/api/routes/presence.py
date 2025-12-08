from fastapi import APIRouter
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.db.session import SessionLocal
from app.models.presence import Presence

router = APIRouter(prefix="/api/presence", tags=["Presence"])


@router.post("/mark/{employee_id}")
def mark_presence(employee_id: int):
    db: Session = SessionLocal()

    now = datetime.now()

    # Check if employee already marked today
    pres = db.query(Presence).filter(
        Presence.employe_id == employee_id,
        Presence.date == date.today()
    ).first()

    if pres:
        # Update exit time
        pres.exit_time = now.time()
    else:
        # Create new entry
        pres = Presence(
            employe_id=employee_id,
            date=date.today(),
            entry_time=now.time(),
            status="late" if now.hour >= 9 else "normal"
        )
        db.add(pres)

    db.commit()
    db.refresh(pres)
    db.close()

    return {
        "success": True,
        "presence_id": pres.id,
        "status": pres.status
    }
