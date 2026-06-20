import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api, loadTokens, clearTokens } from '../services/api';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  verifyMfa: (mfaToken: string, totpCode: string) => Promise<User | null>;
  logout: () => void;
  updateUser: (user: User) => void;
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
      
      // Si requiere MFA, simplemente devolvemos la respuesta al UI
      if (response.nextStep === 'MFA_REQUIRED') {
        return response;
      }

      if (response.isAuthenticated && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('perfx_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (err) {
      console.error('Error in login:', err);
      throw err;
    }
    return null;
  }, []);

  const verifyMfa = useCallback(async (mfaToken: string, totpCode: string) => {
    try {
      const response = await api.auth.verifyLoginMfa(mfaToken, totpCode);
      if (response.isAuthenticated && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('perfx_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (err) {
      console.error('Error in verifyMfa:', err);
      throw err;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    clearTokens();
    localStorage.removeItem('perfx_user');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('perfx_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, verifyMfa, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
