from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Subject, Exam, QuizAttempt, PYQAnalysis, User
from app.api.deps import get_current_user
from app.agents.exam_agent import ExamAgent
from app.agents.recommendation_agent import RecommendationAgent

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/next")
def get_next_recommendation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    exams = db.query(Exam).filter(Exam.user_id == current_user.id, Exam.completed == False).all()
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.completed_at.desc()).limit(5).all()
    pyq_analyses = db.query(PYQAnalysis).filter(PYQAnalysis.user_id == current_user.id).all()
    
    # Format subjects
    sub_dicts = [{"id": s.id, "name": s.name, "code": s.code} for s in subjects]
    
    # Format exams with days_left
    exam_dicts = []
    for ex in exams:
        urg = ExamAgent.calculate_urgency(ex.exam_date, ex.target_score)
        sub = db.query(Subject).filter(Subject.id == ex.subject_id).first()
        exam_dicts.append({
            "id": ex.id,
            "subject_id": ex.subject_id,
            "subject_name": sub.name if sub else ex.exam_name,
            "days_left": urg["days_left"],
            "urgency": urg["prep_urgency"]
        })
        
    exam_dicts.sort(key=lambda x: x["days_left"])
    
    # Collect weak topics
    weak_topics = []
    for att in attempts:
        if att.weak_topics_json:
            weak_topics.extend(att.weak_topics_json)
    weak_topics = list(dict.fromkeys(weak_topics))
    
    # Collect PYQ high-yield topics
    pyq_topics = []
    for pyq in pyq_analyses:
        hy = pyq.analysis_json.get("high_yield_topics", [])
        pyq_topics.extend(hy)
        
    from app.models.database_models import Document, Syllabus
    has_documents = db.query(Document).filter(Document.user_id == current_user.id).first() is not None
    has_syllabus = db.query(Syllabus).filter(Syllabus.user_id == current_user.id).first() is not None
    
    rec = RecommendationAgent.recommend_next_action(
        subjects=sub_dicts,
        exams=exam_dicts,
        weak_topics=weak_topics,
        pyq_topics=pyq_topics,
        has_documents=has_documents,
        has_syllabus=has_syllabus
    )
    return rec
