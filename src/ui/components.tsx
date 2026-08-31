import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { Colors, mono, radius, spacing } from './theme';

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
}

/** Section code + title, the two-line masthead every screen opens with. */
export function ScreenHeader({
  code,
  title,
  right,
}: {
  code: string;
  title: string;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={styles.headerCode} numberOfLines={1}>
          {code}
        </Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

/** Segmented readiness gauge — reads as a fuel/ammo gauge rather than a smooth web bar. */
export function Meter({ ratio, segments = 20 }: { ratio: number; segments?: number }) {
  const { colors } = useTheme();
  const filled = Math.round(Math.max(0, Math.min(1, ratio)) * segments);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: segments }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 9,
            borderRadius: 1,
            backgroundColor: i < filled ? colors.accent : colors.surfaceAlt,
          }}
        />
      ))}
    </View>
  );
}

export function Bar({ ratio, color }: { ratio: number; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
      <View
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <Text style={styles.label}>{children}</Text>;
}

export function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.card}>{children}</View>;
}

export function Field({ label, ...rest }: { label: string } & TextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...rest} />
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'secondary' && styles.buttonSecondary, variant === 'danger' && styles.buttonDanger]}
    >
      <Text style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    headerText: { flex: 1 },
    headerCode: {
      fontFamily: mono,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.accent,
    },
    headerTitle: {
      fontFamily: mono,
      fontSize: 25,
      fontWeight: '700',
      color: colors.text,
      marginTop: 1,
    },
    label: {
      fontFamily: mono,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    fieldWrap: {
      marginBottom: spacing.md,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      fontSize: 15,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    chipSelected: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    chipText: {
      fontFamily: mono,
      fontSize: 11,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    chipTextSelected: {
      color: colors.accent,
      fontWeight: '700',
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonDanger: {
      backgroundColor: colors.danger,
    },
    buttonText: {
      fontFamily: mono,
      color: colors.background,
      fontWeight: '700',
      fontSize: 13,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    emptyWrap: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 14,
    },
  });
}
