from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    admin = "admin"
    doctor = "doctor"
    nurse = "nurse"
    staff = "staff"


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.staff
    phone: str | None = Field(default=None, max_length=40)
    profile_image: str | None = Field(default=None, max_length=500)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    phone: str | None
    profile_image: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuthUser(BaseModel):
    id: int
    full_name: str
    role: UserRole

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser | None = None
