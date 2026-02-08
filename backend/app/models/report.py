"""
Report Model for MongoDB

Stores uploaded medical reports and their analysis results.
"""

from typing import Optional, List, Dict, Any, Literal
from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    """Types of medical documents."""
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    IMAGING = "imaging"
    DISCHARGE_SUMMARY = "discharge_summary"
    CONSULTATION = "consultation"
    OTHER = "other"
    UNKNOWN = "unknown"


class ReportStatus(str, Enum):
    """Processing status of a report."""
    UPLOADED = "uploaded"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    FAILED = "failed"


class MetricStatus(str, Enum):
    """Status of a metric value relative to reference range."""
    NORMAL = "normal"
    LOW = "low"
    HIGH = "high"
    CRITICAL = "critical"


class Metric(BaseModel):
    """Individual metric extracted from a report."""
    name: str
    value: float
    unit: str
    status: MetricStatus = MetricStatus.NORMAL
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    reference_range: Optional[str] = None  # Original text like "13.5-17.5"
    category: str = "general"  # lipid, cbc, thyroid, liver, kidney, diabetes
    explanation: Optional[str] = None  # Brief explanation if abnormal


class ReportMetadata(BaseModel):
    """Metadata extracted from the document."""
    date: Optional[str] = None
    lab_name: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    test_type: Optional[str] = None
    patient_name_in_doc: Optional[str] = None


class Report(Document):
    """Medical report document stored in MongoDB."""
    
    # User association
    user_id: Indexed(str)
    
    # File information
    file_name: str
    file_type: str  # pdf, jpg, png
    file_size_bytes: int
    
    # Document analysis results
    is_valid_medical_doc: Optional[bool] = None
    document_type: DocumentType = DocumentType.UNKNOWN
    confidence: Optional[float] = None
    
    # Extracted content
    extracted_text: Optional[str] = None
    metadata: ReportMetadata = Field(default_factory=ReportMetadata)
    
    # Processing status
    status: ReportStatus = ReportStatus.UPLOADED
    rejection_reason: Optional[str] = None
    
    # Structured metrics extracted from report
    metrics: List[Metric] = Field(default_factory=list)
    flagged_count: int = 0  # Count of abnormal metrics
    normal_count: int = 0   # Count of normal metrics
    
    # Summaries (for agent and user consumption)
    screener_summary: Optional[Dict[str, Any]] = None  # From Initial Screener
    analysis_summary: Optional[Dict[str, Any]] = None  # From In-Depth Analyzer
    user_summary: Optional[str] = None  # Human-readable from Summary Creator
    headline: Optional[str] = None  # Short headline like "2 areas need attention"
    action_items: List[str] = Field(default_factory=list)  # Suggested actions
    
    # Keywords for text search (for RAG without vector DB)
    search_keywords: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    
    class Settings:
        name = "reports"
        
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "file_name": "blood_test_report.pdf",
                "file_type": "pdf",
                "file_size_bytes": 245000,
                "is_valid_medical_doc": True,
                "document_type": "lab_report",
                "confidence": 0.95,
                "status": "analyzed"
            }
        }


class ReportCreate(BaseModel):
    """Schema for creating a new report."""
    file_name: str
    file_type: str
    file_size_bytes: int


class ReportOut(BaseModel):
    """Schema for report response."""
    id: str
    file_name: str
    file_type: str
    document_type: DocumentType
    status: ReportStatus
    is_valid_medical_doc: Optional[bool]
    user_summary: Optional[str]
    headline: Optional[str]
    flagged_count: int = 0
    normal_count: int = 0
    created_at: datetime
    analyzed_at: Optional[datetime]
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def from_report(cls, report: Report) -> "ReportOut":
        return cls(
            id=str(report.id),
            file_name=report.file_name,
            file_type=report.file_type,
            document_type=report.document_type,
            status=report.status,
            is_valid_medical_doc=report.is_valid_medical_doc,
            user_summary=report.user_summary,
            headline=report.headline,
            flagged_count=report.flagged_count,
            normal_count=report.normal_count,
            created_at=report.created_at,
            analyzed_at=report.analyzed_at
        )


class ReportDetailOut(BaseModel):
    """Detailed report response with metrics."""
    id: str
    file_name: str
    file_type: str
    document_type: DocumentType
    status: ReportStatus
    is_valid_medical_doc: Optional[bool]
    metrics: List[Metric] = []
    flagged_count: int = 0
    normal_count: int = 0
    headline: Optional[str]
    user_summary: Optional[str]
    action_items: List[str] = []
    metadata: Optional[ReportMetadata]
    created_at: datetime
    analyzed_at: Optional[datetime]
    
    model_config = {"from_attributes": True}
    
    @classmethod
    def from_report(cls, report: Report) -> "ReportDetailOut":
        return cls(
            id=str(report.id),
            file_name=report.file_name,
            file_type=report.file_type,
            document_type=report.document_type,
            status=report.status,
            is_valid_medical_doc=report.is_valid_medical_doc,
            metrics=report.metrics,
            flagged_count=report.flagged_count,
            normal_count=report.normal_count,
            headline=report.headline,
            user_summary=report.user_summary,
            action_items=report.action_items,
            metadata=report.metadata,
            created_at=report.created_at,
            analyzed_at=report.analyzed_at
        )


class ComparisonMetric(BaseModel):
    """Metric comparison between two reports."""
    name: str
    category: str
    unit: str
    report1_value: Optional[float]
    report1_status: Optional[MetricStatus]
    report2_value: Optional[float]
    report2_status: Optional[MetricStatus]
    change: Optional[float]  # Difference (report2 - report1)
    change_percent: Optional[float]
    trend: Optional[str]  # "improved", "worsened", "stable", "new"


class ComparisonOut(BaseModel):
    """Response for comparing two reports."""
    report1_id: str
    report1_date: datetime
    report1_name: str
    report2_id: str
    report2_date: datetime
    report2_name: str
    metrics: List[ComparisonMetric]
    summary: str  # "3 metrics improved, 1 worsened"
