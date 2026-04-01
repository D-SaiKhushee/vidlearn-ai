import React, { useState } from 'react';

export default function Quiz({ quizData }) {
  const [answers, setAnswers]           = useState({});
  const [submitted, setSubmitted]       = useState(false);
  const [score, setScore]               = useState(0);
  const [shortAnswers, setShortAnswers] = useState({});
  const [showModel, setShowModel]       = useState(false);

  if (!quizData) return <p style={{ color: 'var(--text-3)' }}>No quiz data available.</p>;

  let parsed = quizData;
  if (typeof quizData === 'string') {
    try { parsed = JSON.parse(quizData); } catch (_) {}
  }

  const mcqs   = parsed.mcq   || [];
  const shorts = parsed.short || [];

  const select = (qi, opt) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: opt }));
  };

  const submit = () => {
    const s = mcqs.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    setScore(s); setSubmitted(true);
  };

  const pct = mcqs.length ? Math.round((score / mcqs.length) * 100) : 0;

  return (
    <div className="quiz-wrapper">

      {/* Score banner */}
      {submitted && (
        <div className="score-banner">
          <div className="score-big">{score}/{mcqs.length}</div>
          <div style={{ marginBottom: '0.5rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {pct}% CORRECT
          </div>
          <div className="score-msg">
            {pct === 100 ? '🎉 Perfect score! Exceptional work!' :
             pct >= 80  ? '🌟 Great job! Almost there!' :
             pct >= 60  ? '📚 Good effort — review the explanations below.' :
                          '💪 Keep studying — you\'ve got this!'}
          </div>
        </div>
      )}

      {/* MCQs */}
      {mcqs.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem' }}>
            Multiple Choice Questions
          </div>
          {mcqs.map((q, i) => (
            <div key={i} className={`q-card ${answers[i] ? 'answered' : ''}`}>
              <div className="q-label">QUESTION {i + 1} / {mcqs.length}</div>
              <div className="q-text">{q.question}</div>
              <div className="options-grid">
                {q.options.map((opt, oi) => {
                  let cls = 'opt-btn';
                  if (answers[i] === opt) cls += ' selected';
                  if (submitted) {
                    if (opt === q.answer) cls += ' correct';
                    else if (answers[i] === opt) cls += ' incorrect';
                  }
                  return (
                    <button key={oi} className={cls} onClick={() => select(i, opt)} disabled={submitted}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && answers[i] !== q.answer && (
                <div className="answer-hint">
                  ✅ Correct answer: <strong>{q.answer}</strong>
                </div>
              )}
              {submitted && q.explanation && (
                <div className="explanation-box">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Short answers */}
      {shorts.length > 0 && (
        <div>
          <div className="short-header">
            <div className="short-title">Short Answer Questions</div>
            {submitted && (
              <button className="btn btn-cyan" onClick={() => setShowModel(v => !v)}>
                {showModel ? '🙈 Hide Answers' : '💡 Show Model Answers'}
              </button>
            )}
          </div>
          {shorts.map((q, i) => {
            const qText  = typeof q === 'string' ? q : q.question || '';
            const mAns   = typeof q === 'object' ? q.model_answer : null;
            return (
              <div key={i} className="q-card">
                <div className="q-label">SHORT ANSWER {i + 1}</div>
                <div className="q-text">{qText}</div>
                <textarea
                  className="short-textarea"
                  placeholder="Write your answer here…"
                  rows={4}
                  value={shortAnswers[i] || ''}
                  onChange={e => setShortAnswers(a => ({ ...a, [i]: e.target.value }))}
                />
                {submitted && showModel && mAns && (
                  <div className="model-answer">
                    <strong>MODEL ANSWER</strong>
                    {mAns}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit */}
      {!submitted && mcqs.length > 0 && (
        <button
          className="submit-btn"
          onClick={submit}
          disabled={Object.keys(answers).length < mcqs.length}
          style={{ opacity: Object.keys(answers).length < mcqs.length ? 0.5 : 1 }}
        >
          Submit Quiz →
        </button>
      )}

      {!submitted && Object.keys(answers).length < mcqs.length && (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '-0.5rem' }}>
          Answer all {mcqs.length} questions to submit
        </p>
      )}
    </div>
  );
}
