import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from services.chunking import chunk_text

load_dotenv()

MODEL = "gemini-2.5-flash-lite"
MAX_CHUNK_CHARS = 48000


def _parse(text: str) -> dict:
    t = text.strip().replace("```json","").replace("```","").strip()
    return json.loads(t)


def generate_quiz(transcript: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY not set")
    genai.configure(api_key=api_key)
    m = genai.GenerativeModel(MODEL)

    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    if len(chunks) > 1:
        summaries = [m.generate_content(f"Key facts from section {i+1}:\n{c}").text for i, c in enumerate(chunks)]
        content = "\n\n".join(summaries)
    else:
        content = chunks[0]

    prompt = f"""Generate a quiz. Return ONLY valid JSON, no markdown:
{{
  "mcq": [
    {{"question":"...","options":["A...","B...","C...","D..."],"answer":"A...","explanation":"..."}}
  ],
  "short": [
    {{"question":"...","model_answer":"..."}}
  ]
}}
5 MCQs with explanations. 3 short answer questions with model answers.

Content:
{content}"""

    return _parse(m.generate_content(prompt).text)
