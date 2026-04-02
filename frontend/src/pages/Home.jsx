import React, { useState, useRef, useEffect } from 'react';
import { processVideo } from '../api/api';

const STEPS = [
  { text: 'Downloading & extracting audio…',       delay: 0      },
  { text: 'Transcribing speech with Whisper AI…',  delay: 9000   },
  { text: 'Generating smart notes with Gemini…',   delay: 22000  },
  { text: 'Building flashcards & key concepts…',   delay: 38000  },
  { text: 'Constructing quiz & mind map…',          delay: 52000  },
  { text: 'Finalising your learning materials…',   delay: 65000  },
];

export default function Home({ onResult }) {
  const [mode, setMode]             = useState('file');
  const [url, setUrl]               = useState('');
  const [file, setFile]             = useState(null);
  const [drag, setDrag]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [stepIdx, setStepIdx]       = useState(0);
  const [error, setError]           = useState(null);
  const fileRef                     = useRef(null);
  const timersRef                   = useRef([]);

  useEffect(() => {
    if (!loading) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setStepIdx(0);
      return;
    }
    STEPS.forEach((s, i) => {
      const id = setTimeout(() => setStepIdx(i), s.delay);
      timersRef.current.push(id);
    });
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  }, [loading]);

  const handleFile = (f) => {
    if (f && f.type.startsWith('video/')) setFile(f);
    else alert('Please select a valid video file.');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const canSubmit = mode === 'youtube' ? url.trim() !== '' : !!file;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true); setError(null);
    try {
      const data = await processVideo(
        mode === 'file' ? file : null,
        mode === 'youtube' ? url.trim() : null
      );
      onResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">AI-POWERED LEARNING</div>
        <h1 className="hero-title">
          Turn any video into<br />
          <span className="gradient-text">instant mastery</span>
        </h1>
        <p className="hero-sub">
          Paste a YouTube link or upload a lecture. VidLearn AI transcribes, 
          summarises, and builds you notes, flashcards, quizzes and a mind map — instantly.
        </p>
        <div className="hero-features">
          {[
            ['#00e5ff', '📝 Smart Notes'],
            ['#7c6cfc', '🃏 Flashcards'],
            ['#00d68f', '🧠 Quiz'],
            ['#ffb547', '🗺️ Mind Map'],
            ['#ff4d6d', '💡 Key Concepts'],
          ].map(([color, label]) => (
            <span key={label} className="feature-chip">
              <span className="dot" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Upload card */}
      <div className="upload-card">
        {/* Mode tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn ${mode === 'youtube' ? 'active' : ''}`}
            onClick={() => setMode('youtube')} disabled={loading}
          >
            <span>▶</span> YouTube Link
          </button>
          <button
            className={`tab-btn ${mode === 'file' ? 'active' : ''}`}
            onClick={() => setMode('file')} disabled={loading}
          >
            <span>📁</span> Local Video File
          </button>
        </div>

        {/* Input area */}
        {mode === 'youtube' ? (
          <div className="yt-input-wrap">
            <span className="yt-icon">▶</span>
            <input
              className="yt-input"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
          </div>
        ) : (
          <div
            className={`dropzone ${drag ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={e => { e.preventDefault(); setDrag(true); }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={e => { e.preventDefault(); setDrag(false); }}
            onDrop={handleDrop}
            onClick={() => !loading && fileRef.current.click()}
          >
            <input
              ref={fileRef} type="file" accept="video/*"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={loading}
            />
            <div className="dropzone-icon">{file ? '✅' : '🎬'}</div>
            {file
              ? <><p>Ready to process</p><p className="file-name">{file.name}</p></>
              : <p>Drag & drop a video file, or <strong>click to browse</strong></p>
            }
          </div>
        )}

        {/* Submit */}
        {!loading && canSubmit && (
          <button className="process-btn" onClick={handleSubmit}>
            ✨ Generate Learning Materials
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-panel">
            <div className="loading-ring" />
            <p className="loading-step">{STEPS[stepIdx].text}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="progress-label">STEP {stepIdx + 1} / {STEPS.length}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-box">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* How it works */}
      <HowItWorks />
    </>
  );
}

function HowItWorks() {
  const steps = [
    { icon: '🎬', title: 'Input Video', desc: 'Paste a YouTube URL or upload any local video file up to 2GB.' },
    { icon: '🤖', title: 'AI Processes', desc: 'Whisper transcribes audio. Gemini 2.5 Flash analyses the content.' },
    { icon: '📚', title: 'Learn Faster', desc: 'Get notes, flashcards, a quiz, mind map and key concepts instantly.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem',
          animation: `fadeUp 0.6s ${0.2 + i * 0.1}s var(--ease) both`
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>{s.title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
