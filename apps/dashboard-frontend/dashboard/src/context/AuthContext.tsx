import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/api';

interface User {
  id?: number;
  username: string;
  role?: string;
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
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setUser(data);
          else logout();
        })
        .catch(() => logout());
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await loginApi(username, password);
      // Accept both 'token' and 'access_token' for compatibility
      const receivedToken = res.token || res.access_token;
      if (receivedToken) {
        setToken(receivedToken);
        localStorage.setItem('token', receivedToken);
        setUser(res.user || { username });
        return true;
      }
      logout();
      return false;
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
