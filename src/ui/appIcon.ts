import type { ImageSourcePropType } from 'react-native';

/**
 * Launcher-icon switching, wrapped so the app degrades instead of crashing.
 *
 * `expo-alternate-app-icons` is a native module: it only exists in a binary built
 * after it was added. An over-the-air update can reach an older install that has
 * no such module, so the require is guarded and every call is a no-op when the
 * module is missing — `iconsSupported()` is what the UI keys off.
 */

type IconModule = {
  supportsAlternateIcons: boolean;
  getAppIconName: () => string | null;
  setAlternateAppIcon: (name: string | null) => Promise<string | null>;
};

let mod: IconModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mod = require('expo-alternate-app-icons') as IconModule;
} catch {
  mod = null;
}

/** `null` is the icon baked in as the default — the library resets to it with null. */
export interface AppIconOption {
  key: string | null;
  label: string;
  preview: ImageSourcePropType;
}

export const APP_ICONS: AppIconOption[] = [
  { key: null, label: 'Anillo', preview: require('../../assets/icon.png') },
  { key: 'Casilla', label: 'Casilla', preview: require('../../assets/icon-casilla.png') },
  { key: 'Medidor', label: 'Medidor', preview: require('../../assets/icon-medidor.png') },
  { key: 'Mochila', label: 'Mochila', preview: require('../../assets/icon-mochila.png') },
  { key: 'Brujula', label: 'Brújula', preview: require('../../assets/icon-brujula.png') },
];

export function iconsSupported(): boolean {
  return !!mod?.supportsAlternateIcons;
}

export function currentIconKey(): string | null {
  if (!mod) return null;
  try {
    const name = mod.getAppIconName();
    // The library reports the default icon under a placeholder name, not our key.
    if (!name || name === 'DEFAULT') return null;
    return APP_ICONS.some((i) => i.key === name) ? name : null;
  } catch {
    return null;
  }
}

export async function applyIcon(key: string | null): Promise<boolean> {
  if (!mod) return false;
  try {
    await mod.setAlternateAppIcon(key);
    return true;
  } catch {
    return false;
  }
}
