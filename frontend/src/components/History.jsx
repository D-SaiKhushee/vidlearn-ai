import React, { useEffect, useState } from 'react';
import { getHistory, getSession, deleteSession, renameSession } from '../api/api';

export default function History({ onLoad }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [editId, setEditId]     = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const fetch = () => {
    setLoading(true);
    getHistory()
      .then(setSessions)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const load = async (id) => {
    setLoadingId(id);
    try {
      const data = await getSession(id);
      onLoad(data);
    } finally {
      setLoadingId(null);
    }
  };

  const del = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this session?')) return;
    await deleteSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  };

  const startRename = (e, s) => {
    e.stopPropagation();
    setEditId(s.id); setEditTitle(s.title);
  };

  const saveRename = async (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await renameSession(id, editTitle.trim());
    setSessions(s => s.map(x => x.id === id ? { ...x, title: editTitle.trim() } : x));
    setEditId(null);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
      Loading your sessions…
    </div>
  );

  if (!sessions.length) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
        No sessions yet
      </div>
      <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>
        Process a video to get started — it'll appear here for you to revisit anytime.
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
        {sessions.length} saved session{sessions.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => load(s.id)}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
              cursor: 'pointer', transition: 'all 0.15s',
              opacity: loadingId === s.id ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {editId === s.id ? (
                <input
                  value={editTitle}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveRename(e, s.id); if (e.key === 'Escape') setEditId(null); }}
                  autoFocus
                  style={{
                    width: '100%', background: 'var(--bg-2)', border: '1px solid var(--accent)',
                    borderRadius: 6, color: 'var(--text)', padding: '0.3rem 0.6rem',
                    fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none',
                  }}
                />
              ) : (
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.title}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                  {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)' }}>
                  {s.word_count?.toLocaleString()} words · ~{s.estimated_read_time} min read
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {loadingId === s.id ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Loading…</span>
              ) : (
                <>
                  {editId === s.id ? (
                    <button className="btn btn-cyan" onClick={e => saveRename(e, s.id)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>Save</button>
                  ) : (
                    <button className="btn btn-ghost" onClick={e => startRename(e, s)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>✏️</button>
                  )}
                  <button className="btn btn-ghost" onClick={e => del(e, s.id)}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--accent-3)', borderColor: 'rgba(255,77,109,0.2)' }}>
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
