import os
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_1 = os.path.join(BASE_DIR, "images", "logo.png")
LOGO_2 = os.path.join(BASE_DIR, "images", "logo2.jpg")


def _logo_header():
    return Table(
        [[
            Image(LOGO_1, width=80, height=50) if os.path.exists(LOGO_1) else "",
            Paragraph("<b>FacePresence</b>", getSampleStyleSheet()["Title"]),
            Image(LOGO_2, width=80, height=50) if os.path.exists(LOGO_2) else "",
        ]],
        colWidths=[90, 350, 90],
    )


def generate_presence_report_pdf(
    title: str,
    period_label: str,
    stats: dict,
    employees: list,
    delays: dict,
    best_employee: dict | None,
    output_path: str,
):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    styles = getSampleStyleSheet()
    elements = []

    header_table = _logo_header()
    header_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("ALIGN", (2, 0), (2, 0), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 10))

    # ===== TITLE =====
    elements.append(Paragraph(title, styles["Heading2"]))
    elements.append(Paragraph(period_label, styles["Normal"]))
    elements.append(Spacer(1, 12))

    # ===== STATS =====
    elements.append(Paragraph("<b>Statistiques Générales</b>", styles["Heading2"]))
    stats_table = Table([
        ["Total employés", stats["total_employees"]],
        ["Présents", stats["present"]],
        ["En retard", stats["late"]],
        ["Absents", stats["absent"]],
        ["Total pointages", stats["total_pointages"]],
    ])

    stats_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 1, colors.grey),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#6B46C1")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ]))

    elements.append(stats_table)
    elements.append(Spacer(1, 16))

    # ===== BEST EMPLOYEE =====
    if best_employee:
        elements.append(Paragraph("<b>Meilleur Employé</b>", styles["Heading2"]))
        elements.append(Paragraph(
            f"{best_employee['name']} – {best_employee['poste']} ({best_employee['departement']})",
            styles["Normal"]
        ))
        elements.append(Spacer(1, 12))

    # ===== EMPLOYEES TABLE =====
    elements.append(Paragraph("<b>Liste des employés</b>", styles["Heading2"]))
    emp_table_data = [
        ["Matricule", "Nom", "Poste", "Département", "Présent", "Retards"]
    ]

    for e in employees:
        emp_table_data.append([
            e["matricule"],
            e["name"],
            e["poste"],
            e["departement"],
            "Oui" if e["present"] else "Non",
            e["late_count"]
        ])

    emp_table = Table(emp_table_data, repeatRows=1)
    emp_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 1, colors.black),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#CBD5E0")),
        ("ALIGN", (4,1), (-1,-1), "CENTER"),
    ]))

    elements.append(emp_table)
    elements.append(Spacer(1, 16))

    # ===== DELAYS =====
    elements.append(Paragraph("<b>Détails des retards</b>", styles["Heading2"]))
    for emp, records in delays.items():
        if records:
            elements.append(Paragraph(emp, styles["Normal"]))
            for r in records:
                elements.append(Paragraph(
                    f"- {r['date']} à {r['time']}",
                    styles["Italic"]
                ))
            elements.append(Spacer(1, 6))

    doc = SimpleDocTemplate(output_path, pagesize=A4)
    doc.build(elements)


def generate_employees_list_pdf(employees: list, output_path: str):
    """
    Generate a PDF containing the full employee list with company logos.
    `employees` must be a list of dicts with keys:
    matricule, first_name, last_name, email, phone, poste, departement, date_embauche
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    styles = getSampleStyleSheet()
    elements = []

    header_table = _logo_header()
    header_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("ALIGN", (2, 0), (2, 0), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("<b>Liste des employés</b>", styles["Heading2"]))
    elements.append(Paragraph(
        f"Généré le {date.today().strftime('%d/%m/%Y')}",
        styles["Normal"]
    ))
    elements.append(Spacer(1, 16))

    data = [[
        "Matricule", "Nom", "Prénom", "Email", "Téléphone",
        "Poste", "Département", "Date d'embauche"
    ]]

    for emp in employees:
        data.append([
            emp.get("matricule", ""),
            emp.get("last_name", ""),
            emp.get("first_name", ""),
            emp.get("email", ""),
            emp.get("phone", ""),
            emp.get("poste", ""),
            emp.get("departement", ""),
            emp.get("date_embauche", "") or "",
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1D4ED8")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Document généré automatiquement par FacePresence.",
        styles["Italic"]
    ))

    doc = SimpleDocTemplate(output_path, pagesize=A4)
    doc.build(elements)


def generate_presences_list_pdf(presences: list, output_path: str, subtitle: str | None = None):
    """
    Generate a PDF containing the list of presences with company logos.
    Each presence dict must contain:
    date, employee_name, matricule, poste, check_in, check_out, status, confidence
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    styles = getSampleStyleSheet()
    elements = []

    header_table = _logo_header()
    header_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("ALIGN", (2, 0), (2, 0), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("<b>Historique des présences</b>", styles["Heading2"]))
    if subtitle:
        elements.append(Paragraph(subtitle, styles["Normal"]))
    else:
        elements.append(Paragraph(
            f"Généré le {date.today().strftime('%d/%m/%Y')}",
            styles["Normal"]
        ))
    elements.append(Spacer(1, 16))

    data = [[
        "Date", "Employé", "Matricule", "Poste",
        "Entrée", "Sortie", "Statut", "Confiance"
    ]]

    for presence in presences:
        data.append([
            presence.get("date", ""),
            presence.get("employee_name", ""),
            presence.get("matricule", ""),
            presence.get("poste", ""),
            presence.get("check_in", "-"),
            presence.get("check_out", "-"),
            presence.get("status", ""),
            presence.get("confidence", "-"),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "Document généré automatiquement par FacePresence.",
        styles["Italic"]
    ))

    doc = SimpleDocTemplate(output_path, pagesize=A4)
    doc.build(elements)
