from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.models.medical_history import MedicalHistory
from app.models.patient import Patient
from app.schemas.medical_history import PatientMedicalHistoryCreate
from app.schemas.patient import PatientCreate, PatientUpdate


def calculate_age(date_of_birth: date) -> int:
    today = date.today()
    years = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        years -= 1
    return years


def get_patient_or_404(db: Session, patient_id: int, include_inactive: bool = False) -> Patient:
    query = db.query(Patient).filter(Patient.id == patient_id)
    if not include_inactive:
        query = query.filter(Patient.is_active.is_(True))
    patient = query.first()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    return patient


def create_patient(db: Session, patient_in: PatientCreate) -> Patient:
    data = patient_in.model_dump()
    if data.get("age") is None:
        data["age"] = calculate_age(data["date_of_birth"])

    patient = Patient(**data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def list_patients(
    db: Session,
    *,
    page: int,
    limit: int,
    search: str | None = None,
    gender: str | None = None,
    blood_group: str | None = None,
) -> tuple[list[Patient], int]:
    query = db.query(Patient).filter(Patient.is_active.is_(True))

    if search:
        search_like = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_like),
                Patient.last_name.ilike(search_like),
                Patient.patient_code.ilike(search_like),
                Patient.phone.ilike(search_like),
            )
        )

    if gender:
        query = query.filter(Patient.gender == gender)

    if blood_group:
        query = query.filter(Patient.blood_group == blood_group)

    total = query.count()
    patients = (
        query.order_by(Patient.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return patients, total


def get_patient_details(db: Session, patient_id: int) -> Patient:
    patient = (
        db.query(Patient)
        .options(
            selectinload(Patient.medical_history),
            selectinload(Patient.visits),
            selectinload(Patient.prescriptions),
            selectinload(Patient.vitals),
            selectinload(Patient.reports),
        )
        .filter(Patient.id == patient_id, Patient.is_active.is_(True))
        .first()
    )
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    return patient


def update_patient(db: Session, patient_id: int, patient_in: PatientUpdate) -> Patient:
    patient = get_patient_or_404(db, patient_id)
    data = patient_in.model_dump(exclude_unset=True)
    if "date_of_birth" in data and data.get("age") is None:
        data["age"] = calculate_age(data["date_of_birth"])

    for field, value in data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient


def soft_delete_patient(db: Session, patient_id: int) -> None:
    patient = get_patient_or_404(db, patient_id)
    patient.is_active = False
    db.commit()


def create_patient_history(
    db: Session,
    patient_id: int,
    history_in: PatientMedicalHistoryCreate,
) -> MedicalHistory:
    get_patient_or_404(db, patient_id)
    history = MedicalHistory(patient_id=patient_id, **history_in.model_dump())
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def list_patient_history(db: Session, patient_id: int) -> list[MedicalHistory]:
    get_patient_or_404(db, patient_id)
    return (
        db.query(MedicalHistory)
        .filter(MedicalHistory.patient_id == patient_id)
        .order_by(MedicalHistory.created_at.desc())
        .all()
    )
