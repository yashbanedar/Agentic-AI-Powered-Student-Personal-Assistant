from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import QuizAttempt, Quiz, Subject, SyllabusTopic, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.completed_at.asc()).all()
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    
    is_demo = current_user.email.lower() == "student@university.edu"
    total_tests = len(attempts)
    
    if total_tests > 0:
        avg_score = round(sum(a.percentage for a in attempts) / total_tests, 1)
        
        # Extract weak topics from real attempts
        all_weak = []
        for a in attempts:
            if a.weak_topics_json:
                all_weak.extend(a.weak_topics_json)
                
        weak_counts = {}
        for w in all_weak:
            weak_counts[w] = weak_counts.get(w, 0) + 1
            
        weak_topic_items = []
        for topic, cnt in sorted(weak_counts.items(), key=lambda x: x[1], reverse=True)[:6]:
            weak_topic_items.append({
                "topic": topic,
                "failed_attempts": cnt,
                "accuracy": max(25, 60 - cnt * 10),
                "priority": "HIGH" if cnt > 1 else "MEDIUM",
                "action": "Needs Drill"
            })
            
        trend_data = []
        for idx, a in enumerate(attempts[-7:], start=1):
            trend_data.append({
                "test_num": f"Test #{idx}",
                "score": a.percentage,
                "date": a.completed_at.strftime("%b %d")
            })
            
        mastery_breakdown = [
            {"name": "Mastered (>80%)", "value": sum(1 for a in attempts if a.percentage >= 80), "color": "#10b981"},
            {"name": "Proficient (60-80%)", "value": sum(1 for a in attempts if 60 <= a.percentage < 80), "color": "#3b82f6"},
            {"name": "Needs Revision (<60%)", "value": sum(1 for a in attempts if a.percentage < 60), "color": "#ef4444"}
        ]
        
        return {
            "overall_accuracy": avg_score,
            "total_quizzes_completed": total_tests,
            "study_streak_days": 1,
            "hours_studied_this_week": round(total_tests * 0.5, 1),
            "weak_topics": weak_topic_items,
            "score_trend": trend_data,
            "mastery_breakdown": mastery_breakdown
        }
        
    elif is_demo:
        # Preconfigured illustrative data for demo student evaluation
        return {
            "overall_accuracy": 72.5,
            "total_quizzes_completed": 4,
            "study_streak_days": 5,
            "hours_studied_this_week": 14.5,
            "weak_topics": [
                {"topic": "Subnet Masking & CIDR Notation", "failed_attempts": 2, "accuracy": 40.0, "priority": "HIGH", "action": "Practice MCQs"},
                {"topic": "B-Tree Index Balancing", "failed_attempts": 1, "accuracy": 50.0, "priority": "MEDIUM", "action": "Review Notes"},
                {"topic": "Semaphore Concurrency Primitives", "failed_attempts": 1, "accuracy": 55.0, "priority": "MEDIUM", "action": "Solve PYQ"}
            ],
            "score_trend": [
                {"test_num": "Diagnostic", "score": 60, "date": "Sep 12"},
                {"test_num": "Quiz 1", "score": 68, "date": "Sep 14"},
                {"test_num": "Quiz 2", "score": 75, "date": "Sep 16"},
                {"test_num": "Mock 1", "score": 82, "date": "Sep 18"}
            ],
            "mastery_breakdown": [
                {"name": "Mastered (>80%)", "value": 14, "color": "#10b981"},
                {"name": "Proficient (60-80%)", "value": 8, "color": "#3b82f6"},
                {"name": "Needs Revision (<60%)", "value": 3, "color": "#ef4444"}
            ]
        }
    else:
        # Honest zero-state for new real students
        return {
            "overall_accuracy": 0,
            "total_quizzes_completed": 0,
            "study_streak_days": 1,
            "hours_studied_this_week": 0.0,
            "weak_topics": [],
            "score_trend": [],
            "mastery_breakdown": []
        }

