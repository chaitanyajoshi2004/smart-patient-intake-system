from datetime import datetime

from pydantic import BaseModel, Field


class VitalBase(BaseModel):
    patient_id: int
    visit_id: int | None = None
    height: float | None = Field(default=None, gt=0)
    weight: float | None = Field(default=None, gt=0)
    bmi: float | None = Field(default=None, gt=0)
    temperature: float | None = None
    blood_pressure: str | None = Field(default=None, max_length=30)
    heart_rate: int | None = Field(default=None, ge=0)
    oxygen_level: float | None = Field(default=None, ge=0, le=100)


class VitalCreate(VitalBase):
    pass


class VitalUpdate(BaseModel):
    visit_id: int | None = None
    height: float | None = Field(default=None, gt=0)
    weight: float | None = Field(default=None, gt=0)
    bmi: float | None = Field(default=None, gt=0)
    temperature: float | None = None
    blood_pressure: str | None = Field(default=None, max_length=30)
    heart_rate: int | None = Field(default=None, ge=0)
    oxygen_level: float | None = Field(default=None, ge=0, le=100)


class VitalRead(VitalBase):
    id: int
    recorded_at: datetime

    model_config = {"from_attributes": True}
