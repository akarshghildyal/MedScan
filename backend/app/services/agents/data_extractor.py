"""
Agent 3: Medical Data Extraction

Extracts structured biomarker data from raw report text using an LLM.
"""

from typing import Dict, Any
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


DATA_EXTRACTION_SYSTEM_PROMPT = """You are a medical data extraction system.

Extract laboratory markers from the following pathology report text.

RESPONSE FORMAT (JSON only):
{
    "markers": [
        {
            "name": "Marker name (e.g., WBC, Hemoglobin)",
            "value": 11.3,
            "unit": "unit string (e.g., x10^9/L, g/dL)",
            "reference_min": 4.0,
            "reference_max": 10.0
        }
    ]
}

RULES:
- Only return valid JSON, no other text
- Extract ALL test results/markers you can find
- Use standard medical terminology for marker names
- value MUST be a number (float). If the value is non-numeric (e.g., "Negative", "Positive"), skip that marker.
- reference_min and reference_max must be numbers or null if not available
- Parse reference ranges like "4.0 - 10.0" into reference_min: 4.0 and reference_max: 10.0
- Parse ranges like "< 200" as reference_min: null, reference_max: 200
- Parse ranges like "> 40" as reference_min: 40, reference_max: null
- Be thorough — extract every numeric test result
"""


class DataExtractor(BaseAgent):
    """
    Agent 3: Medical Data Extraction
    
    Input: {"text": str, "report_type": str}
    Output: {"markers": [{"name", "value", "unit", "reference_min", "reference_max"}]}
    """
    
    @property
    def name(self) -> str:
        return "data_extractor"
    
    @property
    def system_prompt(self) -> str:
        return DATA_EXTRACTION_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_REASONING
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured marker data from report text."""
        try:
            text = input_data.get("text", "")
            report_type = input_data.get("report_type", "General Pathology")
            
            if not text:
                return self._create_output(False, error="No text provided")
            
            # Truncate if very long
            max_chars = 10000
            truncated = text[:max_chars] if len(text) > max_chars else text
            
            prompt = f"""Extract all laboratory markers from this {report_type} report.

REPORT TEXT:
---
{truncated}
---

Return JSON with all markers found."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.1,
                max_tokens=4096,
                expect_json=True
            )
            
            parsed = response.get("parsed", {})
            markers = parsed.get("markers", [])
            
            # Validate and clean markers
            clean_markers = []
            for m in markers:
                try:
                    clean_markers.append({
                        "name": str(m.get("name", "Unknown")),
                        "value": float(m.get("value", 0)),
                        "unit": str(m.get("unit", "")),
                        "reference_min": float(m["reference_min"]) if m.get("reference_min") is not None else None,
                        "reference_max": float(m["reference_max"]) if m.get("reference_max") is not None else None,
                    })
                except (ValueError, TypeError) as e:
                    logger.warning(f"Skipping invalid marker: {m} - {e}")
                    continue
            
            logger.info(f"Extracted {len(clean_markers)} markers")
            return self._create_output(True, data={"markers": clean_markers})
            
        except Exception as e:
            logger.error(f"Data extraction failed: {str(e)}")
            return self._create_output(False, error=str(e))


# Singleton
data_extractor = DataExtractor()
