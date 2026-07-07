from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import cast, Date
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.user import User
from app.models.visit import Visit, VisitStatus
from app.schemas.visit import VisitCreate


def create_visit(db: Session, visit_in: VisitCreate) -> Visit:
    patient = db.query(Patient).filter(Patient.id == visit_in.patient_id, Patient.is_active.is_(True)).first()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    if visit_in.doctor_id is not None:
        doctor = db.get(User, visit_in.doctor_id)
        if doctor is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found.")

    visit = Visit(**visit_in.model_dump())
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


def list_visits(
    db: Session,
    *,
    doctor_id: int | None = None,
    patient_id: int | None = None,
    visit_date: date | None = None,
    status_filter: VisitStatus | None = None,
) -> list[Visit]:
    query = db.query(Visit)

    if doctor_id is not None:
        query = query.filter(Visit.doctor_id == doctor_id)

    if patient_id is not None:
        query = query.filter(Visit.patient_id == patient_id)

    if visit_date is not None:
        query = query.filter(cast(Visit.visit_date, Date) == visit_date)

    if status_filter is not None:
        query = query.filter(Visit.status == status_filter)

    return query.order_by(Visit.visit_date.desc()).all()
