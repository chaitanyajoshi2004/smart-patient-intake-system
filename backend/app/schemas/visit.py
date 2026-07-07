from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class VisitStatus(str, Enum):
    scheduled = "scheduled"
    checked_in = "checked_in"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class VisitBase(BaseModel):
    patient_id: int
    doctor_id: int | None = None
    visit_date: datetime
    visit_type: str = Field(..., min_length=1, max_length=80)
    reason: str | None = Field(default=None, max_length=255)
    notes: str | None = None
    status: VisitStatus = VisitStatus.scheduled


class VisitCreate(VisitBase):
    pass


class VisitUpdate(BaseModel):
    doctor_id: int | None = None
    visit_date: datetime | None = None
    visit_type: str | None = Field(default=None, min_length=1, max_length=80)
    reason: str | None = Field(default=None, max_length=255)
    notes: str | None = None
    status: VisitStatus | None = None


class VisitRead(VisitBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
