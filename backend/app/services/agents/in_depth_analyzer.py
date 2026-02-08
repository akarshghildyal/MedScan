"""
In-Depth Analyzer Agent

Performs deep analysis on metrics, identifies correlations between abnormal values,
and provides explanations and suggested actions.
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
from ..llm.llm_client import llm_client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class InDepthAnalyzer(BaseAgent):
    """Agent that performs correlation analysis and generates explanations."""
    
    @property
    def name(self) -> str:
        return "In-Depth Analyzer"
    
    @property
    def description(self) -> str:
        return "Analyzes metrics, identifies correlations, and provides explanations"
    
    @property
    def system_prompt(self) -> str:
        return """You are a medical analysis assistant specializing in interpreting lab results.
Your role is to:
1. Analyze individual abnormal metrics and explain what they might indicate
2. Identify correlations between multiple abnormal values
3. Suggest possible causes (not diagnoses) for abnormal patterns
4. Provide severity assessment
5. Suggest relevant follow-up actions

IMPORTANT GUIDELINES:
- Never provide definitive diagnoses
- Do not recommend specific medications
- Use simple, patient-friendly language
- Always emphasize consulting a healthcare provider
- Be factual and avoid causing unnecessary alarm
- Reference medical knowledge appropriately"""

    @property
    def model(self) -> str:
        return settings.REASONING_MODEL
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze metrics from the screener output.
        
        Args:
            input_data: {
                "metrics": List of metric dicts with name, value, unit, status, reference_range
                "document_type": Type of report (lipid, cbc, etc.)
                "report_id": Optional report ID for logging
            }
        
        Returns:
            Analysis with individual explanations, correlations, and severity.
        """
        metrics = input_data.get("metrics", [])
        document_type = input_data.get("document_type", "unknown")
        report_id = input_data.get("report_id", "unknown")
        
        if not metrics:
            return self._create_output(
                success=True,
                data={
                    "individual_analysis": [],
                    "correlation_analysis": [],
                    "overall_assessment": {
                        "severity": "normal",
                        "key_concerns": [],
                        "suggested_actions": []
                    }
                }
            )
        
        # Filter for abnormal metrics
        abnormal_metrics = [m for m in metrics if m.get("status") != "normal"]
        
        if not abnormal_metrics:
            return self._create_output(
                success=True,
                data={
                    "individual_analysis": [],
                    "correlation_analysis": [],
                    "overall_assessment": {
                        "severity": "normal",
                        "key_concerns": [],
                        "suggested_actions": ["Continue regular health monitoring"]
                    }
                }
            )
        
        try:
            # Format metrics for LLM
            metrics_text = self._format_metrics_for_analysis(metrics)
            
            prompt = f"""Analyze the following {document_type} lab results and provide insights.

METRICS:
{metrics_text}

Provide your analysis in the following JSON format:
{{
    "individual_analysis": [
        {{
            "metric": "Metric Name",
            "status": "low|high|critical",
            "explanation": "Brief explanation of what this means",
            "possible_causes": ["cause1", "cause2"]
        }}
    ],
    "correlation_analysis": [
        {{
            "metrics": ["Metric1", "Metric2"],
            "pattern": "Pattern name if applicable",
            "explanation": "What these values together might indicate",
            "confidence": 0.85
        }}
    ],
    "overall_assessment": {{
        "severity": "normal|mild|moderate|severe",
        "key_concerns": ["Concern 1", "Concern 2"],
        "suggested_actions": ["Consult doctor", "Follow-up test"]
    }}
}}

Focus only on ABNORMAL values. Be concise but informative."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.2,
                max_tokens=2048,
                expect_json=True
            )
            
            if not response.get("success"):
                logger.error(f"LLM call failed for report {report_id}")
                return self._create_output(success=False, error="Analysis failed")
            
            analysis = response.get("parsed", {})
            
            # Ensure required fields exist
            if "individual_analysis" not in analysis:
                analysis["individual_analysis"] = []
            if "correlation_analysis" not in analysis:
                analysis["correlation_analysis"] = []
            if "overall_assessment" not in analysis:
                analysis["overall_assessment"] = {
                    "severity": "unknown",
                    "key_concerns": [],
                    "suggested_actions": ["Consult with your healthcare provider"]
                }
            
            return self._create_output(success=True, data=analysis)
            
        except Exception as e:
            logger.error(f"Error in in-depth analysis for report {report_id}: {e}")
            return self._create_output(success=False, error=str(e))
    
    def _format_metrics_for_analysis(self, metrics: List[Dict[str, Any]]) -> str:
        """Format metrics as readable text for LLM."""
        lines = []
        for m in metrics:
            status = m.get("status", "unknown")
            status_marker = "✓" if status == "normal" else "⚠"
            reference = m.get("reference_range", "N/A")
            
            line = f"{status_marker} {m.get('name')}: {m.get('value')} {m.get('unit', '')} "
            line += f"(Ref: {reference}) - Status: {status.upper()}"
            lines.append(line)
        
        return "\n".join(lines)


# Singleton instance
in_depth_analyzer = InDepthAnalyzer()
