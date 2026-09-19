from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    gemini_api_key = Column(String(255), nullable=True)
    openai_api_key = Column(String(255), nullable=True)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("StudyTask", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("AIActivity", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("AINote", back_populates="user", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    color = Column(String(50), default="indigo")
    target_grade = Column(String(10), default="A")
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="subjects")
    documents = relationship("Document", back_populates="subject", cascade="all, delete-orphan")
    syllabus = relationship("Syllabus", back_populates="subject", uselist=False, cascade="all, delete-orphan")
    pyqs = relationship("PYQAnalysis", back_populates="subject", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="subject", cascade="all, delete-orphan")
    tasks = relationship("StudyTask", back_populates="subject", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="subject", cascade="all, delete-orphan")
    notes = relationship("AINote", back_populates="subject", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, pptx, txt, note
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    category = Column(String(50), default="study_material") # study_material, syllabus, pyq, notes
    extracted_text = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0)
    status = Column(String(50), default="processed") # pending, processing, processed, failed
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="documents")
    subject = relationship("Subject", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict) # page, slide, headings
    embedding_vector = Column(JSON, nullable=True)
    
    document = relationship("Document", back_populates="chunks")

class Syllabus(Base):
    __tablename__ = "syllabuses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
    subject = relationship("Subject", back_populates="syllabus")
    units = relationship("SyllabusUnit", back_populates="syllabus", cascade="all, delete-orphan")

class SyllabusUnit(Base):
    __tablename__ = "syllabus_units"
    
    id = Column(Integer, primary_key=True, index=True)
    syllabus_id = Column(Integer, ForeignKey("syllabuses.id"), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    weightage_pct = Column(Float, default=20.0)
    
    syllabus = relationship("Syllabus", back_populates="units")
    topics = relationship("SyllabusTopic", back_populates="unit", cascade="all, delete-orphan")

class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"
    
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("syllabus_units.id"), nullable=False)
    title = Column(String(255), nullable=False)
    estimated_hours = Column(Float, default=2.0)
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    mastery_level = Column(Float, default=0.0) # 0 to 100%
    completed = Column(Boolean, default=False)
    
    unit = relationship("SyllabusUnit", back_populates="topics")

class PYQAnalysis(Base):
    __tablename__ = "pyq_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_name = Column(String(255), nullable=False)
    year = Column(String(50), nullable=True)
    analysis_json = Column(JSON, default=dict) # recurring_topics, high_yield, question_bank
    created_at = Column(DateTime, default=utcnow)
    
    subject = relationship("Subject", back_populates="pyqs")

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_name = Column(String(255), nullable=False)
    exam_date = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=True)
    target_score = Column(Float, default=90.0)
    prep_urgency = Column(Float, default=50.0) # 0 to 100% calculated by ExamAgent
    completed = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="exams")
    subject = relationship("Subject", back_populates="exams")

class StudyTask(Base):
    __tablename__ = "study_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    time_slot = Column(String(50), default="Morning") # Morning, Afternoon, Evening
    duration_minutes = Column(Integer, default=60)
    completed = Column(Boolean, default=False)
    topic_name = Column(String(255), nullable=True)
    priority = Column(String(50), default="Medium") # High, Medium, Low
    
    user = relationship("User", back_populates="tasks")
    subject = relationship("Subject", back_populates="tasks")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    quiz_type = Column(String(50), default="MCQ") # MCQ, Mock, PYQ, WeakTopic
    topic_name = Column(String(255), nullable=True)
    total_questions = Column(Integer, default=5)
    time_limit_minutes = Column(Integer, default=15)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="quizzes")
    subject = relationship("Subject", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=False) # list of strings
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    topic_name = Column(String(255), nullable=True)
    
    quiz = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, default=0)
    total = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    answers_json = Column(JSON, default=dict)
    weak_topics_json = Column(JSON, default=list)
    completed_at = Column(DateTime, default=utcnow)
    
    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="attempts")

class AINote(Base):
    __tablename__ = "ai_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    topic_name = Column(String(255), nullable=True)
    content_markdown = Column(Text, nullable=False)
    note_type = Column(String(50), default="Summary") # Summary, CheatSheet, Formulas, Mindmap
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="notes")
    subject = relationship("Subject", back_populates="notes")

class AIActivity(Base):
    __tablename__ = "ai_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    action_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="completed") # in_progress, completed, failed
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="activities")
