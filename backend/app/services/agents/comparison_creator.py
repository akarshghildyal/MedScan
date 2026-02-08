"""
Comparison Creator Agent

Compares metrics between two reports of the same type,
calculates changes, and identifies significant trends.
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
import logging

logger = logging.getLogger(__name__)


class ComparisonCreator(BaseAgent):
    """Agent that compares metrics between multiple reports."""
    
    @property
    def name(self) -> str:
        return "Comparison Creator"
    
    @property
    def description(self) -> str:
        return "Compares metrics across reports and identifies trends"
    
    @property
    def system_prompt(self) -> str:
        return "Comparison logic agent - primarily uses rule-based logic."

    @property
    def model(self) -> str:
        return ""  # This agent uses rule-based comparison, no LLM needed
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare metrics between two reports.
        
        Args:
            input_data: {
                "report1": {id, name, date, metrics: [...]}
                "report2": {id, name, date, metrics: [...]}
            }
        
        Returns:
            Comparison with metric-by-metric analysis.
        """
        report1 = input_data.get("report1", {})
        report2 = input_data.get("report2", {})
        
        if not report1 or not report2:
            return self._create_output(
                success=False,
                error="Both reports required for comparison"
            )
        
        metrics1 = {m["name"]: m for m in report1.get("metrics", [])}
        metrics2 = {m["name"]: m for m in report2.get("metrics", [])}
        
        # Find all unique metric names
        all_metrics = set(metrics1.keys()) | set(metrics2.keys())
        
        comparisons = []
        improved = 0
        worsened = 0
        stable = 0
        new_metrics = 0
        
        for metric_name in sorted(all_metrics):
            m1 = metrics1.get(metric_name)
            m2 = metrics2.get(metric_name)
            
            comparison = self._compare_metric(metric_name, m1, m2)
            comparisons.append(comparison)
            
            # Count trends
            trend = comparison.get("trend")
            if trend == "improved":
                improved += 1
            elif trend == "worsened":
                worsened += 1
            elif trend == "stable":
                stable += 1
            elif trend == "new":
                new_metrics += 1
        
        # Generate summary text
        summary_parts = []
        if improved > 0:
            summary_parts.append(f"{improved} metric{'s' if improved > 1 else ''} improved")
        if worsened > 0:
            summary_parts.append(f"{worsened} metric{'s' if worsened > 1 else ''} worsened")
        if stable > 0:
            summary_parts.append(f"{stable} metric{'s' if stable > 1 else ''} stable")
        if new_metrics > 0:
            summary_parts.append(f"{new_metrics} new metric{'s' if new_metrics > 1 else ''}")
        
        summary = ", ".join(summary_parts) if summary_parts else "No metrics to compare"
        
        return self._create_output(
            success=True,
            data={
                "report1_id": report1.get("id"),
                "report1_date": report1.get("date"),
                "report1_name": report1.get("name"),
                "report2_id": report2.get("id"),
                "report2_date": report2.get("date"),
                "report2_name": report2.get("name"),
                "metrics": comparisons,
                "summary": summary,
                "counts": {
                    "improved": improved,
                    "worsened": worsened,
                    "stable": stable,
                    "new": new_metrics
                }
            }
        )
    
    def _compare_metric(
        self, 
        name: str, 
        m1: Optional[Dict], 
        m2: Optional[Dict]
    ) -> Dict[str, Any]:
        """Compare a single metric between two reports."""
        
        # Metric only in report2 (new)
        if m1 is None and m2 is not None:
            return {
                "name": name,
                "category": m2.get("category", "general"),
                "unit": m2.get("unit", ""),
                "report1_value": None,
                "report1_status": None,
                "report2_value": m2.get("value"),
                "report2_status": m2.get("status"),
                "change": None,
                "change_percent": None,
                "trend": "new"
            }
        
        # Metric only in report1 (removed)
        if m1 is not None and m2 is None:
            return {
                "name": name,
                "category": m1.get("category", "general"),
                "unit": m1.get("unit", ""),
                "report1_value": m1.get("value"),
                "report1_status": m1.get("status"),
                "report2_value": None,
                "report2_status": None,
                "change": None,
                "change_percent": None,
                "trend": "removed"
            }
        
        # Both reports have this metric
        val1 = m1.get("value", 0)
        val2 = m2.get("value", 0)
        status1 = m1.get("status", "normal")
        status2 = m2.get("status", "normal")
        
        # Calculate change
        change = val2 - val1
        change_percent = None
        if val1 != 0:
            change_percent = round((change / abs(val1)) * 100, 1)
        
        # Determine trend based on status changes
        trend = self._determine_trend(status1, status2, change)
        
        return {
            "name": name,
            "category": m1.get("category", "general"),
            "unit": m1.get("unit", ""),
            "report1_value": val1,
            "report1_status": status1,
            "report2_value": val2,
            "report2_status": status2,
            "change": round(change, 2),
            "change_percent": change_percent,
            "trend": trend
        }
    
    def _determine_trend(self, status1: str, status2: str, change: float) -> str:
        """Determine if the change is an improvement, worsening, or stable."""
        
        # Status priority: normal > low/high > critical
        status_priority = {
            "normal": 0,
            "low": 1,
            "high": 1,
            "critical": 2
        }
        
        p1 = status_priority.get(status1, 1)
        p2 = status_priority.get(status2, 1)
        
        # If moving toward normal, improved
        if p2 < p1:
            return "improved"
        
        # If moving away from normal, worsened
        if p2 > p1:
            return "worsened"
        
        # Same status - check if significant change (>5%)
        if abs(change) < 0.01:  # Essentially no change
            return "stable"
        
        # If both normal and small change, stable
        if status1 == "normal" and status2 == "normal":
            return "stable"
        
        # If both abnormal but change direction matters
        # For "low" status, increase is good; for "high" status, decrease is good
        if status1 in ("low", "critical") and status2 in ("low", "critical"):
            return "improved" if change > 0 else "worsened"
        
        if status1 in ("high", "critical") and status2 in ("high", "critical"):
            return "improved" if change < 0 else "worsened"
        
        return "stable"


# Singleton instance
comparison_creator = ComparisonCreator()
