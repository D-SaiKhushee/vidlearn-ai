"""
routes/video.py — POST /api/process-video
  • Requires auth (JWT)
  • Checks VideoCache before calling any AI — same URL = zero API calls
  • Switches to gemini-2.5-flash-lite for 1,000 free req/day (vs 250 for Flash)
  • Saves result to VideoCache + creates VideoSession for the user
"""
import os
import shutil
import uuid
import hashlib
from typing import Optional

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from db.database import get_db, VideoCache, VideoSession
from services.auth import get_current_user
from services.audio_extractor import extract_audio
from services.transcription import transcribe_audio
from services.gemini_notes import (
    generate_notes, generate_summary,
    generate_flashcards, generate_key_concepts, generate_mindmap
)
from services.gemini_quiz import generate_quiz
from services.youtube_extractor import get_youtube_transcript
from db.database import User

router = APIRouter()

BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, "data", "audio")
VIDEO_DIR = os.path.join(BASE_DIR, "data", "videos")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)


def _cache_key(youtube_url: Optional[str], filename: Optional[str]) -> str:
    raw = youtube_url.strip().lower() if youtube_url else (filename or "unknown")
    return hashlib.sha256(raw.encode()).hexdigest()


def _make_session_title(youtube_url: Optional[str], filename: Optional[str]) -> str:
    if youtube_url:
        return youtube_url.split("v=")[-1][:60] if "v=" in youtube_url else youtube_url[:60]
    return (filename or "Uploaded video")[:60]


@router.post("/process-video")
def process_video(
    file: Optional[UploadFile] = File(None),
    youtube_url: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not youtube_url and not file:
        raise HTTPException(status_code=400, detail="Must provide either a file or a YouTube URL")

    source_key   = _cache_key(youtube_url, file.filename if file else None)
    source_label = youtube_url or (file.filename if file else "")
    cached = db.query(VideoCache).filter(VideoCache.source_key == source_key).first()

    if cached:
        session = VideoSession(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            cache_id=cached.id,
            title=_make_session_title(youtube_url, file.filename if file else None),
            source_label=source_label,
        )
        db.add(session)
        db.commit()
        return _session_response(session, cached, from_cache=True)

    video_path = None
    audio_path = None

    try:
        if youtube_url:
            # Use transcript API directly — no audio download needed
            transcript = get_youtube_transcript(youtube_url)
        else:
            audio_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4().hex}.mp3")
            video_path = os.path.join(VIDEO_DIR, file.filename)
            with open(video_path, "wb") as buf:
                shutil.copyfileobj(file.file, buf)
            extract_audio(video_path, audio_path)
            transcript = transcribe_audio(audio_path)

        words      = transcript.split()
        word_count = len(words)
        read_time  = max(1, word_count // 200)

        notes        = generate_notes(transcript)
        summary      = generate_summary(transcript)
        quiz_data    = generate_quiz(transcript)
        flashcards   = generate_flashcards(transcript)
        key_concepts = generate_key_concepts(transcript)
        mindmap      = generate_mindmap(transcript)

        cache = VideoCache(
            id=str(uuid.uuid4()),
            source_key=source_key,
            transcript=transcript,
            notes=notes,
            summary=summary,
            quiz=quiz_data,
            flashcards=flashcards,
            key_concepts=key_concepts,
            mindmap=mindmap,
            word_count=word_count,
            estimated_read_time=read_time,
            language_detected="English",
        )
        db.add(cache)

        session = VideoSession(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            cache_id=cache.id,
            title=_make_session_title(youtube_url, file.filename if file else None),
            source_label=source_label,
        )
        db.add(session)
        db.commit()
        db.refresh(cache)
        db.refresh(session)

        return _session_response(session, cache, from_cache=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)


def _session_response(session: VideoSession, cache: VideoCache, from_cache: bool = False) -> dict:
    return {
        "session_id":          session.id,
        "transcript":          cache.transcript,
        "notes":               cache.notes,
        "summary":             cache.summary,
        "quiz":                cache.quiz,
        "flashcards":          cache.flashcards,
        "key_concepts":        cache.key_concepts,
        "mindmap":             cache.mindmap,
        "word_count":          cache.word_count,
        "estimated_read_time": cache.estimated_read_time,
        "language_detected":   cache.language_detected,
        "from_cache":          from_cache,
    }
