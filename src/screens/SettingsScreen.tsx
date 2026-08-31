import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Label, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { ACCENT_PRESETS, AccentKey, Colors, ThemeMode, mono, radius, spacing } from '../ui/theme';
import { APP_ICONS, applyIcon, currentIconKey, iconsSupported } from '../ui/appIcon';

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
];

export default function SettingsScreen() {
  const { colors, scheme, mode, setMode, accentKey, setAccentKey } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const canSwitchIcon = iconsSupported();
  const [iconKey, setIconKey] = useState<string | null>(() => currentIconKey());

  async function chooseIcon(key: string | null) {
    if (key === iconKey) return;
    const previous = iconKey;
    setIconKey(key);
    const ok = await applyIcon(key);
    if (!ok) setIconKey(previous);
  }

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

          {canSwitchIcon && (
            <Card>
              <Label>Ícono de la app</Label>
              <View style={styles.icons}>
                {APP_ICONS.map((opt) => {
                  const on = iconKey === opt.key;
                  return (
                    <Pressable key={opt.label} onPress={() => chooseIcon(opt.key)} style={styles.iconOpt}>
                      <Image
                        source={opt.preview}
                        style={[styles.iconImg, on && { borderColor: colors.accent, borderWidth: 3 }]}
                      />
                      <Text style={[styles.iconLabel, on && { color: colors.accent }]}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.iconNote}>
                Al cambiarlo, Android puede cerrar la app y el ícono puede tardar unos segundos en
                actualizarse en la pantalla de inicio.
              </Text>
            </Card>
          )}

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
    icons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    iconOpt: { alignItems: 'center', gap: spacing.sm, width: 62 },
    iconImg: {
      width: 54,
      height: 54,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconLabel: { fontFamily: mono, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
    iconNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.md },
    footer: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: spacing.md,
      lineHeight: 18,
    },
  });
}
