import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE, timeout: 600000 });

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('vl_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vl_token');
      localStorage.removeItem('vl_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (email, username, password) =>
  api.post('/auth/register', { email, username, password }).then(r => r.data);

export const login = (email, password) => {
  const form = new FormData();
  form.append('username', email); // OAuth2 form uses 'username'
  form.append('password', password);
  return api.post('/auth/login', form).then(r => r.data);
};

export const getMe = () => api.get('/auth/me').then(r => r.data);

// ── Video ─────────────────────────────────────────────────────────────────────
export const processVideo = (file, youtubeUrl) => {
  const form = new FormData();
  if (file) form.append('file', file);
  if (youtubeUrl) form.append('youtube_url', youtubeUrl);
  return api.post('/process-video', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

// ── History ───────────────────────────────────────────────────────────────────
export const getHistory = () => api.get('/history').then(r => r.data);
export const getSession = id => api.get(`/history/${id}`).then(r => r.data);
export const deleteSession = id => api.delete(`/history/${id}`).then(r => r.data);
export const renameSession = (id, title) => api.patch(`/history/${id}`, { title }).then(r => r.data);
