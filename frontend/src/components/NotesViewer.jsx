import React, { useState } from 'react';

export default function NotesViewer({ notes, summary }) {
  const [copied, setCopied] = useState(false);

  const copyNotes = () => {
    navigator.clipboard.writeText(notes || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderNotes = () => {
    if (!notes) return <p style={{ color: 'var(--text-3)' }}>No notes available.</p>;

    const lines = notes.split('\n');
    const result = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        result.push(<ul key={`ul-${result.length}`}>{listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, i) => {
      let p = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, `<code style="font-family:var(--font-mono);background:var(--surface-2);padding:2px 6px;border-radius:4px;font-size:0.85em">$1</code>`);

      if (p.startsWith('### ')) {
        flushList();
        result.push(<h3 key={i} dangerouslySetInnerHTML={{ __html: p.slice(4) }} />);
      } else if (p.startsWith('## ')) {
        flushList();
        result.push(<h2 key={i} dangerouslySetInnerHTML={{ __html: p.slice(3) }} />);
      } else if (p.startsWith('# ')) {
        flushList();
        result.push(<h1 key={i} dangerouslySetInnerHTML={{ __html: p.slice(2) }} />);
      } else if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
        listItems.push(<li key={i} dangerouslySetInnerHTML={{ __html: p.trim().slice(2) }} />);
      } else {
        flushList();
        if (p.trim()) result.push(<p key={i} dangerouslySetInnerHTML={{ __html: p }} />);
        else result.push(<br key={i} />);
      }
    });

    flushList();
    return result;
  };

  return (
    <div>
      {/* Summary callout */}
      {summary && (
        <div className="summary-box">
          <div className="summary-label">⚡ TL;DR — Video Summary</div>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {/* Copy bar */}
      <div className="copy-bar">
        <button className="btn btn-ghost" onClick={copyNotes}>
          {copied ? '✅ Copied!' : '📋 Copy Notes'}
        </button>
      </div>

      {/* Notes body */}
      <div className="notes-body">
        {renderNotes()}
      </div>
    </div>
  );
}
