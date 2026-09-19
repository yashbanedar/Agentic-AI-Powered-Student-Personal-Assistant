from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.database_models import Subject, Document, Exam, Syllabus, SyllabusUnit, SyllabusTopic
from app.schemas.pydantic_schemas import SubjectCreate, SubjectResponse
from app.api.deps import get_current_user
from app.models.database_models import User

router = APIRouter(prefix="/subjects", tags=["subjects"])

@router.get("/", response_model=List[SubjectResponse])
def get_subjects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.user_id == current_user.id).all()

@router.post("/", response_model=SubjectResponse)
def create_subject(data: SubjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = Subject(
        user_id=current_user.id,
        name=data.name,
        code=data.code,
        color=data.color or "indigo",
        target_grade=data.target_grade or "A"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(sub)
    db.commit()
    return {"message": "Subject deleted"}
