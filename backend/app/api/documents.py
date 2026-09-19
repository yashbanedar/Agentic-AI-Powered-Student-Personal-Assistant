import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.database_models import Document, DocumentChunk, User, Subject
from app.schemas.pydantic_schemas import DocumentResponse, DocumentChunkResponse
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    subject_id: Optional[int] = None, 
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)
    if subject_id:
        query = query.filter(Document.subject_id == subject_id)
    if category:
        query = query.filter(Document.category == category)
    return query.order_by(Document.created_at.desc()).all()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    subject_id: Optional[int] = Form(None),
    category: Optional[str] = Form("study_material"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine extension
    orig_name = file.filename or "uploaded_file"
    ext = os.path.splitext(orig_name)[1].lower().strip(".")
    if ext not in ["pdf", "docx", "doc", "pptx", "ppt", "txt", "md"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}. Supported formats: PDF, PPT/PPTX, DOC/DOCX, TXT.")
        
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    saved_path = os.path.join(user_upload_dir, f"{int(os.times().elapsed)}_{orig_name}")
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    doc = AgentOrchestrator.process_uploaded_document(
        db=db,
        user_id=current_user.id,
        subject_id=subject_id,
        file_path=saved_path,
        filename=orig_name,
        file_type=ext,
        category=category or "study_material"
    )
    return doc

@router.post("/text-note", response_model=DocumentResponse)
def create_text_note(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = data.get("title", "Study Note")
    content = data.get("content", "")
    subject_id = data.get("subject_id")
    category = data.get("category", "notes")
    
    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
        
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    file_path = os.path.join(user_upload_dir, f"{title.replace(' ', '_')}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    doc = AgentOrchestrator.process_uploaded_document(
        db=db,
        user_id=current_user.id,
        subject_id=subject_id,
        file_path=file_path,
        filename=f"{title}.txt",
        file_type="txt",
        category=category
    )
    return doc

@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
def get_document_chunks(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index.asc()).all()

@router.delete("/{document_id}")
def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document removed"}
