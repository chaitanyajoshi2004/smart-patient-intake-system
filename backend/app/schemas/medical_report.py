from datetime import datetime

from pydantic import BaseModel, Field


class MedicalReportBase(BaseModel):
    patient_id: int
    uploaded_by: int | None = None
    report_name: str = Field(..., min_length=1, max_length=160)
    report_type: str = Field(..., min_length=1, max_length=80)
    file_path: str = Field(..., min_length=1, max_length=500)


class MedicalReportCreate(MedicalReportBase):
    pass


class MedicalReportUpdate(BaseModel):
    uploaded_by: int | None = None
    report_name: str | None = Field(default=None, min_length=1, max_length=160)
    report_type: str | None = Field(default=None, min_length=1, max_length=80)
    file_path: str | None = Field(default=None, min_length=1, max_length=500)


class MedicalReportRead(MedicalReportBase):
    id: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}
