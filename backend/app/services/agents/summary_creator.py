"""
Summary Creator Agent

Generates clean, readable summaries from analysis output.
Produces headlines, quick summaries, and action items for users.
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
from ..llm.llm_client import llm_client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class SummaryCreator(BaseAgent):
    """Agent that creates user-friendly summaries from analysis data."""
    
    @property
    def name(self) -> str:
        return "Summary Creator"
    
    @property
    def description(self) -> str:
        return "Converts analysis to readable summaries for users"
    
    @property
    def system_prompt(self) -> str:
        return """You are a medical communication specialist who creates clear, 
understandable health summaries for patients.

Your role is to:
1. Convert complex medical analysis into simple language
2. Create concise headlines that summarize the key finding
3. Provide brief explanations patients can understand
4. List clear action items

IMPORTANT GUIDELINES:
- Use simple, everyday language
- Avoid medical jargon when possible
- Be reassuring but honest
- Keep summaries concise
- Never provide diagnoses or medical advice
- Always recommend consulting healthcare providers for concerns"""

    @property
    def model(self) -> str:
        return settings.FAST_MODEL
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create user-friendly summary from analysis.
        
        Args:
            input_data: {
                "metrics": List of metrics with status
                "analysis": In-depth analysis results
                "document_type": Type of report
                "report_id": Report ID
            }
        
        Returns:
            Summary with headline, quick_summary, and action_items.
        """
        metrics = input_data.get("metrics", [])
        analysis = input_data.get("analysis", {})
        document_type = input_data.get("document_type", "medical report")
        report_id = input_data.get("report_id", "unknown")
        
        # Count metrics by status
        flagged_count = len([m for m in metrics if m.get("status") != "normal"])
        normal_count = len([m for m in metrics if m.get("status") == "normal"])
        total_count = len(metrics)
        
        # If all normal, use simple summary
        if flagged_count == 0:
            return self._create_output(
                success=True,
                data={
                    "headline": "All results within normal range",
                    "quick_summary": f"Your {document_type} shows {total_count} metrics, all within healthy ranges. Continue your current health habits.",
                    "action_items": [
                        "Continue regular health monitoring",
                        "Schedule your next routine checkup"
                    ]
                }
            )
        
        try:
            # Get overall assessment from analysis
            overall = analysis.get("overall_assessment", {})
            severity = overall.get("severity", "unknown")
            concerns = overall.get("key_concerns", [])
            
            # Build prompt for LLM to create summary
            prompt = f"""Based on this medical report analysis, create a patient-friendly summary.

REPORT TYPE: {document_type}
METRICS: {total_count} total ({normal_count} normal, {flagged_count} need attention)

SEVERITY: {severity}
KEY CONCERNS: {', '.join(concerns) if concerns else 'None specified'}

INDIVIDUAL FINDINGS:
{self._format_findings(analysis.get('individual_analysis', []))}

Create a summary in this exact JSON format:
{{
    "headline": "Short headline (max 10 words) summarizing the key finding",
    "quick_summary": "2-3 sentence summary explaining what the results mean in simple terms",
    "action_items": ["Action 1", "Action 2", "Action 3"]
}}

Keep language simple and reassuring. Do not cause unnecessary alarm."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.3,
                max_tokens=512,
                expect_json=True
            )
            
            if not response.get("success"):
                # Fallback summary
                return self._create_output(
                    success=True,
                    data=self._create_fallback_summary(flagged_count, severity)
                )
            
            summary = response.get("parsed", {})
            
            # Ensure required fields
            if "headline" not in summary:
                summary["headline"] = f"{flagged_count} value(s) need attention"
            if "quick_summary" not in summary:
                summary["quick_summary"] = f"Your report shows {flagged_count} values outside the normal range."
            if "action_items" not in summary:
                summary["action_items"] = ["Discuss results with your doctor"]
            
            return self._create_output(success=True, data=summary)
            
        except Exception as e:
            logger.error(f"Error creating summary for report {report_id}: {e}")
            return self._create_output(
                success=True,
                data=self._create_fallback_summary(flagged_count, "unknown")
            )
    
    def _format_findings(self, findings: List[Dict[str, Any]]) -> str:
        """Format findings for LLM prompt."""
        if not findings:
            return "No specific findings"
        
        lines = []
        for f in findings[:5]:  # Limit to top 5
            lines.append(f"- {f.get('metric')}: {f.get('status')} - {f.get('explanation', 'No details')}")
        return "\n".join(lines)
    
    def _create_fallback_summary(self, flagged_count: int, severity: str) -> Dict[str, Any]:
        """Create a basic summary when LLM fails."""
        if flagged_count == 1:
            headline = "1 result needs attention"
        else:
            headline = f"{flagged_count} results need attention"
        
        return {
            "headline": headline,
            "quick_summary": f"Your report shows {flagged_count} value(s) outside the normal range. Please review the flagged items and consult with your healthcare provider if you have concerns.",
            "action_items": [
                "Review the flagged metrics below",
                "Discuss findings with your doctor",
                "Schedule a follow-up if recommended"
            ]
        }


# Singleton instance
summary_creator = SummaryCreator()
