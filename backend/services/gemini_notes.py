import os
import json
from groq import Groq
from services.chunking import chunk_text

MODEL = "llama-3.3-70b-versatile"
MAX_CHUNK_CHARS = 48000


def _client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not set")
    return Groq(api_key=api_key)


def _call(client, prompt):
    return client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    ).choices[0].message.content


def generate_notes(transcript):
    client = _client()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    if len(chunks) == 1:
        return _call(client, f"Convert this transcript into structured study notes with ## headings, bullet points, **bold** key terms. Add a Summary at end.\n\n{chunks[0]}")
    parts = [_call(client, f"Extract key bullet notes from part {i+1}/{len(chunks)}:\n\n{c}") for i, c in enumerate(chunks)]
    return _call(client, f"Combine these partial notes into one clean structured set. Remove duplicates. Use ## headings. Add Summary at end.\n\n" + "\n\n".join(parts))


def generate_summary(transcript):
    client = _client()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    return _call(client, f"Summarise this transcript in 3-5 clear sentences capturing the core topic and key takeaway.\n\n{content}")


def generate_flashcards(transcript):
    client = _client()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(client, f'''Create 10 flashcards. Return ONLY valid JSON array, no markdown:
[{{"front": "question", "back": "answer"}}]

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())


def generate_key_concepts(transcript):
    client = _client()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(client, f'''Extract 8 key concepts. Return ONLY valid JSON array, no markdown:
[{{"term": "Concept", "definition": "One-sentence definition"}}]

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())


def generate_mindmap(transcript):
    client = _client()
    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    content = chunks[0] if len(chunks) == 1 else " ".join(chunks)[:MAX_CHUNK_CHARS]
    raw = _call(client, f'''Create a mind map (max 3 levels, 5 children per node). Return ONLY valid JSON, no markdown:
{{"label":"Main Topic","children":[{{"label":"Subtopic","children":[{{"label":"Detail","children":[]}}]}}]}}

Transcript:
''' + content)
    return json.loads(raw.strip().replace("```json","").replace("```","").strip())
