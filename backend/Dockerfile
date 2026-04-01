# ── Backend Dockerfile ──────────────────────────────────────────────────────
# Builds the FastAPI + Whisper + Gemini backend for Azure App Service (Linux)
# ────────────────────────────────────────────────────────────────────────────

FROM python:3.12-slim

# System deps: ffmpeg (for audio), git (for whisper model download)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper base model so container starts fast
RUN python -c "import whisper; whisper.load_model('base')"

# Copy source
COPY . .

# Create data dirs
RUN mkdir -p data/videos data/audio

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
