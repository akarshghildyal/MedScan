"""
Agent 2: Report Type Classifier

Identifies the type of pathology report using an LLM.
"""

from typing import Dict, Any
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


CLASSIFIER_SYSTEM_PROMPT = """You are a medical report classifier.

Based on the following pathology report text, identify the report type.

Possible types include:
- CBC (Complete Blood Count)
- Urine Analysis
- Lipid Profile
- Liver Function Test
- Kidney Function Test
- Thyroid Profile
- General Pathology

RESPONSE FORMAT (JSON only):
{
    "report_type": "CBC"
}

RULES:
- Only return valid JSON, no other text
- Return exactly one of the types listed above
- If uncertain, return "General Pathology"
"""


class ReportClassifier(BaseAgent):
    """
    Agent 2: Report Type Classifier
    
    Input: {"text": str}
    Output: {"report_type": str}
    """
    
    @property
    def name(self) -> str:
        return "report_classifier"
    
    @property
    def system_prompt(self) -> str:
        return CLASSIFIER_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_FAST
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Classify the report type from raw text."""
        try:
            text = input_data.get("text", "")
            
            if not text:
                return self._create_output(False, error="No text provided")
            
            # Truncate for classification (first 3000 chars is enough)
            truncated = text[:3000] if len(text) > 3000 else text
            
            prompt = f"""Classify the following pathology report:

REPORT TEXT:
---
{truncated}
---

Return the report type as JSON."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.1,
                max_tokens=256,
                expect_json=True
            )
            
            parsed = response.get("parsed", {})
            report_type = parsed.get("report_type", "General Pathology")
            
            logger.info(f"Report classified as: {report_type}")
            return self._create_output(True, data={"report_type": report_type})
            
        except Exception as e:
            logger.error(f"Report classification failed: {str(e)}")
            return self._create_output(False, error=str(e))


# Singleton
report_classifier = ReportClassifier()
