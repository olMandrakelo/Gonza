import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

/** Monospace face — carries the field-inventory feel and aligns digits in columns. */
export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export type ThemeMode = 'dark' | 'light' | 'system';
export type Scheme = 'dark' | 'light';
export type AccentKey = 'senal' | 'oliva' | 'arena' | 'acero';

export const ACCENT_PRESETS: Record<
  AccentKey,
  {
    label: string;
    dark: { accent: string; accentMuted: string };
    light: { accent: string; accentMuted: string };
  }
> = {
  senal: {
    label: 'Señal',
    dark: { accent: '#D2601A', accentMuted: '#3A2A17' },
    light: { accent: '#B4531A', accentMuted: '#F0DFCE' },
  },
  oliva: {
    label: 'Oliva',
    dark: { accent: '#7A9E5B', accentMuted: '#2A3A22' },
    light: { accent: '#5C7B3E', accentMuted: '#DEE7D2' },
  },
  arena: {
    label: 'Arena',
    dark: { accent: '#C9A227', accentMuted: '#3A3117' },
    light: { accent: '#8A6A15', accentMuted: '#EFE5C6' },
  },
  acero: {
    label: 'Acero',
    dark: { accent: '#5B8299', accentMuted: '#1F3039' },
    light: { accent: '#3D6478', accentMuted: '#D8E4EA' },
  },
};

/** Accent keys used before the "campo" redesign, mapped to their closest match. */
const LEGACY_ACCENTS: Record<string, AccentKey> = {
  verde: 'oliva',
  celeste: 'acero',
  ambar: 'arena',
  violeta: 'senal',
};

export function normalizeAccentKey(stored: string | null): AccentKey | null {
  if (!stored) return null;
  if (stored in ACCENT_PRESETS) return stored as AccentKey;
  return LEGACY_ACCENTS[stored] ?? null;
}

/** Neutrals are biased toward olive rather than pure grey — canvas and equipment, not generic dark UI. */
const darkBase = {
  background: '#14170F',
  surface: '#1E2318',
  surfaceAlt: '#272D20',
  border: '#3A4230',
  text: '#E6E9DC',
  textMuted: '#9BA48C',
  danger: '#C4553F',
  warning: '#C9A227',
  ok: '#7A9E5B',
};

const lightBase = {
  background: '#E9E5D8',
  surface: '#F5F2E8',
  surfaceAlt: '#DFDACA',
  border: '#C6BFAC',
  text: '#1F2318',
  textMuted: '#6B7259',
  danger: '#A8412C',
  warning: '#8A6A15',
  ok: '#5C7B3E',
};

export function buildColors(scheme: Scheme, accentKey: AccentKey) {
  const base = scheme === 'dark' ? darkBase : lightBase;
  const accent = ACCENT_PRESETS[accentKey][scheme];
  return { ...base, accent: accent.accent, accentMuted: accent.accentMuted };
}

export type Colors = ReturnType<typeof buildColors>;

/** Progress colour by how far along something is: short → accent, halfway → sand, on track → olive. */
export function progressColor(colors: Colors, ratio: number) {
  if (ratio >= 0.7) return colors.ok;
  if (ratio >= 0.4) return colors.warning;
  return colors.accent;
}
