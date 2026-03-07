"""
Report Model for MongoDB

Stores uploaded medical reports and their AI analysis results.
Aligned with the MedScan API spec and agents spec.
"""

from typing import Optional, List
from beanie import Document, Indexed
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class ReportStatus(str, Enum):
    """Processing status of a report."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    FAILED = "failed"


class MarkerStatus(str, Enum):
    """Status of a marker value relative to reference range."""
    NORMAL = "normal"
    LOW = "low"
    HIGH = "high"


class Marker(BaseModel):
    """Individual biomarker extracted from a report."""
    name: str
    value: float
    unit: str = ""
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    status: MarkerStatus = MarkerStatus.NORMAL


class Report(Document):
    """Medical report document stored in MongoDB."""

    # User association
    user_id: Indexed(str)

    # File information
    file_name: str
    file_url: Optional[str] = None  # Path to stored file

    # Report classification
    report_type: str = "unknown"  # CBC, Lipid Profile, LFT, KFT, Thyroid, Urine Analysis, General

    # Processing status
    status: ReportStatus = ReportStatus.UPLOADED

    # Extracted content
    extracted_text: Optional[str] = None

    # AI analysis results
    markers: List[Marker] = Field(default_factory=list)
    insights: List[str] = Field(default_factory=list)
    detailed_analysis: Optional[str] = None
    summary: Optional[str] = None

    # Timestamps
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None

    class Settings:
        name = "reports"


class ReportOut(BaseModel):
    """Schema for report list response."""
    report_id: str
    report_type: str
    upload_date: datetime
    summary: Optional[str] = None
    status: ReportStatus

    model_config = {"from_attributes": True}

    @classmethod
    def from_report(cls, report: Report) -> "ReportOut":
        return cls(
            report_id=str(report.id),
            report_type=report.report_type,
            upload_date=report.upload_date,
            summary=report.summary,
            status=report.status
        )


class MarkerOut(BaseModel):
    """Marker in API response."""
    name: str
    value: float
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    status: str


class ReportDetailOut(BaseModel):
    """Full report detail response."""
    report_id: str
    report_type: str
    summary: Optional[str] = None
    detailed_analysis: Optional[str] = None
    markers: List[MarkerOut] = []
    insights: List[str] = []
    status: ReportStatus
    upload_date: datetime
    analyzed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_report(cls, report: Report) -> "ReportDetailOut":
        markers_out = [
            MarkerOut(
                name=m.name,
                value=m.value,
                reference_min=m.reference_min,
                reference_max=m.reference_max,
                status=m.status.value
            )
            for m in report.markers
        ]
        return cls(
            report_id=str(report.id),
            report_type=report.report_type,
            summary=report.summary,
            detailed_analysis=report.detailed_analysis,
            markers=markers_out,
            insights=report.insights,
            status=report.status,
            upload_date=report.upload_date,
            analyzed_at=report.analyzed_at
        )
