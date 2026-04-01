import React, { useState } from 'react';

const ACCENT_COLORS = [
  'var(--accent)', 'var(--accent-2)', 'var(--accent-4)',
  'var(--accent-warm)', 'var(--accent-3)',
];

export default function KeyConcepts({ concepts }) {
  const [search, setSearch] = useState('');

  if (!concepts?.length) return <p style={{ color: 'var(--text-3)' }}>No key concepts available.</p>;

  const filtered = concepts.filter(c =>
    c.term.toLowerCase().includes(search.toLowerCase()) ||
    c.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>🔍</span>
        <input
          style={{
            width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text)',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', boxSizing: 'border-box',
          }}
          placeholder="Search concepts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="concept-grid">
        {filtered.map((c, i) => (
          <div key={i} className="concept-card" style={{ borderLeft: `3px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}` }}>
            <div className="concept-term" style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}>
              {c.term}
            </div>
            <div className="concept-def">{c.definition}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: '2rem' }}>
          No concepts match "{search}"
        </p>
      )}
    </div>
  );
}
