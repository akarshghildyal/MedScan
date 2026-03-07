"""
Agent 6: Detailed Explanation Generator

Generates a comprehensive, patient-friendly explanation of report results.
"""

from typing import Dict, Any
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


EXPLANATION_SYSTEM_PROMPT = """You are a medical explanation assistant.

Explain the following lab report results in clear, patient-friendly language.

RULES:
- Write in clear, simple language that a patient can understand
- Explain what each abnormal marker means
- Mention normal markers briefly
- Include context about what the markers measure
- Do NOT provide medical diagnosis
- Do NOT recommend specific treatments
- Suggest consulting a doctor for abnormal results
- Use 2-4 paragraphs
- Be empathetic and reassuring while being accurate
"""


class ExplanationGenerator(BaseAgent):
    """
    Agent 6: Detailed Explanation
    
    Input: {"markers": [...], "insights": [...], "report_type": str}
    Output: {"detailed_analysis": str}
    """
    
    @property
    def name(self) -> str:
        return "explanation_generator"
    
    @property
    def system_prompt(self) -> str:
        return EXPLANATION_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_REASONING
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed explanation of report findings."""
        try:
            markers = input_data.get("markers", [])
            insights = input_data.get("insights", [])
            report_type = input_data.get("report_type", "Pathology Report")
            
            if not markers:
                return self._create_output(True, data={
                    "detailed_analysis": "No markers were extracted from this report."
                })
            
            # Format markers
            marker_lines = []
            for m in markers:
                ref_range = ""
                if m.get("reference_min") is not None and m.get("reference_max") is not None:
                    ref_range = f" (Reference: {m['reference_min']} - {m['reference_max']})"
                elif m.get("reference_max") is not None:
                    ref_range = f" (Reference: < {m['reference_max']})"
                elif m.get("reference_min") is not None:
                    ref_range = f" (Reference: > {m['reference_min']})"
                
                status_label = f" [{m['status'].upper()}]" if m.get("status") != "normal" else ""
                marker_lines.append(
                    f"- {m['name']}: {m['value']} {m.get('unit', '')}{ref_range}{status_label}"
                )
            
            markers_text = "\n".join(marker_lines)
            insights_text = "\n".join([f"- {i}" for i in insights]) if insights else "None"
            
            prompt = f"""Provide a detailed, patient-friendly explanation for this {report_type}:

MARKERS:
{markers_text}

CLINICAL INSIGHTS:
{insights_text}

Write a comprehensive but easy-to-understand explanation."""

            response = await self._call_llm(
                prompt=prompt,
                temperature=0.4,
                max_tokens=2048
            )
            
            detailed_analysis = response.get("content", "")
            
            logger.info(f"Generated detailed explanation ({len(detailed_analysis)} chars)")
            return self._create_output(True, data={"detailed_analysis": detailed_analysis})
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {str(e)}")
            return self._create_output(False, error=str(e))


# Singleton
explanation_generator = ExplanationGenerator()
