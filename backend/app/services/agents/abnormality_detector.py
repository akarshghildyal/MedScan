"""
Agent 4: Abnormality Detection

Deterministic logic — NO LLM required.
Compares marker values against reference ranges to flag abnormalities.

Rules:
    value > reference_max → "high"
    value < reference_min → "low"
    otherwise → "normal"
"""

from typing import Dict, Any, List
import logging


logger = logging.getLogger(__name__)


class AbnormalityDetector:
    """
    Agent 4: Abnormality Detection (Deterministic)
    
    Input: {"markers": [{"name", "value", "unit", "reference_min", "reference_max"}]}
    Output: {"markers": [{"name", "value", "unit", "reference_min", "reference_max", "status"}]}
    """
    
    name = "abnormality_detector"
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply deterministic abnormality detection to markers."""
        try:
            markers = input_data.get("markers", [])
            
            if not markers:
                return {
                    "agent": self.name,
                    "success": True,
                    "data": {"markers": []},
                    "error": None
                }
            
            flagged_markers = []
            for marker in markers:
                status = self._detect_status(
                    value=marker.get("value"),
                    reference_min=marker.get("reference_min"),
                    reference_max=marker.get("reference_max")
                )
                flagged_markers.append({
                    **marker,
                    "status": status
                })
            
            flagged_count = sum(1 for m in flagged_markers if m["status"] != "normal")
            logger.info(f"Abnormality detection: {flagged_count}/{len(flagged_markers)} flagged")
            
            return {
                "agent": self.name,
                "success": True,
                "data": {"markers": flagged_markers},
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Abnormality detection failed: {str(e)}")
            return {
                "agent": self.name,
                "success": False,
                "data": {},
                "error": str(e)
            }
    
    @staticmethod
    def _detect_status(value, reference_min, reference_max) -> str:
        """
        Determine if a marker value is normal, high, or low.
        
        If reference range is not available, defaults to "normal"
        to avoid false positives.
        """
        if value is None:
            return "normal"
        
        try:
            val = float(value)
        except (ValueError, TypeError):
            return "normal"
        
        if reference_max is not None:
            try:
                if val > float(reference_max):
                    return "high"
            except (ValueError, TypeError):
                pass
        
        if reference_min is not None:
            try:
                if val < float(reference_min):
                    return "low"
            except (ValueError, TypeError):
                pass
        
        return "normal"


# Singleton
abnormality_detector = AbnormalityDetector()
