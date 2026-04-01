import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { apiFetch, setTokens, clearTokens } from '../api/client';
import type { User } from '../types/user';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string, username?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<User>('/users/me')
      .then(setUser)
      .catch((err: unknown) => {
        if (err instanceof TypeError) {
          // Network error — tokens are still valid; just clear user state
          setUser(null);
        } else {
          // Auth error — tokens are invalid; clear them
          clearTokens();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  async function logout() {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    clearTokens();
    setUser(null);
  }

  async function register(email: string, name: string, password: string, username?: string) {
    const payload: Record<string, string> = { email, name, password };
    if (username && username.trim() !== '') {
      payload.username = username;
    }
    const data = await apiFetch<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(payload) }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
