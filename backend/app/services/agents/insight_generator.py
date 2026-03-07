"""
Agent 5: Insight Generation

Generates short clinical insights for abnormal markers using an LLM.
"""

from typing import Dict, Any, List
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


INSIGHT_SYSTEM_PROMPT = """You are a medical assistant providing brief clinical insights.

For each abnormal marker provided, give a short 1-sentence insight explaining what the abnormality may indicate.

RESPONSE FORMAT (JSON only):
{
    "insights": [
        "Elevated WBC may indicate infection or inflammation.",
        "Low Hemoglobin may suggest anemia or iron deficiency."
    ]
}

RULES:
- Only return valid JSON, no other text
- One insight per abnormal marker
- Keep each insight to 1 sentence, clear and patient-friendly
- Do NOT provide medical diagnosis
- Use language like "may indicate", "could suggest", "is sometimes associated with"
- If no markers are abnormal, return {"insights": []}
"""


class InsightGenerator(BaseAgent):
    """
    Agent 5: Insight Generation
    
    Input: {"markers": [markers with status]}
    Output: {"insights": ["Elevated WBC may indicate infection.", ...]}
    """
    
    @property
    def name(self) -> str:
        return "insight_generator"
    
    @property
    def system_prompt(self) -> str:
        return INSIGHT_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_FAST
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights for abnormal markers."""
        try:
            markers = input_data.get("markers", [])
            
            # Filter to only abnormal markers
            abnormal = [m for m in markers if m.get("status") in ("high", "low")]
            
            if not abnormal:
                return self._create_output(True, data={"insights": []})
            
            # Format abnormal markers for prompt
            marker_text = "\n".join([
                f"- {m['name']}: {m['value']} {m.get('unit', '')} "
                f"(Reference: {m.get('reference_min', '?')} - {m.get('reference_max', '?')}, "
                f"Status: {m['status']})"
                for m in abnormal
            ])
            
            prompt = f"""Provide brief clinical insights for the following abnormal markers:

{marker_text}

Return JSON with insights."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.3,
                max_tokens=1024,
                expect_json=True
            )
            
            parsed = response.get("parsed", {})
            insights = parsed.get("insights", [])
            
            logger.info(f"Generated {len(insights)} insights")
            return self._create_output(True, data={"insights": insights})
            
        except Exception as e:
            logger.error(f"Insight generation failed: {str(e)}")
            return self._create_output(False, error=str(e))


# Singleton
insight_generator = InsightGenerator()
