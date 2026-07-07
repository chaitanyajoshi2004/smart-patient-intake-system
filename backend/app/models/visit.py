from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class VisitStatus(str, Enum):
    scheduled = "scheduled"
    checked_in = "checked_in"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    visit_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    visit_type: Mapped[str] = mapped_column(String(80), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[VisitStatus] = mapped_column(
        SQLEnum(VisitStatus, name="visit_status"),
        default=VisitStatus.scheduled,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="visits")
    doctor: Mapped["User"] = relationship("User", back_populates="visits", foreign_keys=[doctor_id])
    vitals: Mapped[list["Vital"]] = relationship("Vital", back_populates="visit")
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="visit")
