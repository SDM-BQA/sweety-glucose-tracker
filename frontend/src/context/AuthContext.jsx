import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sweety_user');
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  async function login(email, password) {
    const res = await client.post('/auth/login', { email, password });
    localStorage.setItem('sweety_token', res.data.token);
    localStorage.setItem('sweety_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  async function register(name, email, password) {
    const res = await client.post('/auth/register', { name, email, password });
    localStorage.setItem('sweety_token', res.data.token);
    localStorage.setItem('sweety_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
