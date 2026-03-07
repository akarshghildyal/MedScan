"""
Unit Tests for Abnormality Detection Agent

Tests the deterministic logic:
    value > reference_max → "high"
    value < reference_min → "low"
    otherwise → "normal"
    missing ranges → "normal" (safe default)
"""

import pytest
import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.agents.abnormality_detector import AbnormalityDetector


class TestDetectStatus:
    """Tests for the _detect_status static method."""
    
    def setup_method(self):
        self.detector = AbnormalityDetector()
    
    def test_normal_value_within_range(self):
        """Value within reference range → normal."""
        status = self.detector._detect_status(value=7.0, reference_min=4.0, reference_max=10.0)
        assert status == "normal"
    
    def test_high_value_above_max(self):
        """Value above reference_max → high."""
        status = self.detector._detect_status(value=11.3, reference_min=4.0, reference_max=10.0)
        assert status == "high"
    
    def test_low_value_below_min(self):
        """Value below reference_min → low."""
        status = self.detector._detect_status(value=3.5, reference_min=4.0, reference_max=10.0)
        assert status == "low"
    
    def test_value_at_exact_max_is_normal(self):
        """Value exactly at reference_max → normal (not high)."""
        status = self.detector._detect_status(value=10.0, reference_min=4.0, reference_max=10.0)
        assert status == "normal"
    
    def test_value_at_exact_min_is_normal(self):
        """Value exactly at reference_min → normal (not low)."""
        status = self.detector._detect_status(value=4.0, reference_min=4.0, reference_max=10.0)
        assert status == "normal"
    
    def test_missing_reference_range_defaults_normal(self):
        """No reference range → normal (safe default)."""
        status = self.detector._detect_status(value=100.0, reference_min=None, reference_max=None)
        assert status == "normal"
    
    def test_missing_reference_max_only(self):
        """Only reference_min set, value below → low."""
        status = self.detector._detect_status(value=2.0, reference_min=4.0, reference_max=None)
        assert status == "low"
    
    def test_missing_reference_min_only(self):
        """Only reference_max set, value above → high."""
        status = self.detector._detect_status(value=250.0, reference_min=None, reference_max=200.0)
        assert status == "high"
    
    def test_none_value_defaults_normal(self):
        """None value → normal."""
        status = self.detector._detect_status(value=None, reference_min=4.0, reference_max=10.0)
        assert status == "normal"
    
    def test_string_value_defaults_normal(self):
        """Non-numeric value → normal."""
        status = self.detector._detect_status(value="Positive", reference_min=0, reference_max=1)
        assert status == "normal"


class TestProcessMethod:
    """Tests for the full process method."""
    
    def setup_method(self):
        self.detector = AbnormalityDetector()
    
    @pytest.mark.asyncio
    async def test_process_with_mixed_markers(self):
        """Process a mix of normal, high, and low markers."""
        input_data = {
            "markers": [
                {"name": "WBC", "value": 11.3, "unit": "x10^9/L", "reference_min": 4.0, "reference_max": 10.0},
                {"name": "Hemoglobin", "value": 14.5, "unit": "g/dL", "reference_min": 13.0, "reference_max": 17.0},
                {"name": "Platelets", "value": 120, "unit": "x10^9/L", "reference_min": 150, "reference_max": 400},
            ]
        }
        
        result = await self.detector.process(input_data)
        
        assert result["success"] is True
        markers = result["data"]["markers"]
        assert len(markers) == 3
        assert markers[0]["status"] == "high"       # WBC 11.3 > 10.0
        assert markers[1]["status"] == "normal"      # Hemoglobin 14.5 in range
        assert markers[2]["status"] == "low"          # Platelets 120 < 150
    
    @pytest.mark.asyncio
    async def test_process_with_empty_markers(self):
        """Process empty markers list."""
        result = await self.detector.process({"markers": []})
        
        assert result["success"] is True
        assert result["data"]["markers"] == []
    
    @pytest.mark.asyncio
    async def test_process_preserves_original_data(self):
        """Process should keep all original marker fields."""
        input_data = {
            "markers": [
                {"name": "WBC", "value": 7.0, "unit": "x10^9/L", "reference_min": 4.0, "reference_max": 10.0},
            ]
        }
        
        result = await self.detector.process(input_data)
        marker = result["data"]["markers"][0]
        
        assert marker["name"] == "WBC"
        assert marker["value"] == 7.0
        assert marker["unit"] == "x10^9/L"
        assert marker["reference_min"] == 4.0
        assert marker["reference_max"] == 10.0
        assert marker["status"] == "normal"
