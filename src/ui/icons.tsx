import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSet, useTheme } from './ThemeContext';

/**
 * Tab icons drawn with react-native-svg (a native module — added in the 1.3.0 build). Three
 * variants the user picks in Ajustes: fino (thin stroke), grueso (thick stroke) and duotono
 * (stroke plus a soft fill of the same colour).
 */
const PATHS: Record<string, string> = {
  Inicio: 'M3 11l9-8 9 8v10H3z M9 21v-6h6v6',
  Equipo: 'M8 7V5a4 4 0 0 1 8 0v2 M5 9a3 3 0 0 1 3-2h8a3 3 0 0 1 3 2v11H5z M9 15h6',
  Cursos: 'M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v15h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z M12 5v15',
  Práctica: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z',
  Material: 'M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6',
  Familia: 'M9 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M3 20a6 6 0 0 1 12 0 M16 11a2.5 2.5 0 1 0 0-5 M17 14a5 5 0 0 1 4 6',
  Ajustes: 'M4 7h10 M18 7h2 M4 17h2 M10 17h10 M16 5v4 M8 15v4',
};

export const ICON_SETS: { key: 'fino' | 'grueso' | 'duotono'; label: string; description: string }[] = [
  { key: 'fino', label: 'Fino', description: 'Línea delgada' },
  { key: 'grueso', label: 'Grueso', description: 'Línea marcada' },
  { key: 'duotono', label: 'Duotono', description: 'Línea con relleno' },
];

export function TabIcon({ name, color, size = 24, variant }: { name: string; color: string; size?: number; variant?: IconSet }) {
  const theme = useTheme();
  const iconSet = variant ?? theme.iconSet;
  const d = PATHS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={iconSet === 'duotono' ? color : 'none'} fillOpacity={iconSet === 'duotono' ? 0.18 : 0}>
      <Path
        d={d}
        stroke={color}
        strokeWidth={iconSet === 'grueso' ? 2.4 : iconSet === 'duotono' ? 1.8 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={iconSet === 'duotono' ? color : 'none'}
        fillOpacity={iconSet === 'duotono' ? 0.18 : 0}
      />
    </Svg>
  );
}
