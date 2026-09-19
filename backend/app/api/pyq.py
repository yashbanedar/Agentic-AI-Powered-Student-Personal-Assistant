from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import PYQAnalysis, Subject, User
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/pyq", tags=["pyq"])

@router.get("/")
def get_pyq_analyses(
    subject_id: Optional[int] = None, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    query = db.query(PYQAnalysis).filter(PYQAnalysis.user_id == current_user.id)
    if subject_id:
        query = query.filter(PYQAnalysis.subject_id == subject_id)
    results = query.order_by(PYQAnalysis.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "subject_id": r.subject_id,
            "exam_name": r.exam_name,
            "year": r.year,
            "analysis": r.analysis_json,
            "created_at": r.created_at
        }
        for r in results
    ]

@router.post("/analyze")
def analyze_pyq_text(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject_id = data.get("subject_id")
    text = data.get("text", "")
    exam_name = data.get("exam_name", "Semester Examination PYQ")
    
    if not subject_id or not text.strip():
        raise HTTPException(status_code=400, detail="Subject ID and question paper text are required")
        
    pyq = AgentOrchestrator.process_pyq_content(
        db=db,
        user_id=current_user.id,
        subject_id=subject_id,
        text=text,
        exam_name=exam_name
    )
    return {
        "id": pyq.id,
        "exam_name": pyq.exam_name,
        "analysis": pyq.analysis_json
    }
