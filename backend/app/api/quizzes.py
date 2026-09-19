from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import Quiz, QuizQuestion, QuizAttempt, Subject, User
from app.schemas.pydantic_schemas import QuizCreate, QuizResponse, QuizSubmit
from app.api.deps import get_current_user
from app.agents.quiz_agent import QuizAgent
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.get("/")
def list_quizzes(subject_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Quiz).filter(Quiz.user_id == current_user.id)
    if subject_id:
        query = query.filter(Quiz.subject_id == subject_id)
    quizzes = query.order_by(Quiz.created_at.desc()).all()
    
    res = []
    for q in quizzes:
        sub = db.query(Subject).filter(Subject.id == q.subject_id).first()
        res.append({
            "id": q.id,
            "subject_id": q.subject_id,
            "subject_name": sub.name if sub else "Subject",
            "subject_color": sub.color if sub else "indigo",
            "title": q.title,
            "quiz_type": q.quiz_type,
            "topic_name": q.topic_name,
            "total_questions": q.total_questions,
            "time_limit_minutes": q.time_limit_minutes,
            "created_at": q.created_at
        })
    return res

@router.post("/generate")
def create_quiz(data: QuizCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.database_models import Document, DocumentChunk, Syllabus, SyllabusUnit, SyllabusTopic
    
    sub = db.query(Subject).filter(Subject.id == data.subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    sub_name = sub.name
    
    # Retrieve user's actual document chunks for this subject
    chunks = db.query(DocumentChunk).join(Document).filter(
        Document.user_id == current_user.id,
        Document.subject_id == data.subject_id
    ).all()
    
    syllabus = db.query(Syllabus).filter(
        Syllabus.user_id == current_user.id,
        Syllabus.subject_id == data.subject_id
    ).first()
    
    # Strictly require that study materials or syllabus exist before creating quiz
    if not chunks and not syllabus:
        raise HTTPException(
            status_code=400, 
            detail=f"No study materials or syllabus found for {sub_name}. Please upload course materials or provide your syllabus first so the Quiz Agent can generate questions based on your curriculum."
        )
        
    syllabus_topics = []
    if syllabus and syllabus.units:
        for u in syllabus.units:
            for t in u.topics:
                syllabus_topics.append(t.title)
                
    chunk_dicts = [{"content": c.content, "metadata_json": c.metadata_json} for c in chunks if c.content]
    
    target_topic = data.topic_name or (syllabus_topics[0] if syllabus_topics else f"{sub_name} Core Concepts")
    quiz_title = data.title or f"{sub_name}: {target_topic} Practice Test"
    
    quiz = Quiz(
        user_id=current_user.id,
        subject_id=data.subject_id,
        title=quiz_title,
        quiz_type=data.quiz_type,
        topic_name=target_topic,
        total_questions=data.total_questions,
        time_limit_minutes=data.time_limit_minutes
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    
    # Generate questions via QuizAgent grounded in actual chunks
    questions_data = QuizAgent.generate_quiz(
        subject_name=sub_name,
        topic_name=target_topic,
        quiz_type=data.quiz_type,
        num_questions=data.total_questions,
        chunks=chunk_dicts,
        syllabus_topics=syllabus_topics
    )
    
    saved_questions = []
    for q in questions_data:
        q_obj = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            options_json=q["options"],
            correct_option_index=q["correct_option_index"],
            explanation=q["explanation"],
            topic_name=q["topic_name"]
        )
        db.add(q_obj)
        saved_questions.append(q_obj)
    db.commit()
    
    AgentOrchestrator.log_activity(
        db=db,
        user_id=current_user.id,
        agent_name="Quiz Agent",
        action_type="quiz_generated",
        title=f"Quiz generated: {quiz.title}",
        description=f"Formulated {len(saved_questions)} practice questions targeting {data.topic_name or sub_name}."
    )
    
    return {
        "id": quiz.id,
        "subject_id": quiz.subject_id,
        "subject_name": sub_name,
        "title": quiz.title,
        "quiz_type": quiz.quiz_type,
        "topic_name": quiz.topic_name,
        "total_questions": len(saved_questions),
        "time_limit_minutes": quiz.time_limit_minutes,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options_json,
                "topic_name": q.topic_name
            }
            for q in saved_questions
        ]
    }

@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    sub = db.query(Subject).filter(Subject.id == quiz.subject_id).first()
    return {
        "id": quiz.id,
        "subject_id": quiz.subject_id,
        "subject_name": sub.name if sub else "Subject",
        "title": quiz.title,
        "quiz_type": quiz.quiz_type,
        "topic_name": quiz.topic_name,
        "total_questions": quiz.total_questions,
        "time_limit_minutes": quiz.time_limit_minutes,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options_json,
                "topic_name": q.topic_name
            }
            for q in quiz.questions
        ]
    }

@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: int, data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    answers = data.get("answers", {})
    # Convert keys to int if passed as str in json
    clean_answers = {str(k): int(v) for k, v in answers.items()}
    eval_result = AgentOrchestrator.evaluate_quiz_submission(
        db=db,
        user_id=current_user.id,
        quiz_id=quiz_id,
        answers=clean_answers
    )
    return eval_result

@router.get("/attempts/history")
def get_attempt_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.completed_at.desc()).all()
    res = []
    for att in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        sub = db.query(Subject).filter(Subject.id == quiz.subject_id).first() if quiz else None
        res.append({
            "id": att.id,
            "quiz_id": att.quiz_id,
            "quiz_title": quiz.title if quiz else "Quiz",
            "subject_name": sub.name if sub else "General",
            "score": att.score,
            "total": att.total,
            "percentage": att.percentage,
            "weak_topics": att.weak_topics_json or [],
            "completed_at": att.completed_at
        })
    return res
