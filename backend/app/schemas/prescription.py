from datetime import datetime

from pydantic import BaseModel, Field


class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int | None = None
    visit_id: int | None = None
    medicine_name: str = Field(..., min_length=1, max_length=160)
    dosage: str | None = Field(default=None, max_length=80)
    frequency: str | None = Field(default=None, max_length=80)
    duration: str | None = Field(default=None, max_length=80)
    instructions: str | None = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionUpdate(BaseModel):
    doctor_id: int | None = None
    visit_id: int | None = None
    medicine_name: str | None = Field(default=None, min_length=1, max_length=160)
    dosage: str | None = Field(default=None, max_length=80)
    frequency: str | None = Field(default=None, max_length=80)
    duration: str | None = Field(default=None, max_length=80)
    instructions: str | None = None


class PrescriptionRead(PrescriptionBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
