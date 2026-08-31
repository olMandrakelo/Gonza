import React from 'react';
import { View } from 'react-native';

/**
 * Tab icons drawn from plain Views (borders + radii) instead of SVG or an icon font.
 * Both of those are native modules, and adding one would force a fresh native build —
 * these ship as ordinary JS, so icon changes go out as over-the-air updates.
 *
 * Every icon is laid out inside a 20x20 box with a shared 1.5px stroke so the set
 * reads as one family.
 */

const BOX = 20;
const STROKE = 1.5;

type IconProps = { color: string; bg: string };

function Box({ children }: { children: React.ReactNode }) {
  return <View style={{ width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}

/** Backpack — gear and supplies. */
export function BackpackIcon({ color }: IconProps) {
  return (
    <Box>
      <View style={{ width: 9, height: 5, borderWidth: STROKE, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} />
      <View style={{ width: 16, height: 12, borderWidth: STROKE, borderColor: color, borderRadius: 4, alignItems: 'center', paddingTop: 4 }}>
        <View style={{ width: 8, height: STROKE, backgroundColor: color }} />
      </View>
    </Box>
  );
}

/** Open book — courses. */
export function BookIcon({ color }: IconProps) {
  const page = {
    width: 7.5,
    height: 15,
    borderWidth: STROKE,
    borderColor: color,
  } as const;
  return (
    <Box>
      <View style={{ flexDirection: 'row', gap: 1 }}>
        <View style={{ ...page, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }} />
        <View style={{ ...page, borderTopRightRadius: 2, borderBottomRightRadius: 2 }} />
      </View>
    </Box>
  );
}

/** Concentric target — drills and practice. */
export function TargetIcon({ color }: IconProps) {
  return (
    <Box>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: STROKE, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: STROKE, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
        </View>
      </View>
    </Box>
  );
}

/** Sheet with ruled lines — study material. */
export function DocIcon({ color }: IconProps) {
  return (
    <Box>
      <View style={{ width: 13, height: 16, borderWidth: STROKE, borderColor: color, borderRadius: 2, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <View style={{ width: 7, height: STROKE, backgroundColor: color }} />
        <View style={{ width: 7, height: STROKE, backgroundColor: color }} />
        <View style={{ width: 4, height: STROKE, backgroundColor: color }} />
      </View>
    </Box>
  );
}

/** Sliders — settings. */
export function SlidersIcon({ color, bg }: IconProps) {
  const rows = [13, 6, 10];
  return (
    <Box>
      <View style={{ gap: 4 }}>
        {rows.map((knobX, i) => (
          <View key={i} style={{ width: 18, height: 6, justifyContent: 'center' }}>
            <View style={{ width: 18, height: STROKE, backgroundColor: color }} />
            <View
              style={{
                position: 'absolute',
                left: knobX - 3,
                width: 6,
                height: 6,
                borderRadius: 1.5,
                borderWidth: STROKE,
                borderColor: color,
                backgroundColor: bg,
              }}
            />
          </View>
        ))}
      </View>
    </Box>
  );
}

/** Two overlapping figures — family. */
export function FamilyIcon({ color, bg }: IconProps) {
  const head = (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: STROKE,
    borderColor: color,
    backgroundColor: bg,
  });
  const body = (w: number, h: number) => ({
    width: w,
    height: h,
    borderWidth: STROKE,
    borderColor: color,
    backgroundColor: bg,
    borderTopLeftRadius: w / 2,
    borderTopRightRadius: w / 2,
    borderBottomWidth: 0,
  });
  return (
    <Box>
      <View style={{ width: 20, height: 18 }}>
        <View style={{ position: 'absolute', left: 0, bottom: 0, alignItems: 'center' }}>
          <View style={head(6)} />
          <View style={[body(11, 7), { marginTop: 1 }]} />
        </View>
        <View style={{ position: 'absolute', right: 0, bottom: 0, alignItems: 'center' }}>
          <View style={head(6)} />
          <View style={[body(11, 7), { marginTop: 1 }]} />
        </View>
      </View>
    </Box>
  );
}

export const TAB_ICONS: Record<string, React.ComponentType<IconProps>> = {
  Equipo: BackpackIcon,
  Cursos: BookIcon,
  Práctica: TargetIcon,
  Material: DocIcon,
  Familia: FamilyIcon,
  Ajustes: SlidersIcon,
};
