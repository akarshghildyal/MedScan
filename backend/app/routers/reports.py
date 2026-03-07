"""
Reports Router - File Upload and Report Retrieval

Handles:
- PDF upload with background agent pipeline processing
- Report listing and detail retrieval
"""

import uuid
from typing import List
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from beanie import PydanticObjectId

from app.models.user import User
from app.models.report import (
    Report, ReportOut, ReportDetailOut, ReportStatus,
    Marker, MarkerStatus
)
from app.core.security import get_current_user
from app.services.agents.pipeline import agent_pipeline

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload", response_model=ReportOut)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a pathology report PDF and start the AI processing pipeline.
    
    Only PDF files are accepted. Processing runs asynchronously.
    """
    # Validate PDF
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Read file content
    content = await file.read()
    
    # Validate size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}.pdf"
    file_path = UPLOAD_DIR / stored_filename
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create report record
    report = Report(
        user_id=str(current_user.id),
        file_name=file.filename,
        file_url=str(file_path),
        status=ReportStatus.PROCESSING
    )
    await report.create()
    
    # Trigger pipeline in background
    background_tasks.add_task(
        run_pipeline,
        report_id=str(report.id),
        file_path=str(file_path)
    )
    
    return ReportOut.from_report(report)


async def run_pipeline(report_id: str, file_path: str):
    """
    Background task: run the 7-agent pipeline on an uploaded PDF.
    """
    try:
        report = await Report.get(PydanticObjectId(report_id))
        if not report:
            return
        
        logger.info(f"Starting pipeline for report {report_id}")
        
        # Run the full pipeline
        result = await agent_pipeline.run(file_path=file_path)
        
        if not result["success"]:
            report.status = ReportStatus.FAILED
            await report.save()
            logger.error(f"Pipeline failed for {report_id}: {result.get('error')}")
            return
        
        # Update report with results
        report.report_type = result.get("report_type", "unknown")
        report.extracted_text = result.get("extracted_text", "")
        report.summary = result.get("summary", "")
        report.detailed_analysis = result.get("detailed_analysis", "")
        report.insights = result.get("insights", [])
        
        # Convert markers to Marker model instances
        markers = []
        for m in result.get("markers", []):
            try:
                status_str = m.get("status", "normal").lower()
                status = MarkerStatus(status_str) if status_str in ("normal", "high", "low") else MarkerStatus.NORMAL
                markers.append(Marker(
                    name=m.get("name", "Unknown"),
                    value=float(m.get("value", 0)),
                    unit=m.get("unit", ""),
                    reference_min=m.get("reference_min"),
                    reference_max=m.get("reference_max"),
                    status=status
                ))
            except (ValueError, TypeError) as e:
                logger.warning(f"Skipping invalid marker: {m} - {e}")
        
        report.markers = markers
        report.status = ReportStatus.ANALYZED
        report.analyzed_at = datetime.utcnow()
        await report.save()
        
        logger.info(f"Pipeline complete for {report_id}: {len(markers)} markers")
        
    except Exception as e:
        logger.error(f"Pipeline error for {report_id}: {e}")
        try:
            report = await Report.get(PydanticObjectId(report_id))
            if report:
                report.status = ReportStatus.FAILED
                await report.save()
        except:
            pass


@router.get("/", response_model=List[ReportOut])
async def list_reports(current_user: User = Depends(get_current_user)):
    """Get all reports for the current user."""
    reports = await Report.find(
        Report.user_id == str(current_user.id)
    ).sort(-Report.upload_date).to_list()
    return [ReportOut.from_report(r) for r in reports]


@router.get("/{report_id}", response_model=ReportDetailOut)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get full analysis of a specific report."""
    try:
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    
    return ReportDetailOut.from_report(report)

@router.post("/{report_id}/retry", response_model=ReportOut)
async def retry_report_pipeline(
    report_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Retry the AI pipeline processing for a failed report."""
    try:
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to retry this report")
        
    if report.status != ReportStatus.FAILED:
        raise HTTPException(status_code=400, detail="Only failed reports can be retried")
        
    if not report.file_url:
        raise HTTPException(status_code=400, detail="Report PDF file is missing")
        
    # Reset status
    report.status = ReportStatus.PROCESSING
    await report.save()
    
    # Trigger pipeline
    background_tasks.add_task(
        run_pipeline,
        report_id=str(report.id),
        file_path=report.file_url
    )
    
    return ReportOut.from_report(report)
