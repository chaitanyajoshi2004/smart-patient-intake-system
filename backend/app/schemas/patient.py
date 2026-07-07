from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.medical_history import MedicalHistoryRead
from app.schemas.medical_report import MedicalReportRead
from app.schemas.prescription import PrescriptionRead
from app.schemas.visit import VisitRead
from app.schemas.vital import VitalRead


class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    date_of_birth: date
    age: int | None = Field(default=None, ge=0, le=130)
    gender: str = Field(..., min_length=1, max_length=30)
    blood_group: str | None = Field(default=None, max_length=10)
    phone: str = Field(..., min_length=7, max_length=40)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=500)
    emergency_contact: str | None = Field(default=None, max_length=120)
    profile_image: str | None = Field(default=None, max_length=500)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    date_of_birth: date | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: str | None = Field(default=None, min_length=1, max_length=30)
    blood_group: str | None = Field(default=None, max_length=10)
    phone: str | None = Field(default=None, min_length=7, max_length=40)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=500)
    emergency_contact: str | None = Field(default=None, max_length=120)
    profile_image: str | None = Field(default=None, max_length=500)


class PatientRead(PatientBase):
    id: int
    patient_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatientDetails(PatientRead):
    medical_history: list[MedicalHistoryRead] = []
    visits: list[VisitRead] = []
    prescriptions: list[PrescriptionRead] = []
    vitals: list[VitalRead] = []
    reports: list[MedicalReportRead] = []


class PatientListResponse(BaseModel):
    data: list[PatientRead]
    total: int
    page: int
    limit: int
