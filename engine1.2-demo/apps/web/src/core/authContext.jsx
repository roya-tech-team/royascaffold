import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pollpulse_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const result = await authApi.login({ email, password });
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  async function register(name, email, password) {
    const result = await authApi.register({ name, email, password });
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
