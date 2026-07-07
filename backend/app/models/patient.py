from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
        server_default=text("'PT-' || lpad(nextval('patient_code_seq')::text, 6, '0')"),
    )
    first_name: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str] = mapped_column(String(30), nullable=False)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    phone: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(120), nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    medical_history: Mapped[list["MedicalHistory"]] = relationship(
        "MedicalHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    visits: Mapped[list["Visit"]] = relationship(
        "Visit",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    vitals: Mapped[list["Vital"]] = relationship(
        "Vital",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    prescriptions: Mapped[list["Prescription"]] = relationship(
        "Prescription",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    triage_records: Mapped[list["AITriage"]] = relationship(
        "AITriage",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    reports: Mapped[list["MedicalReport"]] = relationship(
        "MedicalReport",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
