"""
Doctor Router - Doctor Portal Endpoints

Handles report access for doctors who have shared reports from patients.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.models.user import User, UserRole
from app.models.report import Report, ReportDetailOut
from app.models.share import ReportShare
from app.models.assignment import Assignment
from app.core.security import get_current_user

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class AssignedPatientSummary(BaseModel):
    patient_id: str
    patient_name: str
    patient_email: str
    assigned_at: str
    report_count: int = 0


class DoctorReportSummary(BaseModel):
    patient_name: str
    patient_id: str
    report_id: str
    report_type: str
    summary: str | None = None
    flagged_count: int = 0
    highest_severity: str = "NORMAL"
    is_reviewed: bool = False
    date_shared: str


@router.get("/patients", response_model=List[AssignedPatientSummary])
async def get_assigned_patients(
    current_user: User = Depends(get_current_user)
):
    """Get all patients assigned to the authenticated doctor."""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    assignments = await Assignment.find(
        Assignment.doctor_id == str(current_user.id)
    ).to_list()
    
    results = []
    for a in assignments:
        try:
            patient = await User.get(PydanticObjectId(a.patient_id))
            if not patient:
                continue
            
            # Count reports for this patient
            report_count = await Report.find(
                Report.user_id == str(patient.id)
            ).count()
            
            results.append(AssignedPatientSummary(
                patient_id=str(patient.id),
                patient_name=patient.full_name or patient.email,
                patient_email=patient.email,
                assigned_at=a.assigned_at.isoformat(),
                report_count=report_count
            ))
        except Exception as e:
            logger.warning(f"Error loading assigned patient {a.patient_id}: {e}")
    
    return results


@router.get("/reports", response_model=List[DoctorReportSummary])
async def get_shared_reports(
    current_user: User = Depends(get_current_user)
):
    """Get all reports shared with the authenticated doctor."""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    # Find all shares for this doctor
    shares = await ReportShare.find(
        ReportShare.doctor_id == str(current_user.id)
    ).to_list()
    
    if not shares:
        return []
    
    results = []
    for share in shares:
        try:
            report = await Report.get(PydanticObjectId(share.report_id))
            if not report:
                continue
            
            # Get patient name
            patient = await User.get(PydanticObjectId(share.patient_id))
            patient_name = patient.full_name or patient.email if patient else "Unknown"
            
            # Calculate flagged markers
            abnormal_markers = [m for m in report.markers if m.status != "normal"]
            flagged_count = len(abnormal_markers)
            
            # Determine highest severity
            severity_order = {"normal": 0, "low": 1, "high": 2}
            highest_severity = "NORMAL"
            if abnormal_markers:
                max_severity = max(abnormal_markers, key=lambda m: severity_order.get(m.status, 0))
                highest_severity = max_severity.status.upper()
            
            # Check if reviewed
            is_reviewed = report.reviewed_at is not None
            
            results.append(DoctorReportSummary(
                patient_name=patient_name,
                patient_id=str(share.patient_id),
                report_id=str(report.id),
                report_type=report.report_type,
                summary=report.summary,
                flagged_count=flagged_count,
                highest_severity=highest_severity,
                is_reviewed=is_reviewed,
                date_shared=share.shared_at.isoformat() if share.shared_at else report.upload_date.isoformat()
            ))
        except Exception as e:
            logger.warning(f"Error loading shared report {share.report_id}: {e}")
    
    return results


@router.get("/report/{report_id}", response_model=ReportDetailOut)
async def get_shared_report_detail(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Allow doctor to view full report details shared with them."""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    # Verify share exists
    share = await ReportShare.find_one(
        ReportShare.report_id == report_id,
        ReportShare.doctor_id == str(current_user.id)
    )
    
    if not share:
        raise HTTPException(status_code=403, detail="Report not shared with you")
    
    try:
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return ReportDetailOut.from_report(report)
    
@router.patch("/reports/{report_id}/review", response_model=ReportDetailOut)
async def review_shared_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Allow doctor to mark a patient's report as reviewed."""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    share = await ReportShare.find_one(
        ReportShare.report_id == report_id,
        ReportShare.doctor_id == str(current_user.id)
    )
    
    if not share:
        raise HTTPException(status_code=403, detail="Report not shared with you")
    
    try:
        from datetime import datetime
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.reviewed_at = datetime.utcnow()
    report.reviewed_by = str(current_user.id)
    await report.save()
    
    return ReportDetailOut.from_report(report)
