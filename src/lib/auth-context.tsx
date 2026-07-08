'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { AuthUser } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface AuthContextValue {
  user: AuthUser | null;
  signingIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let token: string | null = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

function getToken(): string | null {
  return token;
}

function setTokenInStorage(newToken: string | null) {
  token = newToken;
  if (newToken) {
    localStorage.setItem('api_token', newToken);
  } else {
    localStorage.removeItem('api_token');
  }
}

async function apiFetch<T = any>(method: string, path: string, body?: any): Promise<T> {
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data.message || data.error || 'Terjadi kesalahan';
    const error = new Error(message) as any;
    if (data.needs_verification) {
      error.needs_verification = true;
      error.email = data.email;
    }
    throw error;
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = getToken();
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiFetch<AuthUser>('GET', '/api/user');
        setUser(userData);
      } catch {
        setTokenInStorage(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setSigningIn(true);
    try {
      const data = await apiFetch<{ user: AuthUser; token: string }>('POST', '/api/login', { email, password });
      setTokenInStorage(data.token);
      setUser(data.user);
    } catch (err: any) {
      if (err?.needs_verification) throw err;
      throw err;
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await apiFetch('POST', '/api/logout');
    } catch {
      // ignore
    }
    setTokenInStorage(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, signingIn, isLoading, signIn, signOut }),
    [user, signingIn, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>('GET', path),
  post: <T = any>(path: string, body?: any) => apiFetch<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => apiFetch<T>('PUT', path, body),
  patch: <T = any>(path: string, body?: any) => apiFetch<T>('PATCH', path, body),
  delete: <T = any>(path: string) => apiFetch<T>('DELETE', path),
};
