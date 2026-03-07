"""
Agent 1: PDF Parser

Extracts raw text from uploaded PDF reports using pdfplumber.
No LLM call — pure text extraction.
"""

import pdfplumber
from typing import Dict, Any
from pathlib import Path
import logging


logger = logging.getLogger(__name__)


class PDFParser:
    """
    Extracts readable text from PDF pathology reports.
    
    Input: {"file_path": str}
    Output: {"success": bool, "data": {"text": str}, "error": str|None}
    """
    
    name = "pdf_parser"
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from a PDF file using pdfplumber."""
        try:
            file_path = input_data.get("file_path", "")
            path = Path(file_path)
            
            if not path.exists():
                return {"agent": self.name, "success": False, "data": {}, "error": f"File not found: {file_path}"}
            
            if not path.suffix.lower() == ".pdf":
                return {"agent": self.name, "success": False, "data": {}, "error": f"Not a PDF file: {file_path}"}
            
            text_parts = []
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            
            full_text = "\n".join(text_parts)
            
            if not full_text or len(full_text.strip()) < 20:
                return {
                    "agent": self.name,
                    "success": False,
                    "data": {},
                    "error": "Could not extract sufficient text from PDF. It may be a scanned/image-based PDF."
                }
            
            logger.info(f"PDF Parser: Extracted {len(full_text)} characters from {path.name}")
            
            return {
                "agent": self.name,
                "success": True,
                "data": {"text": full_text},
                "error": None
            }
            
        except Exception as e:
            logger.error(f"PDF Parser failed: {str(e)}")
            return {"agent": self.name, "success": False, "data": {}, "error": str(e)}


# Singleton
pdf_parser = PDFParser()
