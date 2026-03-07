"""
Sharing Router - Report Sharing Between Patients and Doctors

Handles sharing and unsharing reports with doctors.
"""

from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.user import User, UserRole
from app.models.report import Report
from app.models.share import ReportShare, ShareRequest, ShareResponse
from app.core.security import get_current_user

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/share", response_model=ShareResponse)
async def share_report(
    request: ShareRequest,
    current_user: User = Depends(get_current_user)
):
    """Share a report with a doctor."""
    # Verify report belongs to current user
    try:
        report = await Report.get(PydanticObjectId(request.report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report or report.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Verify doctor exists
    try:
        doctor = await User.get(PydanticObjectId(request.doctor_id))
    except:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    if not doctor or doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    
    # Check if already shared
    existing = await ReportShare.find_one(
        ReportShare.report_id == request.report_id,
        ReportShare.doctor_id == request.doctor_id
    )
    if existing:
        return ShareResponse(message="Report already shared with this doctor")
    
    # Create share record
    share = ReportShare(
        report_id=request.report_id,
        patient_id=str(current_user.id),
        doctor_id=request.doctor_id
    )
    await share.create()
    
    return ShareResponse(message="Report shared successfully")


@router.delete("/share", response_model=ShareResponse)
async def unshare_report(
    request: ShareRequest,
    current_user: User = Depends(get_current_user)
):
    """Remove doctor's access to a report."""
    # Verify report belongs to current user
    try:
        report = await Report.get(PydanticObjectId(request.report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report or report.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Find and delete share
    share = await ReportShare.find_one(
        ReportShare.report_id == request.report_id,
        ReportShare.doctor_id == request.doctor_id
    )
    
    if not share:
        raise HTTPException(status_code=404, detail="Share record not found")
    
    await share.delete()
    
    return ShareResponse(message="Doctor access removed")
