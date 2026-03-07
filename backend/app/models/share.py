"""
Report Sharing Model for MongoDB

Stores report sharing records between patients and doctors.
"""

from beanie import Document, Indexed
from pydantic import BaseModel, Field
from datetime import datetime


class ReportShare(Document):
    """Report share record stored in MongoDB."""
    report_id: Indexed(str)
    patient_id: Indexed(str)
    doctor_id: Indexed(str)
    shared_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "report_shares"


class ShareRequest(BaseModel):
    """Schema for sharing a report with a doctor."""
    report_id: str
    doctor_id: str


class ShareResponse(BaseModel):
    """Schema for share operation response."""
    message: str
