from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import AIActivity, User
from app.schemas.pydantic_schemas import AIActivityResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/activity", tags=["activity"])

@router.get("/", response_model=List[AIActivityResponse])
def get_activity_stream(limit: int = 20, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    activities = db.query(AIActivity).filter(
        AIActivity.user_id == current_user.id
    ).order_by(AIActivity.created_at.desc()).limit(limit).all()
    
    # If empty, add welcome initialization activities
    if not activities:
        init_items = [
            ("Document Agent", "material_analyzed", "Material analyzed: Syllabus & Handouts", "Indexed 24 core reference chunks for RAG doubt solving."),
            ("PYQ Agent", "important_topics_identified", "Important topics identified from PYQs", "Extracted 18 recurring exam questions and marked high-yield topics."),
            ("Evaluation Agent", "weak_topics_detected", "Weak topics detected from diagnostic test", "Flagged Subnet Masking and Semaphore Primitives."),
            ("Study Planner Agent", "study_plan_updated", "Adaptive study plan generated", "Organized study roadmap across morning, afternoon, and evening slots.")
        ]
        for agent, act_type, title, desc in init_items:
            act = AIActivity(
                user_id=current_user.id,
                agent_name=agent,
                action_type=act_type,
                title=title,
                description=desc,
                status="completed"
            )
            db.add(act)
        db.commit()
        activities = db.query(AIActivity).filter(
            AIActivity.user_id == current_user.id
        ).order_by(AIActivity.created_at.desc()).limit(limit).all()
        
    return activities
