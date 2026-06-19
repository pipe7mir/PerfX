import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api, loadTokens, clearTokens } from '../services/api';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadTokens();
    const storedUser = localStorage.getItem('perfx_user');
    if (storedUser && localStorage.getItem('perfx_access_token')) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('perfx_user');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) return null;

    try {
      const response = await api.auth.login(email, password);
      if (response.isAuthenticated && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('perfx_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (err) {
      console.error('Error in login:', err);
    }

    return null;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    clearTokens();
    localStorage.removeItem('perfx_user');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
