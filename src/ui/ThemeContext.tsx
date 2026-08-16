import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccentKey, Colors, Scheme, ThemeMode, buildColors, normalizeAccentKey, radius, spacing } from './theme';

const MODE_KEY = 'gonza:theme-mode';
const ACCENT_KEY = 'gonza:theme-accent';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accentKey: AccentKey;
  setAccentKey: (a: AccentKey) => void;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  scheme: Scheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentKey, setAccentKeyState] = useState<AccentKey>('senal');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([AsyncStorage.getItem(MODE_KEY), AsyncStorage.getItem(ACCENT_KEY)]).then(
      ([storedMode, storedAccent]) => {
        if (cancelled) return;
        if (storedMode === 'dark' || storedMode === 'light' || storedMode === 'system') setModeState(storedMode);
        const accent = normalizeAccentKey(storedAccent);
        if (accent) setAccentKeyState(accent);
        setLoaded(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m);
  }, []);

  const setAccentKey = useCallback((a: AccentKey) => {
    setAccentKeyState(a);
    AsyncStorage.setItem(ACCENT_KEY, a);
  }, []);

  const scheme: Scheme = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const colors = useMemo(() => buildColors(scheme, accentKey), [scheme, accentKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, accentKey, setAccentKey, colors, spacing, radius, scheme }),
    [mode, setMode, accentKey, setAccentKey, colors, scheme]
  );

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
