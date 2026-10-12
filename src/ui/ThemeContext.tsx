import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
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
import { FONT_FILES, FontKey, normalizeFontKey } from './fonts';

export type IconSet = 'fino' | 'grueso' | 'duotono';

const MODE_KEY = 'gonza:theme-mode';
const ACCENT_KEY = 'gonza:theme-accent';
const STYLE_KEY = 'gonza:theme-style';
const FONT_KEY = 'gonza:theme-font';
const ICON_KEY = 'gonza:theme-icons';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accentKey: AccentKey;
  setAccentKey: (a: AccentKey) => void;
  styleKey: StyleKey;
  /** Switches the whole look and resets the accent to that style's default; pick an accent afterwards to override. */
  setStyleKey: (s: StyleKey) => void;
  fontKey: FontKey;
  setFontKey: (f: FontKey) => void;
  iconSet: IconSet;
  setIconSet: (i: IconSet) => void;
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
  const [fontKey, setFontKeyState] = useState<FontKey>('estilo');
  const [iconSet, setIconSetState] = useState<IconSet>('fino');
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(MODE_KEY),
      AsyncStorage.getItem(ACCENT_KEY),
      AsyncStorage.getItem(STYLE_KEY),
      AsyncStorage.getItem(FONT_KEY),
      AsyncStorage.getItem(ICON_KEY),
    ]).then(
      ([storedMode, storedAccent, storedStyle, storedFont, storedIcons]) => {
        if (cancelled) return;
        if (storedMode === 'dark' || storedMode === 'light' || storedMode === 'system') setModeState(storedMode);
        const accent = normalizeAccentKey(storedAccent);
        if (accent) setAccentKeyState(accent);
        const style = normalizeStyleKey(storedStyle);
        if (style) setStyleKeyState(style);
        const font = normalizeFontKey(storedFont);
        if (font) setFontKeyState(font);
        if (storedIcons === 'fino' || storedIcons === 'grueso' || storedIcons === 'duotono') setIconSetState(storedIcons);
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

  const setFontKey = useCallback((f: FontKey) => {
    setFontKeyState(f);
    AsyncStorage.setItem(FONT_KEY, f);
  }, []);

  const setIconSet = useCallback((i: IconSet) => {
    setIconSetState(i);
    AsyncStorage.setItem(ICON_KEY, i);
  }, []);

  const scheme: Scheme = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const colors = useMemo(() => buildColors(scheme, accentKey, styleKey, fontKey), [scheme, accentKey, styleKey, fontKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, accentKey, setAccentKey, styleKey, setStyleKey, fontKey, setFontKey, iconSet, setIconSet, colors, spacing, scheme }),
    [mode, setMode, accentKey, setAccentKey, styleKey, setStyleKey, fontKey, setFontKey, iconSet, setIconSet, colors, scheme]
  );

  // Hold the first frame until stored preferences and the bundled fonts are ready (a font error still proceeds).
  if (!loaded || !(fontsLoaded || fontError)) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
