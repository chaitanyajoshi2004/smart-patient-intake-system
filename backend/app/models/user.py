from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, Enum):
    admin = "admin"
    doctor = "doctor"
    nurse = "nurse"
    staff = "staff"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role"),
        default=UserRole.staff,
        nullable=False,
    )
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
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

    visits: Mapped[list["Visit"]] = relationship(
        "Visit",
        back_populates="doctor",
        foreign_keys="Visit.doctor_id",
    )
    prescriptions: Mapped[list["Prescription"]] = relationship(
        "Prescription",
        back_populates="doctor",
        foreign_keys="Prescription.doctor_id",
    )
    uploaded_reports: Mapped[list["MedicalReport"]] = relationship(
        "MedicalReport",
        back_populates="uploader",
        foreign_keys="MedicalReport.uploaded_by",
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")
