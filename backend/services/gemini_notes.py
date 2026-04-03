import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from services.chunking import chunk_text

load_dotenv()

MODEL = "gemini-2.5-flash-lite"
MAX_CHUNK_CHARS = 48000


def _model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY not set in .env")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL)


def _call(m, prompt):
    return m.generate_content(prompt).text


def generate_notes(transcript):
    m = _model()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    if len(chunks) == 1:
        return _call(m, f"Convert this transcript into structured study notes with ## headings, bullet points, **bold** key terms. Add a Summary at end.\n\n{chunks[0]}")
    parts = [_call(m, f"Extract key bullet notes from part {i+1}/{len(chunks)}:\n\n{c}") for i, c in enumerate(chunks)]
    return _call(m, f"Combine these partial notes into one clean structured set. Remove duplicates. Use ## headings. Add Summary at end.\n\n" + "\n\n".join(parts))


def generate_summary(transcript):
    m = _model()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    return _call(m, f"Summarise this transcript in 3-5 clear sentences capturing the core topic and key takeaway.\n\n{content}")


def generate_flashcards(transcript):
    m = _model()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(m, f'''Create 10 flashcards. Return ONLY valid JSON array, no markdown:
[{{"front": "question", "back": "answer"}}]

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())


def generate_key_concepts(transcript):
    m = _model()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(m, f'''Extract 8 key concepts. Return ONLY valid JSON array, no markdown:
[{{"term": "Concept", "definition": "One-sentence definition"}}]

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())


def generate_mindmap(transcript):
    m = _model()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(m, f'''Create a mind map (max 3 levels, 5 children per node). Return ONLY valid JSON, no markdown:
{{"label":"Main Topic","children":[{{"label":"Subtopic","children":[{{"label":"Detail","children":[]}}]}}]}}

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())
