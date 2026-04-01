import React, { useState } from 'react';
import NotesViewer  from '../components/NotesViewer';
import Flashcards   from '../components/Flashcards';
import KeyConcepts  from '../components/KeyConcepts';
import MindMap      from '../components/MindMap';
import Quiz         from '../components/Quiz';

const TABS = [
  { id: 'notes',      icon: '📝', label: 'Smart Notes'   },
  { id: 'flash',      icon: '🃏', label: 'Flashcards'    },
  { id: 'concepts',   icon: '💡', label: 'Key Concepts'  },
  { id: 'mindmap',    icon: '🗺️', label: 'Mind Map'      },
  { id: 'quiz',       icon: '🧠', label: 'Quiz'          },
  { id: 'transcript', icon: '📄', label: 'Transcript'    },
];

export default function Result({ data, onReset }) {
  const [tab, setTab]       = useState('notes');
  const [copied, setCopied] = useState(false);

  const words    = data.word_count ?? data.transcript?.split(/\s+/).length ?? 0;
  const readTime = data.estimated_read_time ?? Math.max(1, Math.round(words / 200));

  const copyTranscript = () => {
    navigator.clipboard.writeText(data.transcript || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="result-header">
        <div>
          <div className="result-title">
            Your <span>Learning Pack</span> is ready
            {data.from_cache && (
              <span title="Loaded from cache — no API calls used" style={{
                marginLeft: '0.75rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                color: 'var(--accent-4)', background: 'rgba(0,214,143,0.1)',
                border: '1px solid rgba(0,214,143,0.25)', borderRadius: 99,
                padding: '2px 8px', letterSpacing: '0.06em', verticalAlign: 'middle',
              }}>⚡ CACHED</span>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>
            Saved to your account — access it anytime from My Sessions
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onReset}>← New Video</button>
      </div>

      <div className="stats-bar">
        {[
          ['📊', 'Words',         words.toLocaleString()],
          ['⏱️', 'Read time',     `~${readTime} min`],
          ['🃏', 'Flashcards',    data.flashcards?.length ?? 0],
          ['❓', 'Quiz Qs',       (data.quiz?.mcq?.length ?? 0) + (data.quiz?.short?.length ?? 0)],
          ['💡', 'Key concepts',  data.key_concepts?.length ?? 0],
        ].map(([icon, label, val]) => (
          <div key={label} className="stat-item">
            <span>{icon}</span><span>{label}:</span>
            <span className="stat-val">{val}</span>
          </div>
        ))}
      </div>

      <div className="result-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`result-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="content-panel">
        {tab === 'notes'      && <NotesViewer notes={data.notes} summary={data.summary} />}
        {tab === 'flash'      && <Flashcards  flashcards={data.flashcards} />}
        {tab === 'concepts'   && <KeyConcepts concepts={data.key_concepts} />}
        {tab === 'mindmap'    && <MindMap     mindmap={data.mindmap} />}
        {tab === 'quiz'       && <Quiz        quizData={data.quiz} />}
        {tab === 'transcript' && (
          <div>
            <div className="copy-bar">
              <button className="btn btn-ghost" onClick={copyTranscript}>
                {copied ? '✅ Copied!' : '📋 Copy Transcript'}
              </button>
            </div>
            <div className="transcript-box">{data.transcript}</div>
          </div>
        )}
      </div>
    </>
  );
}
