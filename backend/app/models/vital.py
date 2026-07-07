from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, event, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vital(Base):
    __tablename__ = "vitals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), index=True)
    visit_id: Mapped[int | None] = mapped_column(ForeignKey("visits.id", ondelete="SET NULL"), index=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    bmi: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    blood_pressure: Mapped[str | None] = mapped_column(String(30), nullable=True)
    heart_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    oxygen_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="vitals")
    visit: Mapped["Visit"] = relationship("Visit", back_populates="vitals")

    def calculate_bmi(self) -> None:
        if self.height and self.weight and self.height > 0:
            height_m = self.height / 100
            self.bmi = round(self.weight / (height_m * height_m), 2)


@event.listens_for(Vital, "before_insert")
@event.listens_for(Vital, "before_update")
def calculate_bmi_before_save(_: object, __: object, target: Vital) -> None:
    target.calculate_bmi()
