import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Screen } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { ACCENT_PRESETS, AccentKey, Colors, ThemeMode, spacing } from '../ui/theme';

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
];

export default function SettingsScreen() {
  const { colors, mode, setMode, accentKey, setAccentKey } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        <View style={styles.body}>
          <Card>
            <Text style={styles.sectionTitle}>Tema</Text>
            <View style={styles.optionsRow}>
              {MODE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setMode(opt.value)}
                  style={[styles.modeOption, mode === opt.value && styles.modeOptionSelected]}
                >
                  <Text style={[styles.modeOptionText, mode === opt.value && styles.modeOptionTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Color de acento</Text>
            <View style={styles.swatchRow}>
              {(Object.keys(ACCENT_PRESETS) as AccentKey[]).map((key) => {
                const preset = ACCENT_PRESETS[key];
                const swatchColor = preset.dark.accent;
                const selected = accentKey === key;
                return (
                  <Pressable key={key} onPress={() => setAccentKey(key)} style={styles.swatchWrap}>
                    <View style={[styles.swatch, { backgroundColor: swatchColor }, selected && styles.swatchSelected]}>
                      {selected && <Text style={styles.swatchCheck}>✓</Text>}
                    </View>
                    <Text style={styles.swatchLabel}>{preset.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Text style={styles.footer}>Preparacionista guarda todo localmente en este dispositivo. Sin cuentas, sin nube.</Text>
        </View>
      </Screen>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    title: { color: colors.text, fontSize: 24, fontWeight: '700' },
    body: { paddingHorizontal: spacing.lg },
    sectionTitle: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
    optionsRow: { flexDirection: 'row', gap: spacing.sm },
    modeOption: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
    },
    modeOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentMuted,
    },
    modeOptionText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
    modeOptionTextSelected: { color: colors.accent },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
    swatchWrap: { alignItems: 'center', width: 64 },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchSelected: { borderColor: colors.text },
    swatchCheck: { color: colors.background, fontWeight: '700' },
    swatchLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
    footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  });
}
