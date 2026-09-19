from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Subject Schemas
class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    color: Optional[str] = "indigo"
    target_grade: Optional[str] = "A"

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    color: Optional[str] = "indigo"
    target_grade: Optional[str] = "A"
    created_at: datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentResponse(BaseModel):
    id: int
    subject_id: Optional[int] = None
    filename: str
    file_type: str
    file_size: int
    category: str
    chunk_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    content: str
    metadata_json: Dict[str, Any]

    class Config:
        from_attributes = True

# Syllabus Schemas
class SyllabusTopicSchema(BaseModel):
    id: Optional[int] = None
    title: str
    estimated_hours: float = 2.0
    difficulty: str = "Medium"
    mastery_level: float = 0.0
    completed: bool = False

class SyllabusUnitSchema(BaseModel):
    id: Optional[int] = None
    unit_number: int
    title: str
    description: Optional[str] = None
    weightage_pct: float = 20.0
    topics: List[SyllabusTopicSchema] = []

class SyllabusResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    units: List[SyllabusUnitSchema] = []

    class Config:
        from_attributes = True

# Exam Schemas
class ExamCreate(BaseModel):
    subject_id: int
    exam_name: str
    exam_date: datetime
    location: Optional[str] = None
    target_score: Optional[float] = 90.0

class ExamResponse(BaseModel):
    id: int
    subject_id: int
    subject_name: Optional[str] = None
    exam_name: str
    exam_date: datetime
    days_left: Optional[int] = None
    hours_left: Optional[int] = None
    prep_urgency: float
    completed: bool

    class Config:
        from_attributes = True

# Study Task Schemas
class StudyTaskCreate(BaseModel):
    subject_id: int
    title: str
    date: str
    time_slot: str = "Morning"
    duration_minutes: int = 60
    topic_name: Optional[str] = None
    priority: Optional[str] = "Medium"

class StudyTaskResponse(BaseModel):
    id: int
    subject_id: int
    subject_name: Optional[str] = None
    title: str
    date: str
    time_slot: str
    duration_minutes: int
    completed: bool
    topic_name: Optional[str] = None
    priority: str

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizQuestionSchema(BaseModel):
    id: Optional[int] = None
    question_text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    topic_name: Optional[str] = None

class QuizCreate(BaseModel):
    subject_id: int
    title: str
    quiz_type: str = "MCQ"
    topic_name: Optional[str] = None
    total_questions: int = 5
    time_limit_minutes: int = 15

class QuizResponse(BaseModel):
    id: int
    subject_id: int
    title: str
    quiz_type: str
    topic_name: Optional[str] = None
    total_questions: int
    time_limit_minutes: int
    questions: List[QuizQuestionSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True

class QuizSubmit(BaseModel):
    answers: Dict[int, int] # question_id: chosen_index

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    total: int
    percentage: float
    weak_topics: List[str]
    completed_at: datetime

# AI Chat / Tutor Schemas
class ChatQuery(BaseModel):
    subject_id: Optional[int] = None
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class ChatCitation(BaseModel):
    document_name: str
    chunk_index: int
    snippet: str
    page_or_slide: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[ChatCitation] = []
    suggested_followups: List[str] = []

# AI Activity Schema
class AIActivityResponse(BaseModel):
    id: int
    agent_name: str
    action_type: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendation Schema
class RecommendationResponse(BaseModel):
    what_to_study_now: str
    urgency_level: str
    recommended_topic: str
    subject_name: str
    reason: str
    action_type: str # "review_notes", "take_quiz", "pyq_practice"
    weak_topics: List[Dict[str, Any]]
    high_yield_topics: List[Dict[str, Any]]
