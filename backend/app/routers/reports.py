"""
Reports Router - File Upload and Analysis Endpoints

Handles:
- File upload and storage
- Document analysis triggering
- Report retrieval
- Report comparison
"""

import os
import uuid
import shutil
from typing import List, Optional
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import JSONResponse

from app.models.user import User
from app.models.report import (
    Report, ReportOut, ReportDetailOut, ReportStatus, DocumentType, 
    ReportMetadata, Metric, MetricStatus, ComparisonOut, ComparisonMetric
)
from app.core.security import get_current_user
from app.core.config import settings
from app.services.agents.document_analyzer import document_analyzer
from app.services.agents.initial_screener import initial_screener
from app.services.agents.in_depth_analyzer import in_depth_analyzer
from app.services.agents.summary_creator import summary_creator
from app.services.agents.comparison_creator import comparison_creator

router = APIRouter()

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@router.post("/upload", response_model=ReportOut)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a medical report for analysis.
    
    The file is saved and document analysis is triggered in the background.
    """
    # Validate file extension
    extension = get_file_extension(file.filename)
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}.{extension}"
    file_path = UPLOAD_DIR / stored_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create report record
    report = Report(
        user_id=str(current_user.id),
        file_name=file.filename,
        file_type=extension,
        file_size_bytes=len(content),
        status=ReportStatus.UPLOADED
    )
    await report.create()
    
    # Trigger document analysis in background
    background_tasks.add_task(
        analyze_document,
        report_id=str(report.id),
        file_path=str(file_path),
        file_type=extension
    )
    
    return ReportOut.from_report(report)


async def analyze_document(report_id: str, file_path: str, file_type: str):
    """
    Background task to analyze uploaded document.
    
    Runs full agent pipeline:
    1. Document Analyzer - Extract text, validate document
    2. Initial Screener - Extract metrics, flag abnormals
    3. In-Depth Analyzer - Analyze correlations, provide explanations
    4. Summary Creator - Generate user-readable summary
    """
    from beanie import PydanticObjectId
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        # Get report
        report = await Report.get(PydanticObjectId(report_id))
        if not report:
            return
        
        # Update status
        report.status = ReportStatus.ANALYZING
        await report.save()
        
        # STEP 1: Document Analyzer
        logger.info(f"Step 1: Analyzing document {report_id}")
        doc_result = await document_analyzer.process({
            "file_path": file_path,
            "file_type": file_type,
            "file_name": report.file_name
        })
        
        if not doc_result["success"]:
            report.status = ReportStatus.FAILED
            report.rejection_reason = doc_result.get("error", "Document analysis failed")
            await report.save()
            return
        
        doc_data = doc_result["data"]
        
        # Update report with document analysis results
        report.is_valid_medical_doc = doc_data.get("is_valid", False)
        report.document_type = DocumentType(doc_data.get("document_type", "unknown"))
        report.confidence = doc_data.get("confidence", 0.0)
        report.extracted_text = doc_data.get("extracted_text", "")
        
        # Parse metadata
        metadata = doc_data.get("metadata", {})
        report.metadata = ReportMetadata(
            date=metadata.get("date"),
            lab_name=metadata.get("lab_name"),
            hospital_name=metadata.get("hospital_name"),
            doctor_name=metadata.get("doctor_name"),
            test_type=metadata.get("test_type"),
            patient_name_in_doc=metadata.get("patient_name_in_doc")
        )
        
        report.rejection_reason = doc_data.get("rejection_reason")
        
        # If not valid, stop here
        if not doc_data.get("is_valid", False):
            report.status = ReportStatus.FAILED
            await report.save()
            return
        
        # STEP 2: Initial Screener
        logger.info(f"Step 2: Screening metrics for {report_id}")
        screener_result = await initial_screener.process({
            "extracted_text": report.extracted_text,
            "document_type": report.document_type.value,
            "report_id": report_id
        })
        
        if screener_result["success"]:
            screener_data = screener_result["data"]
            report.screener_summary = screener_data
            
            # Convert metrics to structured format
            metrics_list = screener_data.get("metrics", [])
            structured_metrics = []
            
            for m in metrics_list:
                status_str = m.get("status", "normal").lower()
                try:
                    status = MetricStatus(status_str)
                except ValueError:
                    status = MetricStatus.NORMAL
                
                structured_metrics.append(Metric(
                    name=m.get("name", "Unknown"),
                    value=float(m.get("value", 0)),
                    unit=m.get("unit", ""),
                    status=status,
                    reference_range=m.get("reference_range"),
                    category=m.get("category", "general")
                ))
            
            report.metrics = structured_metrics
            report.flagged_count = len([m for m in structured_metrics if m.status != MetricStatus.NORMAL])
            report.normal_count = len([m for m in structured_metrics if m.status == MetricStatus.NORMAL])
        
        # STEP 3: In-Depth Analyzer
        logger.info(f"Step 3: Deep analysis for {report_id}")
        analysis_result = await in_depth_analyzer.process({
            "metrics": [m.model_dump() for m in report.metrics],
            "document_type": report.document_type.value,
            "report_id": report_id
        })
        
        if analysis_result["success"]:
            report.analysis_summary = analysis_result["data"]
        
        # STEP 4: Summary Creator
        logger.info(f"Step 4: Creating summary for {report_id}")
        summary_result = await summary_creator.process({
            "metrics": [m.model_dump() for m in report.metrics],
            "analysis": report.analysis_summary or {},
            "document_type": report.document_type.value,
            "report_id": report_id
        })
        
        if summary_result["success"]:
            summary_data = summary_result["data"]
            report.headline = summary_data.get("headline")
            report.user_summary = summary_data.get("quick_summary")
            report.action_items = summary_data.get("action_items", [])
        
        # Mark as analyzed
        report.status = ReportStatus.ANALYZED
        report.analyzed_at = datetime.utcnow()
        await report.save()
        
        logger.info(f"Analysis complete for {report_id}: {report.flagged_count} flagged, {report.normal_count} normal")
        
    except Exception as e:
        logger.error(f"Error analyzing document {report_id}: {e}")
        # Update report with failure
        try:
            report = await Report.get(PydanticObjectId(report_id))
            if report:
                report.status = ReportStatus.FAILED
                report.rejection_reason = str(e)
                await report.save()
        except:
            pass


@router.get("/", response_model=List[ReportOut])
async def list_reports(current_user: User = Depends(get_current_user)):
    """Get all reports for the current user."""
    reports = await Report.find(Report.user_id == str(current_user.id)).to_list()
    return [ReportOut.from_report(r) for r in reports]


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific report by ID."""
    from beanie import PydanticObjectId
    
    try:
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    
    return ReportOut.from_report(report)


@router.get("/{report_id}/details")
async def get_report_details(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get full report details including extracted text and metadata."""
    from beanie import PydanticObjectId
    
    try:
        report = await Report.get(PydanticObjectId(report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    
    return ReportDetailOut.from_report(report)


@router.get("/compare/")
async def compare_reports(
    report1_id: str = Query(..., description="First report ID"),
    report2_id: str = Query(..., description="Second report ID"),
    current_user: User = Depends(get_current_user)
):
    """
    Compare metrics between two reports.
    
    Returns side-by-side comparison with change indicators.
    """
    from beanie import PydanticObjectId
    
    # Get both reports
    try:
        report1 = await Report.get(PydanticObjectId(report1_id))
        report2 = await Report.get(PydanticObjectId(report2_id))
    except:
        raise HTTPException(status_code=404, detail="One or both reports not found")
    
    if not report1 or not report2:
        raise HTTPException(status_code=404, detail="One or both reports not found")
    
    # Verify ownership
    if report1.user_id != str(current_user.id) or report2.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view these reports")
    
    # Run comparison
    result = await comparison_creator.process({
        "report1": {
            "id": str(report1.id),
            "name": report1.file_name,
            "date": report1.created_at.isoformat(),
            "metrics": [m.model_dump() for m in report1.metrics]
        },
        "report2": {
            "id": str(report2.id),
            "name": report2.file_name,
            "date": report2.created_at.isoformat(),
            "metrics": [m.model_dump() for m in report2.metrics]
        }
    })
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail="Comparison failed")
    
    return result["data"]


@router.get("/dashboard/summary")
async def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    """
    Get summary data for dashboard display.
    
    Returns aggregated counts and latest flagged metrics.
    """
    # Get all analyzed reports for user
    reports = await Report.find(
        Report.user_id == str(current_user.id),
        Report.status == ReportStatus.ANALYZED
    ).sort(-Report.created_at).to_list()
    
    if not reports:
        return {
            "total_reports": 0,
            "total_flagged": 0,
            "total_normal": 0,
            "latest_headline": None,
            "flagged_metrics": [],
            "recent_reports": []
        }
    
    # Aggregate counts from latest report
    latest = reports[0]
    
    # Get all flagged metrics from latest report
    flagged_metrics = [
        {
            "name": m.name,
            "value": m.value,
            "unit": m.unit,
            "status": m.status.value,
            "category": m.category,
            "explanation": m.explanation
        }
        for m in latest.metrics
        if m.status != MetricStatus.NORMAL
    ]
    
    # Recent reports summary
    recent_reports = [
        {
            "id": str(r.id),
            "file_name": r.file_name,
            "document_type": r.document_type.value,
            "flagged_count": r.flagged_count,
            "normal_count": r.normal_count,
            "headline": r.headline,
            "created_at": r.created_at.isoformat()
        }
        for r in reports[:5]  # Last 5 reports
    ]
    
    return {
        "total_reports": len(reports),
        "total_flagged": latest.flagged_count,
        "total_normal": latest.normal_count,
        "latest_headline": latest.headline,
        "action_items": latest.action_items,
        "flagged_metrics": flagged_metrics,
        "recent_reports": recent_reports
    }
