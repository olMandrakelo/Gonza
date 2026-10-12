import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';

/** Font files bundled into the app and registered at startup via expo-font (see ThemeProvider). */
export const FONT_FILES = {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  Fraunces_700Bold,
  Figtree_600SemiBold,
  Figtree_700Bold,
};

export type FontKey = 'estilo' | 'jakarta' | 'barlow' | 'fraunces' | 'figtree' | 'mono';

export interface FontPair {
  /** Family used for screen titles and big figures. */
  title: string;
  /** Family used for small labels, numbers and tab captions. */
  label: string;
}

/** Each style's own pairing, used when the font picker is on "Según el estilo". */
export const STYLE_FONTS: Record<'limpio' | 'tactico' | 'oliva', FontPair> = {
  limpio: { title: 'PlusJakartaSans_700Bold', label: 'PlusJakartaSans_600SemiBold' },
  tactico: { title: 'BarlowCondensed_700Bold', label: 'BarlowCondensed_600SemiBold' },
  oliva: { title: 'Fraunces_700Bold', label: 'JetBrainsMono_500Medium' },
};

/** Explicit picks that override the style's title/label fonts. */
export const FONT_CHOICES: Record<Exclude<FontKey, 'estilo'>, { name: string; fonts: FontPair }> = {
  jakarta: { name: 'Jakarta', fonts: STYLE_FONTS.limpio },
  barlow: { name: 'Barlow', fonts: STYLE_FONTS.tactico },
  fraunces: { name: 'Fraunces', fonts: { title: 'Fraunces_700Bold', label: 'Figtree_600SemiBold' } },
  figtree: { name: 'Figtree', fonts: { title: 'Figtree_700Bold', label: 'Figtree_600SemiBold' } },
  mono: { name: 'Mono', fonts: { title: 'JetBrainsMono_700Bold', label: 'JetBrainsMono_500Medium' } },
};

export function normalizeFontKey(stored: string | null): FontKey | null {
  return stored === 'estilo' || (stored !== null && stored in FONT_CHOICES) ? (stored as FontKey) : null;
}
