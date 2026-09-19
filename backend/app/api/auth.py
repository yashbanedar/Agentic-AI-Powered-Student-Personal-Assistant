from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.database_models import User, Subject, Exam, StudyTask, AIActivity, Syllabus, SyllabusUnit, SyllabusTopic, PYQAnalysis, AINote, Quiz, QuizQuestion
from app.schemas.pydantic_schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    is_demo = data.email.lower() == "student@university.edu"
    user = User(
        email=data.email.lower(),
        full_name=data.full_name or data.email.split("@")[0],
        hashed_password=get_password_hash(data.password),
        preferences={"onboarding_completed": True} if is_demo else {"onboarding_completed": False}
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Only create default demo subjects for the preconfigured demo student
    if is_demo:
        subjects_to_create = [
            ("Computer Networks", "CS301", "indigo", "A"),
            ("Database Systems", "CS302", "emerald", "A+"),
            ("Operating Systems", "CS303", "amber", "A")
        ]
        for s_name, s_code, s_col, s_grd in subjects_to_create:
            sub = Subject(user_id=user.id, name=s_name, code=s_code, color=s_col, target_grade=s_grd)
            db.add(sub)
        db.commit()
        
    # Log initial AI Activity
    activity = AIActivity(
        user_id=user.id,
        agent_name="Agent Orchestrator",
        action_type="account_initialized",
        title="Agentic AI Student Assistant Initialized",
        description="All 10 specialized AI agents activated and ready to assist your customized study workflow.",
        status="completed"
    )
    db.add(activity)
    db.commit()
    
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, db: Session = Depends(get_db)):
    # Support both application/json and OAuth2 form data
    email = None
    password = None
    
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        email = body.get("email") or body.get("username")
        password = body.get("password")
    else:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
        
    if not email or not password:
        raise HTTPException(status_code=400, detail="Username/email and password required")
        
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/settings", response_model=UserResponse)
def update_settings(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "gemini_api_key" in data:
        current_user.gemini_api_key = data["gemini_api_key"]
    if "openai_api_key" in data:
        current_user.openai_api_key = data["openai_api_key"]
    if "full_name" in data:
        current_user.full_name = data["full_name"]
    db.commit()
    db.refresh(current_user)
    return current_user
