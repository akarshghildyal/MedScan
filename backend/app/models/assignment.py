"""
Doctor-Patient Assignment Model for MongoDB

Stores doctor-patient assignment records created by hospital admins.
"""

from beanie import Document, Indexed
from pydantic import BaseModel, Field
from datetime import datetime


class Assignment(Document):
    """Doctor-Patient assignment record stored in MongoDB."""
    patient_id: Indexed(str)
    doctor_id: Indexed(str)
    hospital_id: str
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "assignments"
