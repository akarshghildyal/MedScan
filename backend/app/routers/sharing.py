"""
Sharing Router - Report Sharing Between Patients and Doctors

Handles sharing and unsharing reports with doctors.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from beanie import PydanticObjectId
from pydantic import BaseModel

from app.models.user import User, UserRole
from app.models.report import Report
from app.models.share import ReportShare, ShareResponse, ShareRequest
from app.core.security import get_current_user

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ShareByEmailRequest(BaseModel):
    report_id: str
    doctor_email: str


class DoctorLookupResponse(BaseModel):
    doctor_id: str
    doctor_name: str
    doctor_email: str
    valid: bool = True


@router.get("/doctor-lookup", response_model=DoctorLookupResponse)
async def lookup_doctor(
    email: str = Query(..., description="Doctor's email address"),
    current_user: User = Depends(get_current_user)
):
    """Look up a doctor by email and return their name and ID."""
    doctor = await User.find_one(User.email == email)
    
    if not doctor:
        raise HTTPException(status_code=404, detail="No user found with this email")
    
    if doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="This user is not a doctor")
    
    return DoctorLookupResponse(
        doctor_id=str(doctor.id),
        doctor_name=doctor.full_name or doctor.email,
        doctor_email=doctor.email
    )


@router.post("/share", response_model=ShareResponse)
async def share_report(
    request: ShareByEmailRequest,
    current_user: User = Depends(get_current_user)
):
    """Share a report with a doctor by email."""
    # Verify report belongs to current user
    try:
        report = await Report.get(PydanticObjectId(request.report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report or report.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Find doctor by email
    doctor = await User.find_one(User.email == request.doctor_email)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found with this email")
    
    if doctor.role != UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="This user is not a doctor")
    
    doctor_id = str(doctor.id)
    
    # Check if already shared
    existing = await ReportShare.find_one(
        ReportShare.report_id == request.report_id,
        ReportShare.doctor_id == doctor_id
    )
    if existing:
        return ShareResponse(message="Report already shared with this doctor")
    
    # Create share record
    share = ReportShare(
        report_id=request.report_id,
        patient_id=str(current_user.id),
        doctor_id=doctor_id
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
