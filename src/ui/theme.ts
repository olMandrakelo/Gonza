export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export type ThemeMode = 'dark' | 'light' | 'system';
export type Scheme = 'dark' | 'light';
export type AccentKey = 'verde' | 'celeste' | 'ambar' | 'violeta';

export const ACCENT_PRESETS: Record<
  AccentKey,
  {
    label: string;
    dark: { accent: string; accentMuted: string };
    light: { accent: string; accentMuted: string };
  }
> = {
  verde: {
    label: 'Verde',
    dark: { accent: '#5FBF7A', accentMuted: '#2E4A38' },
    light: { accent: '#2F9E57', accentMuted: '#DCF3E3' },
  },
  celeste: {
    label: 'Celeste',
    dark: { accent: '#5BA8E0', accentMuted: '#234459' },
    light: { accent: '#2C7FC1', accentMuted: '#DCEEFB' },
  },
  ambar: {
    label: 'Ámbar',
    dark: { accent: '#D8B45C', accentMuted: '#4A3D22' },
    light: { accent: '#B98A2E', accentMuted: '#FBF0D9' },
  },
  violeta: {
    label: 'Violeta',
    dark: { accent: '#9B7FE0', accentMuted: '#3A2F59' },
    light: { accent: '#7B5FCB', accentMuted: '#EBE4FB' },
  },
};

const darkBase = {
  background: '#0F1512',
  surface: '#1B2420',
  surfaceAlt: '#243029',
  border: '#33413A',
  text: '#EAF2ED',
  textMuted: '#9AAAA1',
  danger: '#E0665A',
  warning: '#D8B45C',
};

const lightBase = {
  background: '#F4F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3F0',
  border: '#DCE3DF',
  text: '#132018',
  textMuted: '#5C6B62',
  danger: '#C94B3F',
  warning: '#8A6A1E',
};

export function buildColors(scheme: Scheme, accentKey: AccentKey) {
  const base = scheme === 'dark' ? darkBase : lightBase;
  const accent = ACCENT_PRESETS[accentKey][scheme];
  return { ...base, accent: accent.accent, accentMuted: accent.accentMuted };
}

export type Colors = ReturnType<typeof buildColors>;
