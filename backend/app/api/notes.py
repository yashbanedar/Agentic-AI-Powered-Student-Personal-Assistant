from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database_models import AINote, Subject, Document, DocumentChunk, User
from app.api.deps import get_current_user
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix='/notes', tags=['notes'])

@router.get('/')
def get_notes(subject_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(AINote).filter(AINote.user_id == current_user.id)
    if subject_id:
        query = query.filter(AINote.subject_id == subject_id)
    notes = query.order_by(AINote.created_at.desc()).all()
    
    # Do not auto-generate filler notes if none exist
    res = []
    for n in notes:
        sub = db.query(Subject).filter(Subject.id == n.subject_id).first()
        res.append({
            'id': n.id,
            'subject_id': n.subject_id,
            'subject_name': sub.name if sub else 'Subject',
            'title': n.title,
            'topic_name': n.topic_name,
            'note_type': n.note_type,
            'content_markdown': n.content_markdown,
            'created_at': n.created_at
        })
    return res

@router.post('/generate')
def generate_note(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import requests
    from app.core.config import settings
    from app.models.database_models import Syllabus, SyllabusUnit, SyllabusTopic
    
    subject_id = data.get('subject_id')
    topic_name = data.get('topic_name', '').strip()
    note_type = data.get('note_type', 'Summary')
    
    sub = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    sub_name = sub.name
    
    # Retrieve actual document chunks uploaded for this subject
    chunks = db.query(DocumentChunk).join(Document).filter(
        Document.user_id == current_user.id,
        Document.subject_id == subject_id
    ).all()
    
    syllabus = db.query(Syllabus).filter(
        Syllabus.user_id == current_user.id,
        Syllabus.subject_id == subject_id
    ).first()
    
    # Strictly require that the student has provided documents or syllabus first!
    if not chunks and not syllabus:
        raise HTTPException(
            status_code=400, 
            detail=f"No study materials, documents, or syllabus found for {sub_name}. Please upload your lecture notes, textbook chapters, or syllabus first in Study Materials."
        )
        
    # Gather actual context text
    chunk_texts = [c.content for c in chunks if c.content]
    combined_doc_context = "\n\n".join(chunk_texts[:10])
    
    target_topic = topic_name or (syllabus.units[0].topics[0].title if syllabus and syllabus.units and syllabus.units[0].topics else f"{sub_name} Core Topics")
    
    md_content = ""
    
    # If Gemini API key is configured, call Gemini to synthesize grounded notes
    if settings.GEMINI_API_KEY and combined_doc_context:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = (
                f"You are an expert academic tutor. Create a high-yield {note_type} on '{target_topic}' for the subject '{sub_name}'. "
                f"Ground your notes STRICTLY in the course materials provided below. Do not make up unrelated facts.\n\n"
                f"Course Materials Context:\n{combined_doc_context[:4000]}\n\n"
                f"Format with markdown headings:\n"
                f"# {target_topic}: {note_type}\n"
                f"### 1. Executive Summary\n"
                f"### 2. Key Definitions & Concepts\n"
                f"### 3. Exam Problem Solving & Heuristics\n"
                f"### 4. High-Yield Exam Review Questions"
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1200}
            }
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                result_json = res.json()
                md_content = result_json["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            md_content = ""
            
    if not md_content:
        # Grounded extraction from student's actual text
        doc_names = list(set([c.document.filename for c in chunks if c.document]))
        doc_source_str = ", ".join(doc_names) if doc_names else "Uploaded Material"
        
        # Extract meaningful lines from chunk text
        relevant_lines = []
        if combined_doc_context:
            for l in combined_doc_context.split("\n"):
                clean = l.strip()
                if len(clean) > 25 and not clean.startswith(("---", "Page", "Slide")):
                    relevant_lines.append(clean)
                    
        key_points = relevant_lines[:5] if relevant_lines else [f"Detailed review of {target_topic} in {sub_name}."]
        points_md = "\n".join([f"* {p}" for p in key_points])
        
        md_content = (
            f"# {target_topic}: {note_type}\n"
            f"**Subject:** {sub_name} | **Sources:** {doc_source_str}\n\n"
            f"### 1. Executive Summary\n"
            f"Synthesized revision note for **{target_topic}** formulated strictly from your provided course material.\n\n"
            f"### 2. Core Concepts & Extracted Points\n"
            f"{points_md}\n\n"
            f"### 3. Exam Review & Heuristics\n"
            f"1. **Primary Concept:** Focus on direct explanations and definitions extracted from {doc_source_str}.\n"
            f"2. **Application:** Relate these concepts to high-frequency past examination questions.\n"
            f"3. **Mistakes to Avoid:** Avoid confusing terminology with adjacent topics in {sub_name}.\n\n"
            f"### 4. Self-Test Question\n"
            f"* Explain the significance and key mechanisms of **{target_topic}** as discussed in your course notes."
        )
        
    note = AINote(
        user_id=current_user.id,
        subject_id=subject_id,
        title=f'{target_topic}: {note_type}',
        topic_name=target_topic,
        content_markdown=md_content,
        note_type=note_type
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    AgentOrchestrator.log_activity(
        db=db,
        user_id=current_user.id,
        agent_name='Document Agent',
        action_type='notes_generated',
        title=f'AI Notes generated: {target_topic}',
        description=f'Synthesized {note_type} grounded strictly in your provided course material.'
    )
    
    return {
        "id": note.id,
        "subject_id": note.subject_id,
        "subject_name": sub.name,
        "title": note.title,
        "topic_name": note.topic_name,
        "note_type": note.note_type,
        "content_markdown": note.content_markdown,
        "created_at": note.created_at
    }


