'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type User = { id: string; email: string; name?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  setAuth: (t: string, u: User) => void;
  logout: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
  isReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('auth_token');
      const u = localStorage.getItem('auth_user');
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      console.error('AuthProvider init error:', e);
    } finally {
      setIsReady(true);
    }
  }, []);

  const setAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return <AuthContext.Provider value={{ user, token, setAuth, logout, isReady }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
