import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccentKey,
  Colors,
  STYLE_PRESETS,
  Scheme,
  StyleKey,
  ThemeMode,
  buildColors,
  normalizeAccentKey,
  normalizeStyleKey,
  spacing,
} from './theme';

const MODE_KEY = 'gonza:theme-mode';
const ACCENT_KEY = 'gonza:theme-accent';
const STYLE_KEY = 'gonza:theme-style';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accentKey: AccentKey;
  setAccentKey: (a: AccentKey) => void;
  styleKey: StyleKey;
  /** Switches the whole look and resets the accent to that style's default; pick an accent afterwards to override. */
  setStyleKey: (s: StyleKey) => void;
  colors: Colors;
  spacing: typeof spacing;
  scheme: Scheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentKey, setAccentKeyState] = useState<AccentKey>('senal');
  const [styleKey, setStyleKeyState] = useState<StyleKey>('oliva');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(MODE_KEY),
      AsyncStorage.getItem(ACCENT_KEY),
      AsyncStorage.getItem(STYLE_KEY),
    ]).then(
      ([storedMode, storedAccent, storedStyle]) => {
        if (cancelled) return;
        if (storedMode === 'dark' || storedMode === 'light' || storedMode === 'system') setModeState(storedMode);
        const accent = normalizeAccentKey(storedAccent);
        if (accent) setAccentKeyState(accent);
        const style = normalizeStyleKey(storedStyle);
        if (style) setStyleKeyState(style);
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

  const setStyleKey = useCallback((st: StyleKey) => {
    const accent = STYLE_PRESETS[st].defaultAccent;
    setStyleKeyState(st);
    setAccentKeyState(accent);
    AsyncStorage.setItem(STYLE_KEY, st);
    AsyncStorage.setItem(ACCENT_KEY, accent);
  }, []);

  const scheme: Scheme = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const colors = useMemo(() => buildColors(scheme, accentKey, styleKey), [scheme, accentKey, styleKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, accentKey, setAccentKey, styleKey, setStyleKey, colors, spacing, scheme }),
    [mode, setMode, accentKey, setAccentKey, styleKey, setStyleKey, colors, scheme]
  );

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
