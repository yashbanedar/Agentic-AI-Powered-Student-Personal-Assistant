import os
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.database_models import AIActivity, Document, DocumentChunk, Syllabus, SyllabusUnit, SyllabusTopic, PYQAnalysis, Exam, StudyTask, Quiz, QuizQuestion, QuizAttempt, AINote
from app.agents.document_agent import DocumentAgent
from app.agents.syllabus_agent import SyllabusAgent
from app.agents.pyq_agent import PYQAgent
from app.agents.exam_agent import ExamAgent
from app.agents.planner_agent import StudyPlannerAgent
from app.agents.tutor_agent import TutorAgent
from app.agents.quiz_agent import QuizAgent
from app.agents.evaluation_agent import EvaluationAgent
from app.agents.recommendation_agent import RecommendationAgent

class AgentOrchestrator:
    """
    Agent Orchestrator: Coordinates the 10-Agent Multi-Agent Ecosystem.
    Maintains workflow execution, triggers downstream agents, and writes to the AI Activity Stream.
    """
    
    @staticmethod
    def log_activity(
        db: Session, 
        user_id: int, 
        agent_name: str, 
        action_type: str, 
        title: str, 
        description: str = "", 
        status: str = "completed"
    ) -> AIActivity:
        activity = AIActivity(
            user_id=user_id,
            agent_name=agent_name,
            action_type=action_type,
            title=title,
            description=description,
            status=status
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @classmethod
    def process_uploaded_document(
        cls, 
        db: Session, 
        user_id: int, 
        subject_id: Optional[int], 
        file_path: str, 
        filename: str, 
        file_type: str, 
        category: str = "study_material"
    ) -> Document:
        # 1. Trigger Document Agent
        extract_res = DocumentAgent.extract_text(file_path, file_type)
        extracted_text = extract_res["extracted_text"]
        chunk_objects = extract_res["chunks"]
        
        doc = Document(
            user_id=user_id,
            subject_id=subject_id,
            filename=filename,
            file_type=file_type,
            file_path=file_path,
            file_size=os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            category=category,
            extracted_text=extracted_text,
            chunk_count=len(chunk_objects),
            status="processed"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        # Save chunks
        for ch in chunk_objects:
            chunk_entry = DocumentChunk(
                document_id=doc.id,
                chunk_index=ch["chunk_index"],
                content=ch["content"],
                metadata_json=ch["metadata_json"]
            )
            db.add(chunk_entry)
        db.commit()
        
        cls.log_activity(
            db, user_id, 
            agent_name="Document Agent", 
            action_type="material_analyzed",
            title=f"Material analyzed: {filename}",
            description=f"Extracted {len(extracted_text.split())} words and indexed {len(chunk_objects)} semantic chunks for RAG doubt solving."
        )
        
        # 2. If uploaded as Syllabus, trigger Syllabus Agent
        if category == "syllabus" and subject_id:
            cls.process_syllabus_content(db, user_id, subject_id, extracted_text, f"Syllabus from {filename}")
            
        # 3. If uploaded as PYQ, trigger PYQ Agent
        if category == "pyq" and subject_id:
            cls.process_pyq_content(db, user_id, subject_id, extracted_text, filename)
            
        return doc

    @classmethod
    def process_syllabus_content(
        cls, 
        db: Session, 
        user_id: int, 
        subject_id: int, 
        raw_text: str, 
        title: str = "Course Syllabus"
    ) -> Syllabus:
        # Delete existing syllabus for subject if any
        existing = db.query(Syllabus).filter(Syllabus.subject_id == subject_id, Syllabus.user_id == user_id).first()
        if existing:
            db.delete(existing)
            db.commit()
            
        units_data = SyllabusAgent.parse_syllabus(raw_text)
        
        syllabus = Syllabus(
            user_id=user_id,
            subject_id=subject_id,
            title=title,
            raw_text=raw_text
        )
        db.add(syllabus)
        db.commit()
        db.refresh(syllabus)
        
        total_topics = 0
        for u in units_data:
            unit_record = SyllabusUnit(
                syllabus_id=syllabus.id,
                unit_number=u["unit_number"],
                title=u["title"],
                description=u.get("description", ""),
                weightage_pct=u.get("weightage_pct", 20.0)
            )
            db.add(unit_record)
            db.commit()
            db.refresh(unit_record)
            
            for t in u.get("topics", []):
                total_topics += 1
                topic_record = SyllabusTopic(
                    unit_id=unit_record.id,
                    title=t["title"],
                    estimated_hours=t.get("estimated_hours", 2.0),
                    difficulty=t.get("difficulty", "Medium"),
                    mastery_level=t.get("mastery_level", 0.0),
                    completed=False
                )
                db.add(topic_record)
        db.commit()
        
        cls.log_activity(
            db, user_id,
            agent_name="Syllabus Agent",
            action_type="syllabus_structured",
            title=f"Syllabus structured: {title}",
            description=f"Identified {len(units_data)} units and {total_topics} core topics with estimated completion hours."
        )
        
        try:
            cls.generate_adaptive_plan(db, user_id)
        except Exception:
            pass
            
        return syllabus

    @classmethod
    def process_pyq_content(
        cls, 
        db: Session, 
        user_id: int, 
        subject_id: int, 
        text: str, 
        exam_name: str
    ) -> PYQAnalysis:
        analysis_data = PYQAgent.analyze_pyq(text)
        
        pyq_entry = PYQAnalysis(
            user_id=user_id,
            subject_id=subject_id,
            exam_name=exam_name,
            year="Recent 5 Years",
            analysis_json=analysis_data
        )
        db.add(pyq_entry)
        db.commit()
        db.refresh(pyq_entry)
        
        high_yield_count = len([t for t in analysis_data.get("high_yield_topics", []) if t.get("must_know")])
        cls.log_activity(
            db, user_id,
            agent_name="PYQ Agent",
            action_type="important_topics_identified",
            title="Important topics identified from PYQs",
            description=f"Extracted {analysis_data.get('total_questions_extracted', 0)} questions and flagged {high_yield_count} high-priority topics."
        )
        
        return pyq_entry

    @classmethod
    def generate_adaptive_plan(cls, db: Session, user_id: int, days_ahead: int = 7) -> List[StudyTask]:
        # Collect subjects and real syllabus topics
        from app.models.database_models import Subject, Syllabus, SyllabusUnit, SyllabusTopic, Document
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        exams = db.query(Exam).filter(Exam.user_id == user_id, Exam.completed == False).all()
        syllabi = db.query(Syllabus).filter(Syllabus.user_id == user_id).all()
        
        subject_topics = {}
        for syl in syllabi:
            topics = []
            for u in syl.units:
                for t in u.topics:
                    topics.append(t.title)
            if topics:
                subject_topics[syl.subject_id] = topics
        
        # Collect detected weak topics from recent attempts
        recent_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).order_by(QuizAttempt.completed_at.desc()).limit(5).all()
        weak_topics = []
        for att in recent_attempts:
            if att.weak_topics_json:
                weak_topics.extend(att.weak_topics_json)
        weak_topics = list(dict.fromkeys(weak_topics)) # deduplicate
        
        sub_dicts = [{"id": s.id, "name": s.name, "code": s.code} for s in subjects]
        exam_dicts = []
        for ex in exams:
            urg = ExamAgent.calculate_urgency(ex.exam_date, ex.target_score)
            exam_dicts.append({
                "id": ex.id,
                "subject_id": ex.subject_id,
                "subject_name": ex.exam_name,
                "days_left": urg["days_left"]
            })
            
        plan_tasks = StudyPlannerAgent.generate_plan(
            subjects=sub_dicts, 
            exams=exam_dicts, 
            weak_topics=weak_topics, 
            days_ahead=days_ahead,
            subject_topics=subject_topics
        )
        
        # If no tasks (e.g. no syllabus or materials provided yet), return empty list
        if not plan_tasks:
            return []
            
        # Clear future tasks and replace with newly adapted plan
        db.query(StudyTask).filter(StudyTask.user_id == user_id, StudyTask.completed == False).delete()
        db.commit()
        
        saved_tasks = []
        for t in plan_tasks:
            task_obj = StudyTask(
                user_id=user_id,
                subject_id=t["subject_id"],
                title=t["title"],
                date=t["date"],
                time_slot=t["time_slot"],
                duration_minutes=t["duration_minutes"],
                completed=False,
                topic_name=t["topic_name"],
                priority=t["priority"]
            )
            db.add(task_obj)
            saved_tasks.append(task_obj)
        db.commit()
        
        cls.log_activity(
            db, user_id,
            agent_name="Study Planner Agent",
            action_type="study_plan_updated",
            title="Study plan updated adaptively",
            description=f"Generated {len(saved_tasks)} structured slots balancing upcoming deadlines and {len(weak_topics)} weak topics."
        )
        
        return saved_tasks

    @classmethod
    def evaluate_quiz_submission(cls, db: Session, user_id: int, quiz_id: int, answers: Dict[str, int]) -> Dict[str, Any]:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
            
        questions = [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options_json,
                "correct_option_index": q.correct_option_index,
                "explanation": q.explanation,
                "topic_name": q.topic_name
            }
            for q in quiz.questions
        ]
        
        eval_result = EvaluationAgent.evaluate_quiz(questions, answers)
        
        attempt = QuizAttempt(
            quiz_id=quiz.id,
            user_id=user_id,
            score=eval_result["score"],
            total=eval_result["total"],
            percentage=eval_result["percentage"],
            answers_json=answers,
            weak_topics_json=eval_result["weak_topics"]
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
        cls.log_activity(
            db, user_id,
            agent_name="Evaluation Agent",
            action_type="performance_analyzed",
            title=f"Performance analyzed: {quiz.title}",
            description=f"Recorded score of {eval_result['score']}/{eval_result['total']} ({eval_result['percentage']}%)."
        )
        
        if eval_result["weak_topics"]:
            cls.log_activity(
                db, user_id,
                agent_name="Evaluation Agent",
                action_type="weak_topics_detected",
                title="Weak topics detected",
                description=f"Flagged for urgent revision: {', '.join(eval_result['weak_topics'])}."
            )
            # Adapt study plan automatically based on newly detected weak topics
            cls.generate_adaptive_plan(db, user_id)
            
        return eval_result
