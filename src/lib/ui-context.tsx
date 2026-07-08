'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';

interface UIContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  toastMessage: string;
  setToastMessage: (value: string) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const value = useMemo(
    () => ({ searchQuery, setSearchQuery, toastMessage, setToastMessage }),
    [searchQuery, toastMessage]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
