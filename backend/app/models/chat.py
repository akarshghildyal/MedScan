"""
Chat History Model for MongoDB

Stores chatbot Q&A interactions linked to specific reports.
"""

from typing import Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field
from datetime import datetime


class ChatHistory(Document):
    """Chat interaction document stored in MongoDB."""
    user_id: Indexed(str)
    report_id: Indexed(str)
    question: str
    answer: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_history"


class ChatQuery(BaseModel):
    """Schema for chat query request."""
    report_id: str
    question: str


class ChatResponse(BaseModel):
    """Schema for chat query response."""
    answer: str
