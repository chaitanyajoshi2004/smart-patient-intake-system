from datetime import date, datetime

from pydantic import BaseModel, Field


class MedicalHistoryBase(BaseModel):
    patient_id: int
    condition_name: str = Field(..., min_length=1, max_length=160)
    diagnosis: str | None = Field(default=None, max_length=255)
    description: str | None = None
    diagnosed_date: date | None = None


class MedicalHistoryCreate(MedicalHistoryBase):
    pass


class PatientMedicalHistoryCreate(BaseModel):
    condition_name: str = Field(..., min_length=1, max_length=160)
    diagnosis: str | None = Field(default=None, max_length=255)
    description: str | None = None
    diagnosed_date: date | None = None


class MedicalHistoryUpdate(BaseModel):
    condition_name: str | None = Field(default=None, min_length=1, max_length=160)
    diagnosis: str | None = Field(default=None, max_length=255)
    description: str | None = None
    diagnosed_date: date | None = None


class MedicalHistoryRead(MedicalHistoryBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
