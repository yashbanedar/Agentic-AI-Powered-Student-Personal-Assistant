from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Exam, Subject, User
from app.schemas.pydantic_schemas import ExamCreate, ExamResponse
from app.api.deps import get_current_user
from app.agents.exam_agent import ExamAgent
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/exams", tags=["exams"])

@router.get("/")
def get_exams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exams = db.query(Exam).filter(Exam.user_id == current_user.id).all()
    
    # If no exams, create 2 realistic upcoming exams so dashboard shows live countdowns immediately
    if not exams:
        subs = db.query(Subject).filter(Subject.user_id == current_user.id).all()
        if subs:
            now = datetime.now(timezone.utc)
            demo_exam1 = Exam(
                user_id=current_user.id,
                subject_id=subs[0].id,
                exam_name=f"{subs[0].name} Mid-Semester Test",
                exam_date=now + timedelta(days=5, hours=14),
                location="Main Exam Hall B",
                target_score=92.0,
                prep_urgency=82.0
            )
            db.add(demo_exam1)
            
            if len(subs) > 1:
                demo_exam2 = Exam(
                    user_id=current_user.id,
                    subject_id=subs[1].id,
                    exam_name=f"{subs[1].name} Final Exam",
                    exam_date=now + timedelta(days=12, hours=8),
                    location="Engineering Block 3",
                    target_score=88.0,
                    prep_urgency=65.0
                )
                db.add(demo_exam2)
            db.commit()
            exams = db.query(Exam).filter(Exam.user_id == current_user.id).all()
            
    results = []
    for ex in exams:
        sub = db.query(Subject).filter(Subject.id == ex.subject_id).first()
        urg = ExamAgent.calculate_urgency(ex.exam_date, ex.target_score)
        
        # Update urgency in DB
        ex.prep_urgency = urg["prep_urgency"]
        db.commit()
        
        results.append({
            "id": ex.id,
            "subject_id": ex.subject_id,
            "subject_name": sub.name if sub else ex.exam_name,
            "subject_code": sub.code if sub else "",
            "subject_color": sub.color if sub else "indigo",
            "exam_name": ex.exam_name,
            "exam_date": ex.exam_date,
            "location": ex.location,
            "target_score": ex.target_score,
            "days_left": urg["days_left"],
            "hours_left": urg["hours_left"],
            "prep_urgency": urg["prep_urgency"],
            "urgency_level": urg["urgency_level"],
            "badge_color": urg["badge_color"],
            "completed": ex.completed
        })
        
    results.sort(key=lambda x: x["days_left"])
    return results

@router.post("/")
def create_exam(data: ExamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == data.subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    urg = ExamAgent.calculate_urgency(data.exam_date, data.target_score or 90.0)
    
    exam = Exam(
        user_id=current_user.id,
        subject_id=data.subject_id,
        exam_name=data.exam_name,
        exam_date=data.exam_date,
        location=data.location,
        target_score=data.target_score or 90.0,
        prep_urgency=urg["prep_urgency"]
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    AgentOrchestrator.log_activity(
        db=db,
        user_id=current_user.id,
        agent_name="Exam Agent",
        action_type="exam_scheduled",
        title=f"Exam scheduled: {data.exam_name}",
        description=f"Calculated {urg['days_left']} days remaining with preparation urgency of {urg['prep_urgency']}%."
    )
    
    # Auto-adapt study planner
    AgentOrchestrator.generate_adaptive_plan(db, current_user.id)
    
    return exam

@router.delete("/{exam_id}")
def delete_exam(exam_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return {"message": "Exam removed"}
