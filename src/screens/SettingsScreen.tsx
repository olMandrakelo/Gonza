import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Label, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { ACCENT_PRESETS, AccentKey, Colors, ThemeMode, mono, radius, spacing } from '../ui/theme';

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
];

export default function SettingsScreen() {
  const { colors, scheme, mode, setMode, accentKey, setAccentKey } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader code="Sección 05 · Preferencias" title="Ajustes" />

        <ScrollView contentContainerStyle={styles.body}>
          <Card>
            <Label>Tema</Label>
            <View style={styles.seg}>
              {MODE_OPTIONS.map((opt) => {
                const on = mode === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setMode(opt.value)}
                    style={[styles.segItem, on && styles.segItemOn]}
                  >
                    <Text style={[styles.segText, on && styles.segTextOn]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Label>Color de acento</Label>
            <View style={styles.swatches}>
              {(Object.keys(ACCENT_PRESETS) as AccentKey[]).map((key) => {
                const preset = ACCENT_PRESETS[key];
                const on = accentKey === key;
                return (
                  <Pressable key={key} onPress={() => setAccentKey(key)} style={styles.sw}>
                    <View
                      style={[
                        styles.swDot,
                        { backgroundColor: preset[scheme].accent },
                        on && { borderColor: colors.text },
                      ]}
                    />
                    <Text style={styles.swLabel}>{preset.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Text style={styles.footer}>
            Preparacionista guarda todo en este teléfono. Sin cuentas, sin nube.
          </Text>
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    seg: { flexDirection: 'row', gap: spacing.sm },
    segItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    segItemOn: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    segText: { fontFamily: mono, fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
    segTextOn: { color: colors.accent },
    swatches: { flexDirection: 'row', gap: spacing.xl },
    sw: { alignItems: 'center', gap: spacing.sm },
    swDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swLabel: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
    footer: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.md,
      lineHeight: 18,
    },
  });
}
