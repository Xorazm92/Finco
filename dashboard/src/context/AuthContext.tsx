import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      axios.get('/auth/me', { headers: { Authorization: `Bearer ${t}` } })
        .then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await axios.post('/auth/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
