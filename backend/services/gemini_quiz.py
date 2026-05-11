import os
import json
from groq import Groq
from services.chunking import chunk_text

MODEL = "llama-3.3-70b-versatile"
MAX_CHUNK_CHARS = 48000


def _parse(text):
    return json.loads(text.strip().replace("```json","").replace("```","").strip())


def generate_quiz(transcript):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not set")
    client = Groq(api_key=api_key)

    chunks = chunk_text(transcript, MAX_CHUNK_CHARS)
    if len(chunks) > 1:
        summaries = [client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": f"Key facts from section {i+1}:\n{c}"}],
            temperature=0.3,
        ).choices[0].message.content for i, c in enumerate(chunks)]
        content = "\n\n".join(summaries)
    else:
        content = chunks[0]

    prompt = f'''Generate a quiz. Return ONLY valid JSON, no markdown:
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
''' + content

    return _parse(client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    ).choices[0].message.content)
