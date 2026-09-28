from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Document, DocumentChunk, User, Subject
from app.schemas.pydantic_schemas import ChatQuery, ChatResponse
from app.api.deps import get_current_user
from app.agents.tutor_agent import TutorAgent
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/tutor", tags=["tutor"])

@router.post("/chat", response_model=ChatResponse)
def ask_tutor(data: ChatQuery, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = data.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    # Gather chunks
    chunks_query = db.query(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id).filter(Document.user_id == current_user.id)
    if data.subject_id:
        chunks_query = chunks_query.filter(Document.subject_id == data.subject_id)
        
    results = chunks_query.all()
    chunk_list = []
    for chunk, doc in results:
        chunk_list.append({
            "content": chunk.content,
            "chunk_index": chunk.chunk_index,
            "metadata_json": chunk.metadata_json,
            "document_name": doc.filename,
            "category": doc.category
        })
        
    # Determine language & student level from query or user preferences
    user_prefs = current_user.preferences or {}
    req_lang = data.language or user_prefs.get("language") or "en"
    req_level = data.student_level or user_prefs.get("academic_level") or "Undergraduate"

    response = TutorAgent.answer_doubt(
        query=query,
        chunks=chunk_list,
        gemini_api_key=current_user.gemini_api_key or "",
        openai_api_key=current_user.openai_api_key or "",
        chat_history=data.chat_history or [],
        language=req_lang,
        student_level=req_level
    )
    
    # Log to AI activity stream
    AgentOrchestrator.log_activity(
        db=db,
        user_id=current_user.id,
        agent_name="Tutor Agent",
        action_type="doubt_solved",
        title=f"Doubt answered: \"{query[:45]}...\"",
        description=f"Generated grounded answer with {len(response.get('citations', []))} citations from uploaded materials."
    )
    
    return response
