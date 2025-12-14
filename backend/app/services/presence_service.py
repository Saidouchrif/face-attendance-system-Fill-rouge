from sqlalchemy.orm import Session
from datetime import datetime, date, time
from app.models.presence import Presence
from app.models.employee import Employe

def record_check_in(db: Session, employe_id: int, face_confidence: float = None, device_name: str = None):
    """
    Record employee check-in (entry time)
    Work schedule:
    - Period 1: 8:30 - 13:30
    - Period 2: After lunch - 16:45
    - Out of hours: After 16:45 = "out_of_hours" status
    """
    today = date.today()
    now = datetime.now()
    current_time = now.time()
    
    # Check if employee exists
    employee = db.query(Employe).filter(Employe.id == employe_id).first()
    if not employee:
        return None, "Employee not found"
    
    # Check if already checked in today WITHOUT a check-out
    existing = db.query(Presence).filter(
        Presence.employe_id == employe_id,
        Presence.jour == today,
        Presence.check_out_time == None  # Only block if no check-out yet
    ).first()
    
    if existing and existing.check_in_time:
        return None, "Already checked in. Please check out first."
    
    # Define work periods
    morning_start = time(8, 30)  # 8:30 AM
    morning_end = time(13, 30)   # 1:30 PM
    evening_end = time(16, 45)   # 4:45 PM
    
    # Determine status based on time
    if current_time > evening_end:
        # After 16:45 = out of working hours
        status = "out_of_hours"
    elif current_time > morning_start:
        # After 8:30 = late
        status = "late"
    else:
        # Before or at 8:30 = on time
        status = "present"
    
    # Always create a new presence record for each check-in
    # This allows multiple check-in/check-out cycles per day
    presence = Presence(
        employe_id=employe_id,
        jour=today,
        check_in_time=current_time,
        check_out_time=None,
        status=status,
        source="face",
        face_confidence=face_confidence,
        device_name=device_name,
        created_at=datetime.utcnow()
    )
    db.add(presence)
    db.commit()
    db.refresh(presence)
    return presence, None

def record_check_out(db: Session, employe_id: int, face_confidence: float = None, device_name: str = None):
    """
    Record employee check-out (exit time)
    Valid check-out times:
    - 13:30 (end of morning period)
    - 16:45 (end of day)
    """
    today = date.today()
    now = datetime.now()
    current_time = now.time()
    
    # Check if employee exists
    employee = db.query(Employe).filter(Employe.id == employe_id).first()
    if not employee:
        return None, "Employee not found"
    
    # Find the most recent check-in without a check-out for today
    presence = db.query(Presence).filter(
        Presence.employe_id == employe_id,
        Presence.jour == today,
        Presence.check_out_time == None
    ).order_by(Presence.created_at.desc()).first()
    
    if not presence:
        return None, "No active check-in found. Please check in first."
    
    # Update check-out time
    presence.check_out_time = current_time
    if face_confidence:
        presence.face_confidence = face_confidence
    if device_name:
        presence.device_name = device_name
    
    db.commit()
    db.refresh(presence)
    return presence, None

def get_today_presence(db: Session, employe_id: int):
    """
    Get today's presence record for an employee
    """
    today = date.today()
    return db.query(Presence).filter(
        Presence.employe_id == employe_id,
        Presence.jour == today
    ).first()

def get_employee_presences(db: Session, employe_id: int, limit: int = 30):
    """
    Get recent presence records for an employee
    """
    return db.query(Presence).filter(
        Presence.employe_id == employe_id
    ).order_by(Presence.jour.desc()).limit(limit).all()
