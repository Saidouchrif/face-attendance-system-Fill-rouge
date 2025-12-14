# app/api/routes/employees.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_admin
from app.schemas.employee import EmployeRead, EmployeCreate
from app.services.employe_service import (
    get_employes,
    get_employe,
    create_employe,
    delete_employe,
    update_employe,
    get_employee_model_info,
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)

@router.get("/", response_model=List[EmployeRead])
def list_employees(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    return get_employes(db)

@router.post("/", response_model=EmployeRead, status_code=status.HTTP_201_CREATED)
def create_employee_endpoint(
    payload: EmployeCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # possibilité de vérifier matricule unique...
    return create_employe(db, payload)

@router.get("/{employee_id}", response_model=EmployeRead)
def get_employee_detail(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    emp = get_employe(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}", response_model=EmployeRead)
def update_employee_endpoint(
    employee_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    emp = update_employe(db, employee_id, payload)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee_endpoint(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    ok = delete_employe(db, employee_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Employee not found")
    return
