from typing import Optional, Annotated, List
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserRole(str, Enum):
    """User roles for role-based access control."""
    HOSPITAL = "hospital"
    PATIENT = "patient"


class User(Document):
    """User document stored in MongoDB."""
    email: Annotated[EmailStr, Indexed(unique=True)]
    hashed_password: str
    role: UserRole = UserRole.PATIENT
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Patient-specific fields
    dob: Optional[datetime] = None
    sex: Optional[str] = None

    class Settings:
        name = "users"


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    role: UserRole = UserRole.PATIENT
    full_name: Optional[str] = None
    dob: Optional[datetime] = None
    sex: Optional[str] = None


class UserOut(BaseModel):
    """Schema for user response (no password)."""
    id: str
    email: EmailStr
    role: UserRole
    full_name: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user: User) -> "UserOut":
        return cls(
            id=str(user.id),
            email=user.email,
            role=user.role,
            full_name=user.full_name,
            is_active=user.is_active
        )


class Token(BaseModel):
    """Schema for login response with token and user info."""
    access_token: str
    token_type: str
    user: UserOut
