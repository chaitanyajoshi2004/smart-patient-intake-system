from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AITriageBase(BaseModel):
    patient_id: int
    symptoms: str = Field(..., min_length=1)
    severity_level: SeverityLevel
    risk_score: float | None = Field(default=None, ge=0, le=100)
    ai_prediction: str | None = None
    recommendation: str | None = None
    confidence_score: float | None = Field(default=None, ge=0, le=100)


class AITriageCreate(AITriageBase):
    pass


class AITriageUpdate(BaseModel):
    symptoms: str | None = Field(default=None, min_length=1)
    severity_level: SeverityLevel | None = None
    risk_score: float | None = Field(default=None, ge=0, le=100)
    ai_prediction: str | None = None
    recommendation: str | None = None
    confidence_score: float | None = Field(default=None, ge=0, le=100)


class AITriageRead(AITriageBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
