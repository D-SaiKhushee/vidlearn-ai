# 🎓 VidLearn AI

> Transform any video into a complete AI-powered learning experience — instantly.

---

## 📌 Overview

VidLearn AI is a full-stack web application that converts any YouTube video or uploaded lecture recording into a rich, structured set of learning materials using state-of-the-art AI. Users sign up, process videos, and access their personalised study packs from anywhere, at any time.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **🔐 Auth** | JWT-based signup & login — sessions persist across page refreshes |
| **📝 Smart Notes** | Gemini-generated markdown notes with headings, key terms, bullet points |
| **⚡ TL;DR Summary** | 3–5 sentence plain-English summary of the entire video |
| **🃏 Flashcards** | 10 active-recall flip-cards with 3D CSS animation |
| **💡 Key Concepts** | 8 colour-coded term/definition cards with live search |
| **🗺️ Mind Map** | SVG tree diagram of the topic hierarchy |
| **🧠 Quiz** | 5 MCQs with per-question explanations + 3 short-answer questions with model answers |
| **📄 Transcript** | Full raw Whisper transcript with one-click copy |
| **📚 Session History** | All processed videos saved per-user — renameable and deletable |
| **⚡ Smart Caching** | Same YouTube URL processed once, served to all users forever — zero repeat API calls |
| **☁️ Azure Ready** | Dockerised backend + frontend with full CI/CD pipeline via GitHub Actions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│   Vite + React 19 + Syne/DM Sans fonts              │
│   Auth → Upload → Results (Notes/Cards/Map/Quiz)    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (JWT in header)
┌──────────────────────▼──────────────────────────────┐
│                 FastAPI Backend                     │
│                                                     │
│  /api/auth/register   /api/auth/login               │
│  /api/process-video   /api/history/{id}             │
│                                                     │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │   Whisper  │  │  Gemini  │  │    SQLite / PG   │ │
│  │  (local)   │  │ API Free │  │   (SQLAlchemy)   │ │
│  └────────────┘  └──────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🧠 AI Pipeline

```
Video / YouTube URL
       │
       ▼
  Audio Extraction (moviepy / yt-dlp)
       │
       ▼
  Speech-to-Text (OpenAI Whisper — runs locally, FREE, no API)
       │
       ▼
  ┌────┴──────────────────────────────────────────┐
  │           Gemini 2.5 Flash-Lite API           │
  │  (1,000 free req/day — 4× more than Flash)   │
  ├───────────┬──────────┬──────────┬─────────────┤
  │   Notes   │  Summary │   Quiz   │  Flashcards │
  │           │          │          │ Key Concepts│
  │           │          │          │  Mind Map   │
  └───────────┴──────────┴──────────┴─────────────┘
       │
       ▼
  SQLite DB (cached forever — same URL = 0 API calls)
       │
       ▼
  User's Session History
```

---

## 💰 Cost Analysis

| Component | Cost |
|---|---|
| OpenAI Whisper | **FREE** — runs on your server, no API calls |
| Gemini 2.5 Flash-Lite | **FREE** — 1,000 req/day, no credit card |
| SQLite | **FREE** — file-based, zero config |
| Azure App Service (B1) | ~$13/month (B2 for backend with Whisper) |
| **Total for demo/college** | **$0** if run locally |

**Caching strategy:** Once a YouTube URL is processed, the result is stored permanently. Every subsequent request for that URL — from any user — is served from the database instantly with zero AI API calls.

---

## 🛠️ Tech Stack

**Backend**
- Python 3.12, FastAPI, Uvicorn
- OpenAI Whisper (local speech recognition)
- Google Gemini 2.5 Flash-Lite API
- SQLAlchemy + SQLite (or PostgreSQL on Azure)
- JWT auth via `python-jose` + `passlib[bcrypt]`
- `yt-dlp` + `moviepy` for audio extraction

**Frontend**
- React 19, Vite 8
- Syne (display) + DM Sans (body) + DM Mono fonts
- Pure CSS animations (no external UI library)
- Axios with JWT interceptors

**DevOps**
- Docker (multi-stage frontend build with nginx)
- GitHub Actions CI/CD → Azure App Service

---

## ⚡ Quick Start (Local)

### 1. Backend

```bash
cd backend

# Copy and fill in your keys
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY and a random JWT_SECRET_KEY

# Install dependencies
pip install -r requirements.txt

# Install ffmpeg (required by Whisper)
# macOS:
brew install ffmpeg
# Ubuntu/Debian:
sudo apt install ffmpeg

# Start server
uvicorn main:app --reload
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Open the app

Go to `http://localhost:5173`, create an account, and process your first video.

---

## 📁 Project Structure

```
vidlearn-ai/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── db/
│   │   └── database.py          # SQLAlchemy models + session
│   ├── routes/
│   │   ├── auth.py              # /api/auth/*
│   │   ├── video.py             # /api/process-video
│   │   └── history.py           # /api/history/*
│   └── services/
│       ├── auth.py              # JWT + bcrypt
│       ├── transcription.py     # Whisper wrapper
│       ├── audio_extractor.py   # moviepy
│       ├── youtube_extractor.py # yt-dlp + ffmpeg
│       ├── gemini_notes.py      # Notes, summary, flashcards, concepts, mindmap
│       ├── gemini_quiz.py       # MCQ + short answer quiz
│       └── chunking.py          # Long transcript splitter
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.jsx              # Root shell + auth routing
        ├── App.css              # Full design system
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── api/
        │   └── api.js           # All API calls + JWT interceptor
        ├── pages/
        │   ├── AuthPage.jsx     # Login + Signup
        │   ├── Home.jsx         # Upload page
        │   └── Result.jsx       # Tabbed results view
        └── components/
            ├── History.jsx      # Session list + rename/delete
            ├── NotesViewer.jsx  # Markdown renderer
            ├── Flashcards.jsx   # 3D flip cards
            ├── KeyConcepts.jsx  # Concept cards + search
            ├── MindMap.jsx      # SVG tree diagram
            └── Quiz.jsx         # MCQ + short answer
```

---

## ☁️ Azure Deployment

See `DEPLOYMENT.md` for the full step-by-step Azure CLI guide including:
- Creating App Service plans
- Configuring environment variables
- Setting up CORS
- The GitHub Actions CI/CD pipeline that auto-deploys on every `git push`

---

## 🔒 Security

- Passwords hashed with **bcrypt** (never stored in plain text)
- JWT tokens expire after **7 days**
- Each user can only access their own sessions
- CORS configured per-environment (open locally, restricted on Azure)

---

*Built for college project demonstration — VidLearn AI © 2025*
