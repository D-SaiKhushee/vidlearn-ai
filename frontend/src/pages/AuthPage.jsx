import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/api';

export default function AuthPage() {
  const { signin } = useAuth();
  const [mode, setMode]     = useState('login'); // 'login' | 'signup'
  const [form, setForm]     = useState({ email: '', username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const data = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.email, form.username, form.password);
      signin(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 1rem',
          }}>🎓</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
            VidLearn AI
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-2)', borderRadius: 'var(--radius)',
          padding: '0.25rem', marginBottom: '1.75rem',
        }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '0.6rem', border: 'none',
              borderRadius: 9, fontWeight: 600, fontSize: '0.875rem',
              fontFamily: 'var(--font-body)', cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === m ? 'var(--surface-2)' : 'transparent',
              color: mode === m ? 'var(--text)' : 'var(--text-3)',
            }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          {mode === 'signup' && (
            <Field label="Username" type="text" value={form.username} onChange={set('username')} placeholder="coollearner" />
          )}
          <Field label="Password" type="password" value={form.password} onChange={set('password')}
            placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem',
            background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)',
            borderRadius: 'var(--radius)', color: '#ff7a93', fontSize: '0.85rem',
          }}>⚠️ {error}</div>
        )}

        {/* Submit */}
        <button
          onClick={submit} disabled={loading}
          style={{
            width: '100%', padding: '0.9rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            border: 'none', borderRadius: 'var(--radius)',
            color: '#080a0f', fontFamily: 'var(--font-display)',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
          }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In →' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
          >
            {mode === 'login' ? 'Sign up free' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, onKeyDown }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} onKeyDown={onKeyDown}
        style={{
          width: '100%', padding: '0.75rem 1rem',
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
      />
    </div>
  );
}
