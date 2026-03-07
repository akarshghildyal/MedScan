"""
Agent Pipeline Orchestrator

Runs all 7 agents sequentially, passing data between them.
This is the main entry point for report processing.

Pipeline:
    1. PDF Parser → raw text
    2. Report Classifier → report type
    3. Data Extractor → structured markers
    4. Abnormality Detector → markers with status
    5. Insight Generator → clinical insights
    6. Explanation Generator → detailed explanation
    7. Summary Generator → patient-friendly summary
"""

from typing import Dict, Any
from datetime import datetime
import logging

from app.services.agents.pdf_parser import pdf_parser
from app.services.agents.report_classifier import report_classifier
from app.services.agents.data_extractor import data_extractor
from app.services.agents.abnormality_detector import abnormality_detector
from app.services.agents.insight_generator import insight_generator
from app.services.agents.explanation_generator import explanation_generator
from app.services.agents.summary_generator import summary_generator


logger = logging.getLogger(__name__)


class AgentPipeline:
    """
    Orchestrates the 7-agent sequential pipeline for report processing.
    
    Usage:
        pipeline = AgentPipeline()
        result = await pipeline.run(file_path="/path/to/report.pdf")
    """
    
    def __init__(self):
        self.agents = [
            ("pdf_parser", pdf_parser),
            ("report_classifier", report_classifier),
            ("data_extractor", data_extractor),
            ("abnormality_detector", abnormality_detector),
            ("insight_generator", insight_generator),
            ("explanation_generator", explanation_generator),
            ("summary_generator", summary_generator),
        ]
    
    async def run(self, file_path: str) -> Dict[str, Any]:
        """
        Run the full pipeline on a PDF file.
        
        Args:
            file_path: Path to the uploaded PDF
            
        Returns:
            {
                "success": bool,
                "report_type": str,
                "markers": [...],
                "insights": [...],
                "detailed_analysis": str,
                "summary": str,
                "extracted_text": str,
                "error": str | None,
                "agent_logs": [...]
            }
        """
        start_time = datetime.utcnow()
        agent_logs = []
        
        try:
            # === STEP 1: PDF Parser ===
            logger.info("Pipeline Step 1: PDF Parser")
            step1 = await pdf_parser.process({"file_path": file_path})
            agent_logs.append({"agent": "pdf_parser", "success": step1["success"]})
            
            if not step1["success"]:
                return self._fail(f"PDF parsing failed: {step1.get('error')}", agent_logs)
            
            raw_text = step1["data"]["text"]
            
            # === STEP 2: Report Classifier ===
            logger.info("Pipeline Step 2: Report Classifier")
            step2 = await report_classifier.process({"text": raw_text})
            agent_logs.append({"agent": "report_classifier", "success": step2["success"]})
            
            report_type = "General Pathology"
            if step2["success"]:
                report_type = step2["data"].get("report_type", "General Pathology")
            
            # === STEP 3: Data Extractor ===
            logger.info("Pipeline Step 3: Data Extractor")
            step3 = await data_extractor.process({"text": raw_text, "report_type": report_type})
            agent_logs.append({"agent": "data_extractor", "success": step3["success"]})
            
            if not step3["success"]:
                return self._fail(f"Data extraction failed: {step3.get('error')}", agent_logs)
            
            markers = step3["data"].get("markers", [])
            
            # === STEP 4: Abnormality Detector ===
            logger.info("Pipeline Step 4: Abnormality Detector")
            step4 = await abnormality_detector.process({"markers": markers})
            agent_logs.append({"agent": "abnormality_detector", "success": step4["success"]})
            
            if not step4["success"]:
                return self._fail(f"Abnormality detection failed: {step4.get('error')}", agent_logs)
            
            markers_with_status = step4["data"].get("markers", markers)
            
            # === STEP 5: Insight Generator ===
            logger.info("Pipeline Step 5: Insight Generator")
            step5 = await insight_generator.process({"markers": markers_with_status})
            agent_logs.append({"agent": "insight_generator", "success": step5["success"]})
            
            insights = []
            if step5["success"]:
                insights = step5["data"].get("insights", [])
            
            # === STEP 6: Explanation Generator ===
            logger.info("Pipeline Step 6: Explanation Generator")
            step6 = await explanation_generator.process({
                "markers": markers_with_status,
                "insights": insights,
                "report_type": report_type
            })
            agent_logs.append({"agent": "explanation_generator", "success": step6["success"]})
            
            detailed_analysis = ""
            if step6["success"]:
                detailed_analysis = step6["data"].get("detailed_analysis", "")
            
            # === STEP 7: Summary Generator ===
            logger.info("Pipeline Step 7: Summary Generator")
            step7 = await summary_generator.process({"detailed_analysis": detailed_analysis})
            agent_logs.append({"agent": "summary_generator", "success": step7["success"]})
            
            summary = ""
            if step7["success"]:
                summary = step7["data"].get("summary", "")
            
            # Calculate duration
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Pipeline complete in {duration:.1f}s: {len(markers_with_status)} markers, {len(insights)} insights")
            
            return {
                "success": True,
                "report_type": report_type,
                "markers": markers_with_status,
                "insights": insights,
                "detailed_analysis": detailed_analysis,
                "summary": summary,
                "extracted_text": raw_text,
                "error": None,
                "agent_logs": agent_logs,
                "duration_seconds": duration
            }
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}")
            return self._fail(str(e), agent_logs)
    
    @staticmethod
    def _fail(error: str, agent_logs: list) -> Dict[str, Any]:
        """Create a failure result."""
        return {
            "success": False,
            "report_type": "unknown",
            "markers": [],
            "insights": [],
            "detailed_analysis": "",
            "summary": "",
            "extracted_text": "",
            "error": error,
            "agent_logs": agent_logs
        }


# Singleton
agent_pipeline = AgentPipeline()
