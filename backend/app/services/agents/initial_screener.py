"""
Initial Screener Agent

Second agent in the processing pipeline. Responsibilities:
- Parse medical metrics from extracted text
- Identify reference ranges
- Flag abnormal values
- Create structured summary JSON for storage
"""

from typing import Dict, Any, List
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


INITIAL_SCREENER_SYSTEM_PROMPT = """You are a medical report screener. Your task is to extract and structure medical metrics from document text.

TASK:
1. Identify all medical metrics/test results in the document
2. Extract values, units, and reference ranges
3. Flag any abnormal values (high/low/critical)
4. Create a structured summary

RESPONSE FORMAT (JSON only):
{
    "report_type": "blood_test" | "urine_test" | "lipid_panel" | "liver_function" | "kidney_function" | "thyroid" | "vitamin" | "other",
    "test_date": "YYYY-MM-DD or null if not found",
    "metrics": [
        {
            "name": "Metric name (e.g., Hemoglobin)",
            "value": numeric_value_or_string,
            "unit": "unit string (e.g., g/dL)",
            "reference_range": "range string (e.g., 13.5-17.5)",
            "status": "normal" | "low" | "high" | "critical_low" | "critical_high",
            "category": "hematology" | "biochemistry" | "lipids" | "hormones" | "vitamins" | "other"
        }
    ],
    "summary": {
        "total_metrics": number,
        "normal_count": number,
        "abnormal_count": number,
        "critical_count": number
    },
    "flags": ["array of flagged conditions, e.g., 'low_hemoglobin', 'high_cholesterol'"],
    "keywords": ["important medical terms for search, max 10"]
}

RULES:
- Only return valid JSON, no other text
- Extract ALL metrics you can find
- Use standard medical terminology for names
- If reference range not specified, leave as null
- Status should be based on reference range comparison
- Keywords should be useful for searching this report later
- Be thorough but accurate"""


class InitialScreener(BaseAgent):
    """
    Agent 2: Initial Screener
    
    Creates structured summary of medical metrics from extracted text,
    identifies abnormalities, and prepares data for in-depth analysis.
    """
    
    @property
    def name(self) -> str:
        return "initial_screener"
    
    @property
    def description(self) -> str:
        return "Extracts and structures medical metrics from document text"
    
    @property
    def system_prompt(self) -> str:
        return INITIAL_SCREENER_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_FAST
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process extracted text and create structured summary.
        
        Args:
            input_data: {
                "extracted_text": str,  # Text from Document Analyzer
                "document_type": str,   # Type identified by Document Analyzer
                "report_id": str        # Report ID for reference
            }
            
        Returns:
            {
                "agent": "initial_screener",
                "success": bool,
                "data": {
                    "report_type": str,
                    "test_date": str or None,
                    "metrics": [...],
                    "summary": {...},
                    "flags": [...],
                    "keywords": [...]
                },
                "error": str or None
            }
        """
        try:
            extracted_text = input_data.get("extracted_text", "")
            document_type = input_data.get("document_type", "unknown")
            
            if not extracted_text or len(extracted_text.strip()) < 20:
                return self._create_output(
                    success=False,
                    error="Insufficient text content to analyze"
                )
            
            # Screen the document
            screening_result = await self._screen_document(extracted_text, document_type)
            
            # Validate and enhance result
            enhanced_result = self._enhance_result(screening_result)
            
            return self._create_output(success=True, data=enhanced_result)
            
        except Exception as e:
            logger.error(f"Initial screening failed: {str(e)}")
            return self._create_output(success=False, error=str(e))
    
    async def _screen_document(self, text: str, doc_type: str) -> Dict[str, Any]:
        """Extract metrics and create structured summary."""
        # Truncate text if too long
        max_chars = 10000
        if len(text) > max_chars:
            text = text[:max_chars] + "\n...[truncated]..."
        
        prompt = f"""Analyze this {doc_type} and extract all medical metrics.

DOCUMENT TEXT:
---
{text}
---

Extract all test results, values, and reference ranges. Flag any abnormal values.
Respond with JSON only."""

        response = await self._call_llm(
            prompt=prompt,
            temperature=0.1,
            max_tokens=4096,
            expect_json=True
        )
        
        return response.get("parsed", {})
    
    def _enhance_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance the screening result."""
        # Ensure required fields exist
        metrics = result.get("metrics", [])
        
        # Calculate summary if not provided
        if "summary" not in result or not result["summary"]:
            normal = sum(1 for m in metrics if m.get("status") == "normal")
            abnormal = sum(1 for m in metrics if m.get("status") in ["low", "high"])
            critical = sum(1 for m in metrics if m.get("status") in ["critical_low", "critical_high"])
            
            result["summary"] = {
                "total_metrics": len(metrics),
                "normal_count": normal,
                "abnormal_count": abnormal,
                "critical_count": critical
            }
        
        # Generate flags if not provided
        if "flags" not in result or not result["flags"]:
            flags = []
            for m in metrics:
                status = m.get("status", "normal")
                name = m.get("name", "unknown").lower().replace(" ", "_")
                if status in ["low", "critical_low"]:
                    flags.append(f"low_{name}")
                elif status in ["high", "critical_high"]:
                    flags.append(f"high_{name}")
            result["flags"] = flags[:20]  # Limit to 20 flags
        
        # Ensure keywords exist
        if "keywords" not in result or not result["keywords"]:
            keywords = []
            for m in metrics[:10]:
                keywords.append(m.get("name", ""))
            result["keywords"] = [k for k in keywords if k]
        
        return result


# Singleton instance
initial_screener = InitialScreener()
