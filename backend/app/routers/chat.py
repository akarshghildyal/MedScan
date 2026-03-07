"""
Chat Router - Contextual Report Q&A

Handles POST /chat/query for patient questions about their reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId

from app.models.user import User
from app.models.report import Report, ReportStatus
from app.models.chat import ChatHistory, ChatQuery, ChatResponse
from app.core.security import get_current_user
from app.services.llm.llm_client import llm_client, LLMError
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


CHAT_SYSTEM_PROMPT = """You are a medical report assistant helping patients understand lab reports.

Use the provided report context to answer the user's question clearly and safely.

RULES:
- Answer based ONLY on the report data provided
- Use clear, patient-friendly language
- Do NOT provide medical diagnosis
- Do NOT recommend specific treatments
- Suggest consulting a doctor for medical advice
- If the answer is not in the report context, say so honestly
"""


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    query: ChatQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Ask a question about a specific report.
    
    Context includes report summary, detailed explanation, and marker values.
    """
    # Get the report
    try:
        report = await Report.get(PydanticObjectId(query.report_id))
    except:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if report.status != ReportStatus.ANALYZED:
        raise HTTPException(status_code=400, detail="Report has not been analyzed yet")
    
    # Build context from report
    markers_text = "\n".join([
        f"- {m.name}: {m.value} {m.unit} (Status: {m.status.value})"
        for m in report.markers
    ])
    
    context = f"""REPORT TYPE: {report.report_type}

SUMMARY: {report.summary or 'Not available'}

DETAILED ANALYSIS: {report.detailed_analysis or 'Not available'}

MARKERS:
{markers_text or 'No markers extracted'}

INSIGHTS:
{chr(10).join(['- ' + i for i in report.insights]) if report.insights else 'None'}
"""
    
    # Call LLM with context
    try:
        messages = [
            {"role": "system", "content": CHAT_SYSTEM_PROMPT},
            {"role": "user", "content": f"REPORT CONTEXT:\n{context}\n\nPATIENT QUESTION: {query.question}"}
        ]
        
        response = await llm_client.chat(
            messages=messages,
            model=settings.LLM_MODEL_FAST,
            temperature=0.4,
            max_tokens=1024
        )
        
        answer = response.get("content", "I'm sorry, I couldn't generate an answer.")
        
    except LLMError as e:
        logger.error(f"Chat LLM error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")
    
    # Store in chat history
    chat_entry = ChatHistory(
        user_id=str(current_user.id),
        report_id=query.report_id,
        question=query.question,
        answer=answer
    )
    await chat_entry.create()
    
    return ChatResponse(answer=answer)
