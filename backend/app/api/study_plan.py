from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import StudyTask, Subject, User
from app.schemas.pydantic_schemas import StudyTaskCreate, StudyTaskResponse
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/study-plan", tags=["study-plan"])

@router.get("/today")
def get_today_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    tasks = db.query(StudyTask).filter(
        StudyTask.user_id == current_user.id,
        StudyTask.date == today_str
    ).all()
    
    res = []
    for t in tasks:
        sub = db.query(Subject).filter(Subject.id == t.subject_id).first()
        res.append({
            "id": t.id,
            "subject_id": t.subject_id,
            "subject_name": sub.name if sub else "Subject",
            "subject_color": sub.color if sub else "indigo",
            "title": t.title,
            "date": t.date,
            "time_slot": t.time_slot,
            "duration_minutes": t.duration_minutes,
            "completed": t.completed,
            "topic_name": t.topic_name,
            "priority": t.priority
        })
    return res

@router.get("/roadmap")
def get_full_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).order_by(StudyTask.date.asc(), StudyTask.time_slot.asc()).all()

    res = []
    for t in tasks:
        sub = db.query(Subject).filter(Subject.id == t.subject_id).first()
        res.append({
            "id": t.id,
            "subject_id": t.subject_id,
            "subject_name": sub.name if sub else "Subject",
            "subject_color": sub.color if sub else "indigo",
            "title": t.title,
            "date": t.date,
            "time_slot": t.time_slot,
            "duration_minutes": t.duration_minutes,
            "completed": t.completed,
            "topic_name": t.topic_name,
            "priority": t.priority
        })
    return res

@router.post("/task/{task_id}/toggle")
def toggle_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = not task.completed
    db.commit()
    return {"id": task.id, "completed": task.completed}

@router.post("/replan")
def trigger_adaptive_replan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_tasks = AgentOrchestrator.generate_adaptive_plan(db, current_user.id)
    return {"message": "Study plan successfully re-optimized adaptively", "total_tasks": len(new_tasks)}
