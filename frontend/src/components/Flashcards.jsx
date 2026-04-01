import React, { useState } from 'react';

export default function Flashcards({ flashcards }) {
  const [flipped, setFlipped] = useState({});
  const [revealed, setRevealed] = useState(0);

  if (!flashcards?.length) return <p style={{ color: 'var(--text-3)' }}>No flashcards available.</p>;

  const toggle = (i) => {
    setFlipped(f => ({ ...f, [i]: !f[i] }));
    if (!flipped[i]) setRevealed(r => r + 1);
  };

  const resetAll = () => { setFlipped({}); setRevealed(0); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
            {flashcards.length} Flashcards
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>
            Click any card to reveal the answer
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent)' }}>
            {Object.values(flipped).filter(Boolean).length} / {flashcards.length} revealed
          </span>
          <button className="btn btn-ghost" onClick={resetAll}>↺ Reset</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: '1.75rem' }}>
        <div
          className="progress-fill"
          style={{ width: `${(Object.values(flipped).filter(Boolean).length / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Cards grid */}
      <div className="flashcard-grid">
        {flashcards.map((card, i) => (
          <div
            key={i}
            className={`flashcard ${flipped[i] ? 'flipped' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <div className="flashcard-side-label">Question</div>
                <div className="flashcard-text">{card.front}</div>
                <div className="flashcard-hint">tap to flip</div>
              </div>
              <div className="flashcard-back">
                <div className="flashcard-side-label">Answer</div>
                <div className="flashcard-text">{card.back}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
