import os
from google import genai
from google.genai import types

def get_youtube_transcript(url: str) -> str:
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=types.Content(
                parts=[
                    types.Part(text='Transcribe this YouTube video into plain text. Return only the transcript, no commentary.'),
                    types.Part(file_data=types.FileData(
                        mime_type='video/youtube',
                        file_uri=url
                    ))
                ]
            )
        )
        return response.text
    except Exception as e:
        raise Exception(f"Failed to get YouTube transcript: {str(e)}")
