from datetime import date, datetime, timezone
from pathlib import Path
import sys


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    AITriage,
    ClinicSetting,
    MedicalHistory,
    Notification,
    Patient,
    Prescription,
    User,
    Visit,
    Vital,
)
from app.models.ai_triage import SeverityLevel
from app.models.user import UserRole
from app.models.visit import VisitStatus
from app.utils.security import hash_password


def get_or_create_user(
    db: Session,
    *,
    full_name: str,
    email: str,
    password: str,
    role: UserRole,
    phone: str | None = None,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        phone=phone,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def seed() -> None:
    db = SessionLocal()
    try:
        admin = get_or_create_user(
            db,
            full_name="System Administrator",
            email="admin@test.com",
            password="password123",
            role=UserRole.admin,
            phone="+1 555 100 0001",
        )
        doctor = get_or_create_user(
            db,
            full_name="Dr. Anna Brooks",
            email="doctor@test.com",
            password="password123",
            role=UserRole.doctor,
            phone="+1 555 100 0002",
        )
        staff = get_or_create_user(
            db,
            full_name="Maya Patel",
            email="staff@test.com",
            password="password123",
            role=UserRole.staff,
            phone="+1 555 100 0003",
        )

        if not db.query(ClinicSetting).first():
            db.add(
                ClinicSetting(
                    clinic_name="Eastside Medical Clinic",
                    address="800 Healthcare Blvd, Austin TX 78701",
                    phone="+1 555 800 9000",
                    email="info@eastsidemedical.com",
                )
            )

        if db.query(Patient).count() == 0:
            sarah = Patient(
                first_name="Sarah",
                last_name="Mitchell",
                date_of_birth=date(1990, 4, 12),
                age=34,
                gender="Female",
                blood_group="A+",
                phone="+1 555 234 5678",
                email="sarah.mitchell@example.com",
                address="142 Maple Street, Austin TX 78701",
                emergency_contact="+1 555 234 5679",
            )
            james = Patient(
                first_name="James",
                last_name="Okafor",
                date_of_birth=date(1966, 9, 3),
                age=58,
                gender="Male",
                blood_group="O-",
                phone="+1 555 345 6789",
                email="james.okafor@example.com",
                address="89 Oak Avenue, Dallas TX 75201",
                emergency_contact="+1 555 345 6790",
            )
            db.add_all([sarah, james])
            db.flush()

            visit = Visit(
                patient_id=james.id,
                doctor_id=doctor.id,
                visit_date=datetime.now(timezone.utc),
                visit_type="Emergency",
                reason="Chest tightness and shortness of breath",
                notes="High-priority cardiology assessment required.",
                status=VisitStatus.in_progress,
            )
            db.add(visit)
            db.flush()

            db.add_all(
                [
                    MedicalHistory(
                        patient_id=sarah.id,
                        condition_name="Migraine",
                        diagnosis="Recurring migraine headaches",
                        description="Patient reports migraine episodes with visual aura.",
                        diagnosed_date=date(2022, 6, 10),
                    ),
                    Vital(
                        patient_id=james.id,
                        visit_id=visit.id,
                        height=178,
                        weight=86,
                        temperature=98.7,
                        blood_pressure="148/92",
                        heart_rate=102,
                        oxygen_level=94,
                    ),
                    Prescription(
                        patient_id=sarah.id,
                        doctor_id=doctor.id,
                        medicine_name="Sumatriptan",
                        dosage="50mg",
                        frequency="As needed",
                        duration="30 days",
                        instructions="Take at onset of migraine symptoms.",
                    ),
                    AITriage(
                        patient_id=james.id,
                        symptoms="Chest tightness, shortness of breath, left arm pain",
                        severity_level=SeverityLevel.critical,
                        risk_score=94,
                        ai_prediction="Possible acute coronary syndrome",
                        recommendation="Immediate emergency and cardiology evaluation.",
                        confidence_score=94,
                    ),
                    Notification(
                        user_id=staff.id,
                        title="Urgent patient flagged",
                        message="James Okafor was flagged as critical by AI triage.",
                        notification_type="urgent_case",
                    ),
                ]
            )

        db.commit()
        print("Seed data inserted successfully.")
        print("Admin login: admin@test.com / password123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
