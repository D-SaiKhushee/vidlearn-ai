import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import init_db
from routes import video, auth, history

app = FastAPI(title="VidLearn AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def startup():
    init_db()
    os.makedirs("data/videos", exist_ok=True)
    os.makedirs("data/audio",  exist_ok=True)

app.include_router(auth.router,    prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(video.router,   prefix="/api")

@app.get("/")
def root():
    return {"message": "VidLearn AI v3.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
