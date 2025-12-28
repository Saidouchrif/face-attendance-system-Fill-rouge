import os, uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.employee import Employe
from app.models.presence import Presence
from app.services.pdf_service import (
    generate_presence_report_pdf,
    generate_employees_list_pdf,
    generate_presences_list_pdf,
)
from app.services.email_service import send_email

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def build_data(db, start_date, end_date):
    employees = db.query(Employe).all()
    presences = db.query(Presence).filter(
        Presence.jour >= start_date,
        Presence.jour <= end_date
    ).all()

    stats = {
        "total_employees": len(employees),
        "present": len(set(p.employe_id for p in presences)),
        "late": len([p for p in presences if p.status == "late"]),
        "absent": max(0, len(employees) - len(set(p.employe_id for p in presences))),
        "total_pointages": len(presences),
    }

    emp_rows = []
    delays = {}
    best_employee = None

    for e in employees:
        emp_pres = [p for p in presences if p.employe_id == e.id]
        late_records = [p for p in emp_pres if p.status == "late"]

        emp_rows.append({
            "matricule": e.matricule,
            "name": f"{e.first_name} {e.last_name}",
            "poste": e.poste,
            "departement": e.departement,
            "present": len(emp_pres) > 0,
            "late_count": len(late_records),
        })

        delays[f"{e.matricule} - {e.first_name} {e.last_name}"] = [
            {"date": p.jour, "time": p.check_in_time.strftime("%H:%M")}
            for p in late_records
        ]

        if not late_records and emp_pres and not best_employee:
            best_employee = {
                "name": f"{e.first_name} {e.last_name}",
                "poste": e.poste,
                "departement": e.departement,
            }

    return stats, emp_rows, delays, best_employee


@router.post("/pdf/day")
def pdf_day(db: Session = Depends(get_db)):
    today = date.today()
    stats, emp, delays, best = build_data(db, today, today)

    path = f"storage/reports/day_{today}.pdf"

    generate_presence_report_pdf(
        "Rapport Journalier",
        f"Date : {today}",
        stats, emp, delays, best, path
    )

    send_email(
        os.getenv("REPORT_TO_EMAIL"),
        "Rapport Journalier de Présence - FacePresence",
        "Ce rapport journalier contient les statistiques, les retards et le meilleur employé.",
        path
    )

    return {"success": True, "pdf": path}


@router.get("/pdf/employees", response_class=FileResponse)
def pdf_employees(db: Session = Depends(get_db)):
    employees = db.query(Employe).order_by(Employe.last_name.asc()).all()

    employee_rows = [
        {
            "matricule": emp.matricule,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "phone": emp.phone,
            "poste": emp.poste,
            "departement": emp.departement,
            "date_embauche": emp.date_embauche.strftime("%d/%m/%Y") if emp.date_embauche else "",
        }
        for emp in employees
    ]

    filename = f"liste_employes_{date.today().isoformat()}_{uuid.uuid4().hex[:6]}.pdf"
    path = os.path.join("storage", "reports", filename)

    generate_employees_list_pdf(employee_rows, path)

    return FileResponse(
        path,
        media_type="application/pdf",
        filename="liste-employes.pdf",
    )


@router.post("/pdf/week")
def pdf_week(db: Session = Depends(get_db)):
    end = date.today()
    start = end - timedelta(days=6)

    stats, emp, delays, best = build_data(db, start, end)
    path = f"storage/reports/week_{start}_{end}.pdf"

    generate_presence_report_pdf(
        "Rapport Hebdomadaire",
        f"Semaine : {start} → {end}",
        stats, emp, delays, best, path
    )

    send_email(
        os.getenv("REPORT_TO_EMAIL"),
        "Rapport Hebdomadaire de Présence - FacePresence",
        "Ce rapport hebdomadaire contient les statistiques de la semaine, les retards et le meilleur employé.",
        path
    )

    return {"success": True, "pdf": path}


@router.post("/pdf/month")
def pdf_month(db: Session = Depends(get_db)):
    today = date.today()
    start = today.replace(day=1)

    stats, emp, delays, best = build_data(db, start, today)
    path = f"storage/reports/month_{today.month}_{today.year}.pdf"

    generate_presence_report_pdf(
        "Rapport Mensuel",
        f"Mois : {today.month}/{today.year}",
        stats, emp, delays, best, path
    )

    send_email(
        os.getenv("REPORT_TO_EMAIL"),
        "Rapport Mensuel de Présence - FacePresence",
        "Ce rapport mensuel contient une analyse complète de la présence et des retards.",
        path
    )

    return {"success": True, "pdf": path}


@router.get("/pdf/presences", response_class=FileResponse)
def pdf_presences(db: Session = Depends(get_db)):
    status_labels = {
        "present": "À l'heure",
        "late": "En retard",
        "out_of_hours": "Hors horaire",
    }

    presences = db.query(Presence).order_by(
        Presence.jour.desc(),
        Presence.check_in_time.desc()
    ).limit(200).all()

    rows = []
    for presence in presences:
        employee = presence.employe
        rows.append({
            "date": presence.jour.strftime("%d/%m/%Y"),
            "employee_name": f"{employee.first_name} {employee.last_name}" if employee else "",
            "matricule": employee.matricule if employee else "",
            "poste": employee.poste if employee else "",
            "check_in": presence.check_in_time.strftime("%H:%M") if presence.check_in_time else "-",
            "check_out": presence.check_out_time.strftime("%H:%M") if presence.check_out_time else "-",
            "status": status_labels.get(presence.status, presence.status or "-"),
            "confidence": f"{round(presence.face_confidence * 100, 2)}%" if presence.face_confidence else "-",
        })

    filename = f"presences_{date.today().isoformat()}_{uuid.uuid4().hex[:6]}.pdf"
    path = os.path.join("storage", "reports", filename)

    generate_presences_list_pdf(rows, path)

    return FileResponse(
        path,
        media_type="application/pdf",
        filename="historique-presences.pdf",
    )
