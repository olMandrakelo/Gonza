import { Platform } from 'react-native';
import { FONT_CHOICES, FontKey, STYLE_FONTS } from './fonts';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/** Monospace face — carries the field-inventory feel and aligns digits in columns. */
export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export type ThemeMode = 'dark' | 'light' | 'system';
export type Scheme = 'dark' | 'light';
export type AccentKey = 'senal' | 'oliva' | 'arena' | 'acero' | 'menta' | 'dorado';
export type StyleKey = 'limpio' | 'tactico' | 'oliva';

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
  menta: {
    label: 'Menta',
    dark: { accent: '#2DB5A3', accentMuted: '#16322F' },
    light: { accent: '#0F766E', accentMuted: '#D9EEEA' },
  },
  dorado: {
    label: 'Dorado',
    dark: { accent: '#F59E0B', accentMuted: '#3A2C0E' },
    light: { accent: '#B45309', accentMuted: '#F6E7CE' },
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

type BasePalette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  danger: string;
  warning: string;
  ok: string;
};


export interface StylePreset {
  label: string;
  description: string;
  defaultAccent: AccentKey;
  radius: { sm: number; md: number; lg: number };
  fonts: { title: string; label: string };
  titleTransform: 'none' | 'uppercase';
  /** Cards float on a soft shadow instead of a hairline border. */
  elevated: boolean;
  dark: BasePalette;
  light: BasePalette;
}

/**
 * A "style" is the app's whole look: palette (per light/dark), corner radii, typefaces and
 * whether cards use shadow or border. System font families only — web fonts would need a native
 * font module, which would break OTA updates.
 */
export const STYLE_PRESETS: Record<StyleKey, StylePreset> = {
  limpio: {
    label: 'Limpio',
    description: 'Claro, tarjetas redondeadas',
    defaultAccent: 'menta',
    radius: { sm: 10, md: 16, lg: 22 },
    fonts: STYLE_FONTS.limpio,
    titleTransform: 'none',
    elevated: true,
    light: {
      background: '#F3F5F4',
      surface: '#FFFFFF',
      surfaceAlt: '#E6ECEA',
      border: '#E1E8E5',
      text: '#14201D',
      textMuted: '#5E6E69',
      danger: '#C2412D',
      warning: '#B7791F',
      ok: '#0F766E',
    },
    dark: {
      background: '#101514',
      surface: '#1A2120',
      surfaceAlt: '#232C2A',
      border: '#2A3432',
      text: '#E8EEEC',
      textMuted: '#8FA19C',
      danger: '#E0604B',
      warning: '#E0A63A',
      ok: '#2DB5A3',
    },
  },
  tactico: {
    label: 'Táctico',
    description: 'Oscuro, alto contraste',
    defaultAccent: 'dorado',
    radius: { sm: 4, md: 8, lg: 12 },
    fonts: STYLE_FONTS.tactico,
    titleTransform: 'uppercase',
    elevated: false,
    light: {
      background: '#E7E5E0',
      surface: '#F4F2EE',
      surfaceAlt: '#D9D6CE',
      border: '#BDB9AE',
      text: '#16181A',
      textMuted: '#60646A',
      danger: '#B3321F',
      warning: '#B45309',
      ok: '#3F7D4E',
    },
    dark: {
      background: '#0E0F10',
      surface: '#17191B',
      surfaceAlt: '#232629',
      border: '#2A2D30',
      text: '#ECECEA',
      textMuted: '#9A9C9E',
      danger: '#FF6B5B',
      warning: '#F59E0B',
      ok: '#6FBF7F',
    },
  },
  oliva: {
    label: 'Oliva',
    description: 'Verde oliva, tipografía serif',
    defaultAccent: 'senal',
    radius: { sm: 6, md: 10, lg: 14 },
    fonts: STYLE_FONTS.oliva,
    titleTransform: 'none',
    elevated: false,
    light: {
      background: '#E9E5D8',
      surface: '#F5F2E8',
      surfaceAlt: '#DFDACA',
      border: '#C6BFAC',
      text: '#1F2318',
      textMuted: '#6B7259',
      danger: '#A8412C',
      warning: '#8A6A15',
      ok: '#5C7B3E',
    },
    dark: {
      background: '#14170F',
      surface: '#1E2318',
      surfaceAlt: '#272D20',
      border: '#3A4230',
      text: '#E6E9DC',
      textMuted: '#9BA48C',
      danger: '#C4553F',
      warning: '#C9A227',
      ok: '#7A9E5B',
    },
  },
};

export function normalizeStyleKey(stored: string | null): StyleKey | null {
  return stored === 'limpio' || stored === 'tactico' || stored === 'oliva' ? stored : null;
}

export function buildColors(
  scheme: Scheme,
  accentKey: AccentKey,
  styleKey: StyleKey = 'oliva',
  fontKey: FontKey = 'estilo'
) {
  const preset = STYLE_PRESETS[styleKey];
  const base = preset[scheme];
  const accent = ACCENT_PRESETS[accentKey][scheme];
  return {
    ...base,
    accent: accent.accent,
    accentMuted: accent.accentMuted,
    radius: preset.radius,
    fonts: fontKey === 'estilo' ? preset.fonts : FONT_CHOICES[fontKey].fonts,
    titleTransform: preset.titleTransform,
    elevated: preset.elevated,
  };
}

export type Colors = ReturnType<typeof buildColors>;

/** Progress colour by how far along something is: short → accent, halfway → sand, on track → olive. */
export function progressColor(colors: Colors, ratio: number) {
  if (ratio >= 0.7) return colors.ok;
  if (ratio >= 0.4) return colors.warning;
  return colors.accent;
}
