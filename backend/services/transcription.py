import whisper

# Load once at startup — reused for every request
_whisper_model = whisper.load_model("base")

def transcribe_audio(audio_path: str) -> str:
    try:
        result = _whisper_model.transcribe(audio_path, fp16=False)
        return result["text"]
    except Exception as e:
        raise Exception(f"Failed to transcribe: {str(e)}")
