"""
Integration Tests for Agent Pipeline

Tests the pipeline orchestration with mocked LLM calls.
Verifies that data flows correctly between agents.
"""

import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


class TestAgentPipeline:
    """Tests for the AgentPipeline orchestrator."""
    
    @pytest.mark.asyncio
    async def test_pipeline_runs_all_agents_in_order(self, tmp_path):
        """Verify all 7 agents execute in sequence."""
        # Create a mock PDF file
        pdf_file = tmp_path / "test_report.pdf"
        pdf_file.write_bytes(b"%PDF-1.4 fake content")
        
        # Mock the individual agents
        with patch("app.services.agents.pipeline.pdf_parser") as mock_parser, \
             patch("app.services.agents.pipeline.report_classifier") as mock_classifier, \
             patch("app.services.agents.pipeline.data_extractor") as mock_extractor, \
             patch("app.services.agents.pipeline.abnormality_detector") as mock_detector, \
             patch("app.services.agents.pipeline.insight_generator") as mock_insight, \
             patch("app.services.agents.pipeline.explanation_generator") as mock_explanation, \
             patch("app.services.agents.pipeline.summary_generator") as mock_summary:
            
            # Setup mock returns
            mock_parser.process = AsyncMock(return_value={
                "agent": "pdf_parser", "success": True,
                "data": {"text": "WBC 11.3 x10^9/L Reference: 4.0 - 10.0"},
                "error": None
            })
            
            mock_classifier.process = AsyncMock(return_value={
                "agent": "report_classifier", "success": True,
                "data": {"report_type": "CBC"},
                "error": None
            })
            
            mock_extractor.process = AsyncMock(return_value={
                "agent": "data_extractor", "success": True,
                "data": {"markers": [
                    {"name": "WBC", "value": 11.3, "unit": "x10^9/L",
                     "reference_min": 4.0, "reference_max": 10.0}
                ]},
                "error": None
            })
            
            mock_detector.process = AsyncMock(return_value={
                "agent": "abnormality_detector", "success": True,
                "data": {"markers": [
                    {"name": "WBC", "value": 11.3, "unit": "x10^9/L",
                     "reference_min": 4.0, "reference_max": 10.0, "status": "high"}
                ]},
                "error": None
            })
            
            mock_insight.process = AsyncMock(return_value={
                "agent": "insight_generator", "success": True,
                "data": {"insights": ["Elevated WBC may indicate infection."]},
                "error": None
            })
            
            mock_explanation.process = AsyncMock(return_value={
                "agent": "explanation_generator", "success": True,
                "data": {"detailed_analysis": "Your WBC count is elevated at 11.3..."},
                "error": None
            })
            
            mock_summary.process = AsyncMock(return_value={
                "agent": "summary_generator", "success": True,
                "data": {"summary": "Slightly elevated WBC detected."},
                "error": None
            })
            
            # Import and run pipeline
            from app.services.agents.pipeline import AgentPipeline
            pipeline = AgentPipeline()
            result = await pipeline.run(file_path=str(pdf_file))
            
            # Verify result
            assert result["success"] is True
            assert result["report_type"] == "CBC"
            assert len(result["markers"]) == 1
            assert result["markers"][0]["status"] == "high"
            assert len(result["insights"]) == 1
            assert "elevated" in result["detailed_analysis"].lower()
            assert result["summary"] == "Slightly elevated WBC detected."
            
            # Verify all agents were called
            mock_parser.process.assert_called_once()
            mock_classifier.process.assert_called_once()
            mock_extractor.process.assert_called_once()
            mock_detector.process.assert_called_once()
            mock_insight.process.assert_called_once()
            mock_explanation.process.assert_called_once()
            mock_summary.process.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_pipeline_fails_on_pdf_parse_error(self, tmp_path):
        """Pipeline should fail gracefully if PDF parsing fails."""
        with patch("app.services.agents.pipeline.pdf_parser") as mock_parser:
            mock_parser.process = AsyncMock(return_value={
                "agent": "pdf_parser", "success": False,
                "data": {}, "error": "Could not extract text"
            })
            
            from app.services.agents.pipeline import AgentPipeline
            pipeline = AgentPipeline()
            result = await pipeline.run(file_path="nonexistent.pdf")
            
            assert result["success"] is False
            assert "PDF parsing failed" in result["error"]
    
    @pytest.mark.asyncio
    async def test_pipeline_fails_on_extraction_error(self, tmp_path):
        """Pipeline should fail if data extraction fails."""
        with patch("app.services.agents.pipeline.pdf_parser") as mock_parser, \
             patch("app.services.agents.pipeline.report_classifier") as mock_classifier, \
             patch("app.services.agents.pipeline.data_extractor") as mock_extractor:
            
            mock_parser.process = AsyncMock(return_value={
                "agent": "pdf_parser", "success": True,
                "data": {"text": "some text"}, "error": None
            })
            mock_classifier.process = AsyncMock(return_value={
                "agent": "report_classifier", "success": True,
                "data": {"report_type": "CBC"}, "error": None
            })
            mock_extractor.process = AsyncMock(return_value={
                "agent": "data_extractor", "success": False,
                "data": {}, "error": "LLM call failed"
            })
            
            from app.services.agents.pipeline import AgentPipeline
            pipeline = AgentPipeline()
            result = await pipeline.run(file_path="test.pdf")
            
            assert result["success"] is False
            assert "Data extraction failed" in result["error"]
