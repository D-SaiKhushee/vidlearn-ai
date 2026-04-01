import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage  from './pages/AuthPage';
import Home      from './pages/Home';
import Result    from './pages/Result';
import History   from './components/History';

function Shell() {
  const { user, loading, signout } = useAuth();
  const [data, setData]     = useState(null);
  const [view, setView]     = useState('home'); // 'home' | 'history'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-ring" />
    </div>
  );

  if (!user) return <AuthPage />;

  const goHome = () => { setData(null); setView('home'); };
  const loadSession = (sessionData) => { setData(sessionData); setView('home'); };

  return (
    <div className="app">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={goHome} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">🎓</div>
          <span className="nav-logo-text">Vid<span>Learn</span> AI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="nav-badge">GEMINI POWERED</span>

          {/* History tab */}
          <button
            className={`btn btn-ghost ${view === 'history' ? 'btn-cyan' : ''}`}
            style={{ fontSize: '0.82rem' }}
            onClick={() => { setData(null); setView(view === 'history' ? 'home' : 'history'); }}
          >
            📚 My Sessions
          </button>

          {/* User menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
              color: '#080a0f', flexShrink: 0,
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <span className="nav-username">
              {user.username}
            </span>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={signout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {view === 'history' ? (
          <>
            <div className="result-header" style={{ marginBottom: '1.5rem' }}>
              <div className="result-title">My <span>Sessions</span></div>
              <button className="btn btn-ghost" onClick={goHome}>+ New Video</button>
            </div>
            <div className="content-panel">
              <History onLoad={loadSession} />
            </div>
          </>
        ) : !data ? (
          <Home onResult={d => { setData(d); setView('home'); }} />
        ) : (
          <Result data={data} onReset={goHome} />
        )}
      </main>

      <footer className="footer">
        VidLearn AI © 2025 — Built with Gemini Flash-Lite + OpenAI Whisper + SQLite
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
