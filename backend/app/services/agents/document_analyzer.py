"""
Document Analyzer Agent

First agent in the processing pipeline. Responsibilities:
- Extract text from PDF/image files
- Validate if document is a medical document
- Identify document type (lab report, prescription, etc.)
- Extract metadata (date, lab name, etc.)
"""

import fitz  # PyMuPDF
from typing import Dict, Any, Optional
from pathlib import Path
import logging

from app.services.agents.base_agent import BaseAgent, AgentError
from app.core.config import settings


logger = logging.getLogger(__name__)


DOCUMENT_ANALYZER_SYSTEM_PROMPT = """You are a medical document analyzer. Your task is to analyze documents and determine if they are valid medical documents.

TASK:
1. Determine if this is a valid medical document (lab report, prescription, imaging report, etc.)
2. Identify the document type
3. Extract key metadata

RESPONSE FORMAT (JSON only):
{
    "is_valid": true/false,
    "document_type": "lab_report" | "prescription" | "imaging" | "discharge_summary" | "consultation" | "other" | "unknown",
    "confidence": 0.0-1.0,
    "metadata": {
        "date": "YYYY-MM-DD or null",
        "lab_name": "string or null",
        "hospital_name": "string or null", 
        "doctor_name": "string or null",
        "test_type": "string or null",
        "patient_name_in_doc": "string or null"
    },
    "rejection_reason": "string or null (only if is_valid is false)"
}

RULES:
- Only return valid JSON, no other text
- is_valid should be true for any healthcare-related document
- is_valid should be false for receipts, invoices, personal documents, etc.
- Be lenient - if it looks medical, accept it
- Extract whatever metadata you can find"""


class DocumentAnalyzer(BaseAgent):
    """
    Agent 1: Document Analyzer
    
    Parses uploaded documents and validates whether they are 
    legitimate medical documents.
    """
    
    @property
    def name(self) -> str:
        return "document_analyzer"
    
    @property
    def description(self) -> str:
        return "Parses documents and validates if they are medical documents"
    
    @property
    def system_prompt(self) -> str:
        return DOCUMENT_ANALYZER_SYSTEM_PROMPT
    
    @property
    def model(self) -> str:
        return settings.LLM_MODEL_VISION
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process an uploaded document.
        
        Args:
            input_data: {
                "file_path": str,  # Path to the uploaded file
                "file_type": str,  # pdf, jpg, png
                "file_name": str   # Original filename
            }
            
        Returns:
            {
                "agent": "document_analyzer",
                "success": bool,
                "data": {
                    "is_valid": bool,
                    "document_type": str,
                    "confidence": float,
                    "extracted_text": str,
                    "metadata": {...},
                    "rejection_reason": str or None
                },
                "error": str or None
            }
        """
        try:
            file_path = input_data.get("file_path")
            file_type = input_data.get("file_type", "").lower()
            
            if not file_path:
                return self._create_output(False, error="No file path provided")
            
            # Extract text from document
            extracted_text = await self._extract_text(file_path, file_type)
            
            if not extracted_text or len(extracted_text.strip()) < 20:
                return self._create_output(
                    success=False,
                    error="Could not extract text from document"
                )
            
            # Analyze with LLM
            analysis = await self._analyze_document(extracted_text)
            
            # Combine results
            result = {
                "is_valid": analysis.get("is_valid", False),
                "document_type": analysis.get("document_type", "unknown"),
                "confidence": analysis.get("confidence", 0.0),
                "extracted_text": extracted_text,
                "metadata": analysis.get("metadata", {}),
                "rejection_reason": analysis.get("rejection_reason")
            }
            
            return self._create_output(success=True, data=result)
            
        except Exception as e:
            logger.error(f"Document analysis failed: {str(e)}")
            return self._create_output(success=False, error=str(e))
    
    async def _extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text content from PDF or image."""
        path = Path(file_path)
        
        if not path.exists():
            raise AgentError(f"File not found: {file_path}")
        
        if file_type == "pdf":
            return self._extract_from_pdf(path)
        elif file_type in ["jpg", "jpeg", "png"]:
            # For images, we'll use the vision model directly
            return await self._extract_from_image(path)
        else:
            raise AgentError(f"Unsupported file type: {file_type}")
    
    def _extract_from_pdf(self, path: Path) -> str:
        """Extract text from PDF using PyMuPDF."""
        try:
            doc = fitz.open(str(path))
            text_parts = []
            
            for page in doc:
                text_parts.append(page.get_text())
            
            doc.close()
            return "\n".join(text_parts)
            
        except Exception as e:
            raise AgentError(f"PDF extraction failed: {str(e)}")
    
    async def _extract_from_image(self, path: Path) -> str:
        """Extract text from image using vision model."""
        try:
            with open(path, "rb") as f:
                image_data = f.read()
            
            response = await self._call_llm_with_image(
                prompt="Extract all text from this medical document image. Return only the extracted text, preserving the structure as much as possible.",
                image_data=image_data,
                temperature=0.1,
                max_tokens=4096
            )
            
            return response.get("content", "")
            
        except Exception as e:
            raise AgentError(f"Image text extraction failed: {str(e)}")
    
    async def _analyze_document(self, text: str) -> Dict[str, Any]:
        """Analyze extracted text to validate and classify document."""
        # Truncate text if too long
        max_chars = 8000
        if len(text) > max_chars:
            text = text[:max_chars] + "\n...[truncated]..."
        
        prompt = f"""Analyze the following document text and determine if it is a valid medical document.

DOCUMENT TEXT:
---
{text}
---

Respond with JSON only."""

        response = await self._call_llm(
            prompt=prompt,
            temperature=0.1,
            max_tokens=1024,
            expect_json=True
        )
        
        return response.get("parsed", {})


# Singleton instance
document_analyzer = DocumentAnalyzer()
