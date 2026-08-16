import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { Colors, radius, spacing } from './theme';

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
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
      <Text style={styles.fieldLabel}>{label}</Text>
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
    fieldLabel: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: spacing.xs,
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
      borderRadius: radius.lg,
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
      color: colors.textMuted,
      fontSize: 13,
    },
    chipTextSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
    button: {
      backgroundColor: colors.accent,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm + 2,
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
      color: colors.background,
      fontWeight: '700',
      fontSize: 15,
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    emptyWrap: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
