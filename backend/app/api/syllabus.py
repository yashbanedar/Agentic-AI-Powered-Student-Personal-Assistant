from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Syllabus, SyllabusUnit, SyllabusTopic, Subject, User
from app.schemas.pydantic_schemas import SyllabusResponse
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/syllabus", tags=["syllabus"])

@router.get("/{subject_id}")
def get_syllabus(subject_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    syllabus = db.query(Syllabus).filter(Syllabus.subject_id == subject_id, Syllabus.user_id == current_user.id).first()
    if not syllabus:
        return {
            "id": None,
            "subject_id": subject_id,
            "title": None,
            "units": []
        }

    # Build nested response
    units = []
    for u in syllabus.units:
        topics = [
            {
                "id": t.id,
                "title": t.title,
                "estimated_hours": t.estimated_hours,
                "difficulty": t.difficulty,
                "mastery_level": t.mastery_level,
                "completed": t.completed
            }
            for t in u.topics
        ]
        units.append({
            "id": u.id,
            "unit_number": u.unit_number,
            "title": u.title,
            "description": u.description,
            "weightage_pct": u.weightage_pct,
            "topics": topics
        })
        
    return {
        "id": syllabus.id,
        "subject_id": syllabus.subject_id,
        "title": syllabus.title,
        "units": units
    }

@router.post("/{subject_id}/update")
def update_syllabus(
    subject_id: int, 
    data: dict, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    raw_text = data.get("raw_text", "")
    title = data.get("title", "Updated Course Syllabus")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Syllabus text cannot be empty")
        
    syllabus = AgentOrchestrator.process_syllabus_content(
        db=db,
        user_id=current_user.id,
        subject_id=subject_id,
        raw_text=raw_text,
        title=title
    )
    return {"message": "Syllabus processed and structured successfully", "id": syllabus.id}

@router.post("/topic/{topic_id}/toggle")
def toggle_topic_completed(topic_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(SyllabusTopic).filter(SyllabusTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic.completed = not topic.completed
    topic.mastery_level = 100.0 if topic.completed else 0.0
    db.commit()
    return {"id": topic.id, "completed": topic.completed, "mastery_level": topic.mastery_level}
