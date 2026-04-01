"""
routes/history.py — /api/history  GET/DELETE/PATCH per user
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from db.database import get_db, VideoSession, VideoCache
from services.auth import get_current_user
from db.database import User

router = APIRouter(prefix="/history", tags=["history"])


class SessionOut(BaseModel):
    id: str
    title: str
    source_label: str
    created_at: str
    word_count: int
    estimated_read_time: int

class SessionDetailOut(SessionOut):
    transcript: str
    notes: str
    summary: str
    quiz: dict
    flashcards: list
    key_concepts: list
    mindmap: dict
    language_detected: str


@router.get("", response_model=List[SessionOut])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(VideoSession)
        .filter(VideoSession.user_id == current_user.id)
        .order_by(VideoSession.created_at.desc())
        .all()
    )
    return [
        SessionOut(
            id=s.id,
            title=s.title,
            source_label=s.source_label,
            created_at=s.created_at.isoformat(),
            word_count=s.cache.word_count,
            estimated_read_time=s.cache.estimated_read_time,
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionDetailOut)
def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(VideoSession).filter(
        VideoSession.id == session_id,
        VideoSession.user_id == current_user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")

    c = s.cache
    return SessionDetailOut(
        id=s.id,
        title=s.title,
        source_label=s.source_label,
        created_at=s.created_at.isoformat(),
        word_count=c.word_count,
        estimated_read_time=c.estimated_read_time,
        transcript=c.transcript,
        notes=c.notes,
        summary=c.summary,
        quiz=c.quiz,
        flashcards=c.flashcards,
        key_concepts=c.key_concepts,
        mindmap=c.mindmap,
        language_detected=c.language_detected,
    )


class RenameBody(BaseModel):
    title: str

@router.patch("/{session_id}")
def rename_session(
    session_id: str,
    body: RenameBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(VideoSession).filter(
        VideoSession.id == session_id,
        VideoSession.user_id == current_user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    s.title = body.title[:120]
    db.commit()
    return {"ok": True}


@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(VideoSession).filter(
        VideoSession.id == session_id,
        VideoSession.user_id == current_user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(s)
    db.commit()
    return {"ok": True}
