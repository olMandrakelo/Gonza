import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Label, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import * as Updates from 'expo-updates';
import { DEFAULT_SETTINGS, ReminderSettings, ensureReminderPermission, loadReminderSettings, saveReminderSettings } from '../notifications';
import { applyBackup, exportBackup, pickBackup } from '../backup';
import { FONT_CHOICES, FontKey } from '../ui/fonts';
import { ICON_SETS, TabIcon } from '../ui/icons';
import { ACCENT_PRESETS, AccentKey, Colors, STYLE_PRESETS, StyleKey, ThemeMode, spacing } from '../ui/theme';
import { APP_ICONS, applyIcon, currentIconKey, iconsSupported } from '../ui/appIcon';

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
];

export default function SettingsScreen() {
  const { colors, scheme, mode, setMode, accentKey, setAccentKey, styleKey, setStyleKey, fontKey, setFontKey, iconSet, setIconSet } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const canSwitchIcon = iconsSupported();
  const [iconKey, setIconKey] = useState<string | null>(() => currentIconKey());

  const [reminders, setReminders] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    loadReminderSettings().then(setReminders);
  }, []);

  async function updateReminders(patch: Partial<ReminderSettings>) {
    const next = { ...reminders, ...patch };
    if (patch.enabled && !(await ensureReminderPermission())) {
      Alert.alert('Sin permiso', 'Activá las notificaciones de Preparacionista en los ajustes del teléfono.');
      return;
    }
    setReminders(next);
    await saveReminderSettings(next);
    // Inicio reschedules from fresh data the next time it is focused.
  }

  async function handleExport() {
    try {
      await exportBackup();
    } catch (e: any) {
      Alert.alert('No se pudo exportar', e?.message ?? 'Probá de nuevo.');
    }
  }

  async function handleRestore() {
    try {
      const backup = await pickBackup();
      if (!backup) return;
      Alert.alert(
        'Restaurar copia',
        `Se reemplaza todo lo que hay en la app por la copia${backup.exportedAt ? ` del ${backup.exportedAt.slice(0, 10)}` : ''}. No se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              await applyBackup(backup);
              try {
                await Updates.reloadAsync();
              } catch {
                Alert.alert('Copia restaurada', 'Cerrá la app del todo y volvé a abrirla para ver los datos.');
              }
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('No se pudo leer la copia', e?.message ?? 'Probá con otro archivo.');
    }
  }

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
            <Label>Estilo</Label>
            <View style={styles.styleRow}>
              {(Object.keys(STYLE_PRESETS) as StyleKey[]).map((key) => {
                const preset = STYLE_PRESETS[key];
                const p = preset[scheme];
                const on = styleKey === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setStyleKey(key)}
                    style={[styles.styleTile, on && { borderColor: colors.accent, borderWidth: 2 }]}
                  >
                    <View style={[styles.stylePreview, { backgroundColor: p.background, borderRadius: preset.radius.md }]}>
                      <View
                        style={{
                          backgroundColor: p.surface,
                          borderColor: p.border,
                          borderWidth: preset.elevated ? 0 : 1,
                          borderRadius: preset.radius.sm,
                          height: 18,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: ACCENT_PRESETS[preset.defaultAccent][scheme].accent,
                          borderRadius: preset.radius.sm,
                          height: 6,
                          width: '60%',
                        }}
                      />
                    </View>
                    <Text style={[styles.styleName, on && { color: colors.accent }]}>{preset.label}</Text>
                    <Text style={styles.styleDesc}>{preset.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Label>Recordatorios</Label>
            <Text style={styles.iconNote}>
              Avisos en el celular antes de que venza algo o cuando toca un control (pilas, baterías). Funcionan sin
              internet; algunos teléfonos los demoran si ahorran batería.
            </Text>
            <View style={styles.seg}>
              {[{ v: true, label: 'Activados' }, { v: false, label: 'Apagados' }].map((o) => {
                const on = reminders.enabled === o.v;
                return (
                  <Pressable key={o.label} onPress={() => updateReminders({ enabled: o.v })} style={[styles.segItem, on && styles.segItemOn]}>
                    <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {reminders.enabled && (
              <View style={[styles.seg, { marginTop: spacing.sm }]}>
                {[3, 7, 14].map((d) => {
                  const on = reminders.leadDays === d;
                  return (
                    <Pressable key={d} onPress={() => updateReminders({ leadDays: d })} style={[styles.segItem, on && styles.segItemOn]}>
                      <Text style={[styles.segText, on && styles.segTextOn]}>{d} días antes</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>

          <Card>
            <Label>Copia de seguridad</Label>
            <Text style={styles.iconNote}>
              Guarda todo (equipo, mochilas, familia, plan, cursos, notas) en un archivo que podés mandarte por WhatsApp o
              guardar en Drive.
            </Text>
            <View style={styles.backupRow}>
              <Button title="Exportar copia" onPress={handleExport} />
              <Button title="Restaurar copia" variant="secondary" onPress={handleRestore} />
            </View>
          </Card>

          <Card>
            <Label>Íconos de la barra</Label>
            <View style={styles.styleRow}>
              {ICON_SETS.map((opt) => {
                const on = iconSet === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setIconSet(opt.key)}
                    style={[styles.styleTile, on && { borderColor: colors.accent, borderWidth: 2 }]}
                  >
                    <View style={styles.iconPreviewRow}>
                      {['Inicio', 'Equipo', 'Familia'].map((n) => (
                        <TabIcon key={n} name={n} variant={opt.key} size={22} color={on ? colors.accent : colors.text} />
                      ))}
                    </View>
                    <Text style={[styles.styleName, on && { color: colors.accent }]}>{opt.label}</Text>
                    <Text style={styles.styleDesc}>{opt.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Label>Fuente de títulos</Label>
            <View style={styles.fontRow}>
              {(['estilo', ...Object.keys(FONT_CHOICES)] as FontKey[]).map((key) => {
                const on = fontKey === key;
                const family = key === 'estilo' ? colors.fonts.title : FONT_CHOICES[key as Exclude<FontKey, 'estilo'>].fonts.title;
                return (
                  <Pressable key={key} onPress={() => setFontKey(key)} style={[styles.fontChip, on && styles.segItemOn]}>
                    <Text style={[styles.fontChipText, { fontFamily: family }, on && styles.segTextOn]}>
                      {key === 'estilo' ? 'Según el estilo' : FONT_CHOICES[key as Exclude<FontKey, 'estilo'>].name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

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
      borderRadius: colors.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    segItemOn: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    segText: { fontFamily: colors.fonts.label, fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
    segTextOn: { color: colors.accent },
    backupRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    iconPreviewRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: colors.background, borderRadius: colors.radius.sm },
    fontRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    fontChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: colors.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    fontChipText: { fontSize: 15, color: colors.textMuted },
    styleRow: { flexDirection: 'row', gap: spacing.sm },
    styleTile: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: colors.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      gap: 4,
    },
    stylePreview: { padding: 6, gap: 6, height: 46, justifyContent: 'center' },
    styleName: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 2 },
    styleDesc: { color: colors.textMuted, fontSize: 10, lineHeight: 13 },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
    sw: { alignItems: 'center', gap: spacing.sm },
    swDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swLabel: { fontFamily: colors.fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
    icons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    iconOpt: { alignItems: 'center', gap: spacing.sm, width: 62 },
    iconImg: {
      width: 54,
      height: 54,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconLabel: { fontFamily: colors.fonts.label, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textMuted },
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
