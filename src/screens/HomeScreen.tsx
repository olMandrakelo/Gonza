import React, { useCallback, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Bar, Button, Card, EmptyState, Label, Meter, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, progressColor, spacing } from '../ui/theme';
import { useStorageList, useStorageObject } from '../storage';
import { Bag, Course, FamilyMember, FamilyPlan, GearItem, emptyFamilyPlan } from '../types';
import { byBag, readiness, topPending } from '../progress';
import { GearAlert, computeAlerts } from '../alerts';
import { EMERGENCY_NUMBERS } from '../emergencyNumbers';

const QUICK_NUMBERS = EMERGENCY_NUMBERS.filter((n) => n.dial === '911' || n.dial === '107');

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();

  const { items, loading, reload: reloadGear } = useStorageList<GearItem>('gonza:gear');
  const { items: bags, reload: reloadBags } = useStorageList<Bag>('gonza:bags');
  const { items: courses, reload: reloadCourses } = useStorageList<Course>('gonza:courses');
  const { items: members, reload: reloadMembers } = useStorageList<FamilyMember>('gonza:family');
  const { value: plan, reload: reloadPlan } = useStorageObject<FamilyPlan>('gonza:family-plan', emptyFamilyPlan);

  // Tabs stay mounted, so each hook only read storage once at startup; refresh whenever Inicio regains focus.
  useFocusEffect(
    useCallback(() => {
      reloadGear();
      reloadBags();
      reloadCourses();
      reloadMembers();
      reloadPlan();
    }, [reloadGear, reloadBags, reloadCourses, reloadMembers, reloadPlan])
  );

  const stats = useMemo(() => readiness(items), [items]);
  const bagRows = useMemo(() => byBag(items, bags).filter((r) => r.total > 0), [items, bags]);
  const pending = useMemo(() => topPending(items, 5), [items]);
  const pct = Math.round(stats.ratio * 100);
  const alerts = useMemo(() => computeAlerts(items), [items]);

  function alertText(a: GearAlert) {
    if (a.kind === 'vencido') return `${a.item.name} — vencido`;
    if (a.kind === 'vence') return `${a.item.name} — vence en ${a.daysLeft} ${a.daysLeft === 1 ? 'día' : 'días'}`;
    return a.item.lastReviewedAt ? `${a.item.name} — toca revisar` : `${a.item.name} — sin revisar todavía`;
  }

  const notices: string[] = [];
  if (!plan.address.trim()) notices.push('Tu plan de emergencia no tiene dirección.');
  if (!plan.routes.some((r) => r.meetingPoint.trim() || r.plan.trim())) notices.push('Todavía no cargaste una ruta de salida.');
  if (members.length > 0 && !members.some((m) => m.phone1)) notices.push('Ningún integrante tiene teléfono cargado.');
  if (members.length === 0) notices.push('Todavía no cargaste a tu familia.');

  const inProgress = courses.filter((c) => c.status === 'en_curso').length;
  const done = courses.filter((c) => c.status === 'hecho').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code="Tu preparación"
          title="Inicio"
          right={
            <Pressable hitSlop={12} onPress={() => navigation.navigate('Ajustes')} accessibilityLabel="Ajustes">
              <Text style={styles.gear}>⚙</Text>
            </Pressable>
          }
        />
        <ScrollView contentContainerStyle={styles.body}>
          <Card>
            {stats.total === 0 && !loading ? (
              <>
                <EmptyState text="Todavía no cargaste equipo." />
                <Button title="Ir a Equipo" onPress={() => navigation.navigate('Equipo')} />
              </>
            ) : (
              <>
                <View style={styles.readyTop}>
                  <Text style={styles.readyNum}>{pct}%</Text>
                  <Text style={styles.readySide}>
                    {stats.done} de {stats.total} ítems{'\n'}
                    {stats.pending} pendientes
                  </Text>
                </View>
                <Meter ratio={stats.ratio} />
              </>
            )}
          </Card>

          <View style={styles.quickRow}>
            {QUICK_NUMBERS.map((n) => (
              <Pressable key={n.label} style={[styles.quick, styles.quickDanger]} onPress={() => Linking.openURL(`tel:${n.dial}`)}>
                <Text style={styles.quickNum}>{n.display}</Text>
                <Text style={styles.quickLabel}>{n.label}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.quick} onPress={() => navigation.navigate('Familia', { mode: 'plan' })}>
              <Text style={styles.quickIcon}>🧭</Text>
              <Text style={styles.quickLabel}>Plan de salida</Text>
            </Pressable>
          </View>

          {bagRows.length > 0 && (
            <Card>
              <Label>Mochilas</Label>
              {bagRows.map((row) => {
                const r = row.total ? row.done / row.total : 0;
                return (
                  <Pressable
                    key={row.key}
                    style={styles.bagRow}
                    onPress={() => navigation.navigate('Equipo', { bagId: row.key })}
                  >
                    <View style={styles.bagTop}>
                      <Text style={styles.bagName}>{row.label}</Text>
                      <Text style={styles.bagFrac}>
                        {row.done}/{row.total}
                      </Text>
                    </View>
                    <Bar ratio={r} color={progressColor(colors, r)} />
                  </Pressable>
                );
              })}
            </Card>
          )}

          {pending.length > 0 && (
            <Card>
              <Label>Para completar primero</Label>
              {pending.map((it) => (
                <Pressable key={it.id} style={styles.pendingRow} onPress={() => navigation.navigate('Equipo')}>
                  <Text style={styles.pendingName}>{it.name}</Text>
                  <Text style={styles.pendingCat}>{it.category}</Text>
                </Pressable>
              ))}
            </Card>
          )}

          {alerts.total > 0 && (
            <Card>
              <Label>Para revisar</Label>
              {[...alerts.expired, ...alerts.soon, ...alerts.reviews].map((a) => (
                <Pressable key={`${a.kind}-${a.item.id}`} style={styles.pendingRow} onPress={() => navigation.navigate('Equipo')}>
                  <Text style={[styles.pendingName, a.kind === 'vencido' && { color: colors.danger }]}>{alertText(a)}</Text>
                </Pressable>
              ))}
            </Card>
          )}

          {notices.length > 0 && (
            <Card>
              <Label>Avisos</Label>
              {notices.map((n) => (
                <Text key={n} style={styles.notice}>
                  · {n}
                </Text>
              ))}
            </Card>
          )}

          {courses.length > 0 && (
            <Pressable onPress={() => navigation.navigate('Cursos')}>
              <Card>
                <Label>Cursos</Label>
                <Text style={styles.courses}>
                  {inProgress} en curso · {done} hechos · {courses.length} en total
                </Text>
              </Card>
            </Pressable>
          )}
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    gear: { color: colors.textMuted, fontSize: 22 },

    readyTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md },
    readyNum: { fontFamily: colors.fonts.title, fontSize: 48, fontWeight: '700', color: colors.accent, lineHeight: 52 },
    readySide: { fontFamily: colors.fonts.label, fontSize: 12, color: colors.textMuted, lineHeight: 18, textAlign: 'right' },

    quickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    quick: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: colors.radius.md,
      backgroundColor: colors.surface,
      borderWidth: colors.elevated ? 0 : 1,
      borderColor: colors.border,
      gap: 2,
    },
    quickDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
    quickNum: { fontFamily: colors.fonts.title, fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
    quickIcon: { fontSize: 22, color: colors.accent },
    quickLabel: { fontFamily: colors.fonts.label, fontSize: 11, fontWeight: '700', color: colors.text, textAlign: 'center' },

    bagRow: { gap: spacing.xs, paddingVertical: spacing.sm },
    bagTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    bagName: { color: colors.text, fontSize: 14, fontWeight: '600' },
    bagFrac: { fontFamily: colors.fonts.label, fontSize: 11, color: colors.textMuted },

    pendingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pendingName: { flex: 1, color: colors.text, fontSize: 14 },
    pendingCat: { fontFamily: colors.fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },

    notice: { color: colors.warning, fontSize: 13, lineHeight: 19, marginBottom: spacing.xs },
    courses: { color: colors.text, fontSize: 14 },
  });
}
