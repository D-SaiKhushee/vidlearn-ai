import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vl_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('vl_token'); localStorage.removeItem('vl_user'); })
      .finally(() => setLoading(false));
  }, []);

  const signin = ({ access_token, user: u }) => {
    localStorage.setItem('vl_token', access_token);
    localStorage.setItem('vl_user', JSON.stringify(u));
    setUser(u);
  };

  const signout = () => {
    localStorage.removeItem('vl_token');
    localStorage.removeItem('vl_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
