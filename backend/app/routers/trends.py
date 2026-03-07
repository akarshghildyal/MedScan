"""
Trends Router - Biomarker Trend Analysis

Retrieves historical values of a specific biomarker across all user reports.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.user import User
from app.models.report import Report, ReportStatus
from app.core.security import get_current_user

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class TrendDataPoint(BaseModel):
    date: str
    value: float


class TrendResponse(BaseModel):
    marker: str
    data: List[TrendDataPoint]


@router.get("/{marker_name}", response_model=TrendResponse)
async def get_marker_trend(
    marker_name: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve historical biomarker values across patient reports.
    
    Returns values sorted by report date for trend charting.
    """
    # Get all analyzed reports for user, sorted by date
    reports = await Report.find(
        Report.user_id == str(current_user.id),
        Report.status == ReportStatus.ANALYZED
    ).sort(Report.upload_date).to_list()
    
    if not reports:
        return TrendResponse(marker=marker_name, data=[])
    
    # Extract matching marker values
    data_points = []
    marker_lower = marker_name.lower().strip()
    
    for report in reports:
        for marker in report.markers:
            if marker.name.lower().strip() == marker_lower:
                data_points.append(TrendDataPoint(
                    date=report.upload_date.strftime("%Y-%m-%d"),
                    value=marker.value
                ))
                break  # One match per report
    
    return TrendResponse(marker=marker_name, data=data_points)
