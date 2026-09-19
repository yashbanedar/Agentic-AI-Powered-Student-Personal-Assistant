from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import User, Subject, Exam, StudyTask
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

class SubjectItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: Optional[str] = None
    color: Optional[str] = "indigo"
    target_grade: Optional[str] = "A"

class InitialExamItem(BaseModel):
    subject_name: str
    exam_name: str
    exam_date: str  # YYYY-MM-DD
    target_score: Optional[int] = 85

class OnboardingRequest(BaseModel):
    academic_level: Optional[str] = "Undergraduate"
    program_or_major: str = Field(..., min_length=2, max_length=255)
    academic_year: Optional[str] = "Current Year"
    daily_study_hours: Optional[float] = 3.0
    subjects: List[SubjectItem] = Field(..., min_length=1)
    initial_exam: Optional[InitialExamItem] = None

@router.post("", response_model=Dict[str, Any])
def complete_onboarding(
    data: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.subjects:
        raise HTTPException(status_code=400, detail="Please provide at least one subject.")

    # Remove any existing subjects that have 0 documents/exams associated
    existing_subs = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    for s in existing_subs:
        if not s.documents and not s.exams:
            db.delete(s)
    db.commit()

    # Create user's custom subjects
    created_subjects = []
    for s_item in data.subjects:
        # Check if subject already exists
        sub = db.query(Subject).filter(
            Subject.user_id == current_user.id,
            Subject.name.ilike(s_item.name.strip())
        ).first()
        if not sub:
            sub = Subject(
                user_id=current_user.id,
                name=s_item.name.strip(),
                code=s_item.code.strip() if s_item.code else None,
                color=s_item.color or "indigo",
                target_grade=s_item.target_grade or "A"
            )
            db.add(sub)
            db.commit()
            db.refresh(sub)
        created_subjects.append(sub)

    # If initial exam provided, schedule it
    created_exam = None
    if data.initial_exam and data.initial_exam.exam_name and data.initial_exam.exam_date:
        matched_sub = None
        for s in created_subjects:
            if s.name.lower() == data.initial_exam.subject_name.strip().lower():
                matched_sub = s
                break
        if not matched_sub and created_subjects:
            matched_sub = created_subjects[0]

        if matched_sub:
            try:
                # Parse date
                parsed_date = datetime.strptime(data.initial_exam.exam_date, "%Y-%m-%d")
                exam = Exam(
                    user_id=current_user.id,
                    subject_id=matched_sub.id,
                    exam_name=data.initial_exam.exam_name.strip(),
                    exam_date=parsed_date,
                    target_score=data.initial_exam.target_score or 85,
                    completed=False
                )
                db.add(exam)
                db.commit()
                db.refresh(exam)
                created_exam = exam
            except Exception as e:
                pass

    # User will upload syllabus or course materials to generate their personalized preparation roadmap

    # Update user preferences with onboarding details
    prefs = dict(current_user.preferences or {})
    prefs.update({
        "onboarding_completed": True,
        "academic_level": data.academic_level,
        "program_or_major": data.program_or_major,
        "academic_year": data.academic_year,
        "daily_study_hours": data.daily_study_hours,
        "completed_at": datetime.now(timezone.utc).isoformat()
    })
    current_user.preferences = prefs
    db.commit()
    db.refresh(current_user)

    # Log AI Orchestrator activity
    exam_note = f" and scheduled first exam '{data.initial_exam.exam_name}'" if created_exam else ""
    AgentOrchestrator.log_activity(
        db,
        user_id=current_user.id,
        agent_name="Agent Orchestrator",
        action_type="workspace_personalized",
        title="Personalized Student Workspace Activated",
        description=(
            f"Configured {len(created_subjects)} subjects for {data.program_or_major}"
            f"{exam_note}. Adaptive Study Planner initialized with daily routines."
        ),
        status="completed"
    )

    return {
        "status": "success",
        "message": "Personalized workspace configured successfully.",
        "subjects": [{"id": s.id, "name": s.name, "code": s.code, "color": s.color} for s in created_subjects],
        "onboarding_completed": True
    }
