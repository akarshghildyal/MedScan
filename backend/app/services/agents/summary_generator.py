"""
Agent 7: Summary Generator

Generates a concise 1-2 sentence patient-friendly summary from the detailed explanation.
"""

from typing import Dict, Any
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


SUMMARY_SYSTEM_PROMPT = """Summarize the following medical explanation into 1-2 simple sentences suitable for a patient.

RULES:
- Maximum 2 sentences
- Use plain, non-technical language
- Highlight the most important finding
- Do not provide medical diagnosis
- Be reassuring but accurate
- Return only the summary text, no JSON formatting
"""


class SummaryGenerator(BaseAgent):
    """
    Agent 7: Summary
    
    Input: {"detailed_analysis": str}
    Output: {"summary": str}
    """
    
    @property
    def name(self) -> str:
        return "summary_generator"
    
    @property
    def system_prompt(self) -> str:
        return SUMMARY_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_FAST
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate concise summary from detailed explanation."""
        try:
            detailed_analysis = input_data.get("detailed_analysis", "")
            
            if not detailed_analysis:
                return self._create_output(True, data={"summary": "No analysis available."})
            
            prompt = f"""Summarize the following medical report explanation:

{detailed_analysis}

Provide a 1-2 sentence summary."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.3,
                max_tokens=256
            )
            
            summary = response.get("content", "").strip()
            
            logger.info(f"Generated summary: {summary[:80]}...")
            return self._create_output(True, data={"summary": summary})
            
        except Exception as e:
            logger.error(f"Summary generation failed: {str(e)}")
            return self._create_output(False, error=str(e))


# Singleton
summary_generator = SummaryGenerator()
