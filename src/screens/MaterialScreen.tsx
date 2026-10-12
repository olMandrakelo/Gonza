import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Label, Screen, ScreenHeader, confirmClear } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { Course, Material } from '../types';
import { KNOTS } from '../knotsData';
import { HAZARDS } from '../hazardsData';

type Mode = 'notas' | 'nudos' | 'riesgo';

export default function MaterialScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items, loading, addItem, removeItem, clearAll } = useStorageList<Material>('gonza:material');
  const { items: courses } = useStorageList<Course>('gonza:courses');
  const [mode, setMode] = useState<Mode>('notas');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState<string | undefined>(undefined);

  function resetForm() {
    setTitle('');
    setContent('');
    setCourseId(undefined);
    setShowForm(false);
  }

  async function handleAdd() {
    if (!title.trim()) return;
    await addItem({ title: title.trim(), content: content.trim(), courseId });
    resetForm();
  }

  function courseName(id?: string) {
    return courses.find((c) => c.id === id)?.name;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code={
            mode === 'notas'
              ? loading
                ? 'Cargando…'
                : `Sección 04 · ${items.length} guardados`
              : mode === 'nudos'
              ? `Sección 04 · ${KNOTS.length} nudos`
              : `Sección 04 · ${HAZARDS.length} guías`
          }
          title="Material"
          right={
            mode === 'notas' ? (
              <Button title={showForm ? 'Cerrar' : '+ Material'} onPress={() => setShowForm((v) => !v)} />
            ) : undefined
          }
        />

        <View style={styles.modeRow}>
          <Chip label="Mis notas" selected={mode === 'notas'} onPress={() => setMode('notas')} />
          <Chip label="Guía de nudos" selected={mode === 'nudos'} onPress={() => setMode('nudos')} />
          <Chip label="Guías de riesgo" selected={mode === 'riesgo'} onPress={() => setMode('riesgo')} />
        </View>

        {mode === 'nudos' ? (
          <Knots />
        ) : mode === 'riesgo' ? (
          <Hazards />
        ) : (
          <>
            {showForm && (
              <View style={styles.formWrap}>
                <Card>
                  <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ej: Resumen nudos básicos" />
                  <Field
                    label="Contenido / link"
                    value={content}
                    onChangeText={setContent}
                    placeholder="Notas o un link…"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 90, textAlignVertical: 'top' }}
                  />
                  {courses.length > 0 && (
                    <>
                      <Label>Curso relacionado (opcional)</Label>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                        <Chip label="Ninguno" selected={!courseId} onPress={() => setCourseId(undefined)} />
                        {courses.map((c) => (
                          <Chip key={c.id} label={c.name} selected={courseId === c.id} onPress={() => setCourseId(c.id)} />
                        ))}
                      </ScrollView>
                    </>
                  )}
                  <Button title="Guardar" onPress={handleAdd} />
                </Card>
              </View>
            )}

            <FlatList
              data={items}
              keyExtractor={(m) => m.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<EmptyState text="Todavía no guardaste material. Tocá + Material para empezar." />}
              ListFooterComponent={
                items.length > 0 ? (
                  <View style={{ marginTop: spacing.lg }}>
                    <Button title="Vaciar notas" variant="danger" onPress={() => confirmClear('las notas', clearAll)} />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    {item.content ? <Text style={styles.rowContent}>{item.content}</Text> : null}
                    {courseName(item.courseId) ? (
                      <Text style={styles.rowMeta}>{courseName(item.courseId)}</Text>
                    ) : null}
                  </View>
                  <Pressable hitSlop={12} onPress={() => removeItem(item.id)}>
                    <Text style={styles.remove}>✕</Text>
                  </Pressable>
                </View>
              )}
            />
          </>
        )}
      </Screen>
    </SafeAreaView>
  );
}

function Knots() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {KNOTS.map((knot) => {
        const open = openId === knot.id;
        return (
          <Pressable key={knot.id} style={styles.knotCard} onPress={() => setOpenId(open ? null : knot.id)}>
            <View style={styles.knotHeader}>
              <Text style={styles.knotName}>{knot.name}</Text>
              <Text style={styles.knotToggle}>{open ? '−' : '+'}</Text>
            </View>
            {open && (
              <View style={styles.knotBody}>
                <Image source={knot.image} style={styles.knotImage} resizeMode="contain" />
                <Text style={styles.knotUse}>{knot.use}</Text>
                {knot.steps.map((step, i) => (
                  <Text key={i} style={styles.knotStep}>
                    {i + 1}. {step}
                  </Text>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Hazards() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {HAZARDS.map((hazard) => {
        const open = openId === hazard.id;
        return (
          <Pressable key={hazard.id} style={styles.knotCard} onPress={() => setOpenId(open ? null : hazard.id)}>
            <View style={styles.knotHeader}>
              <View style={styles.hazardTitleRow}>
                <Text style={styles.hazardIcon}>{hazard.icon}</Text>
                <View>
                  <Text style={styles.knotName}>{hazard.title}</Text>
                  <Text style={styles.hazardTag}>{hazard.tag}</Text>
                </View>
              </View>
              <Text style={styles.knotToggle}>{open ? '−' : '+'}</Text>
            </View>
            {open && (
              <View style={styles.knotBody}>
                <Text style={styles.hazardSection}>Antes</Text>
                {hazard.antes.map((step, i) => (
                  <Text key={i} style={styles.knotStep}>
                    · {step}
                  </Text>
                ))}
                <Text style={styles.hazardSection}>Durante</Text>
                {hazard.durante.map((step, i) => (
                  <Text key={i} style={styles.knotStep}>
                    · {step}
                  </Text>
                ))}
                <Text style={styles.hazardSection}>Después</Text>
                {hazard.despues.map((step, i) => (
                  <Text key={i} style={styles.knotStep}>
                    · {step}
                  </Text>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    modeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
    formWrap: { paddingHorizontal: spacing.lg },
    chipsRow: { marginBottom: spacing.sm },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    knotCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    knotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    knotName: { color: colors.text, fontSize: 15, fontWeight: '600' },
    knotToggle: { color: colors.accent, fontSize: 18, fontFamily: colors.fonts.label, fontWeight: '700' },
    knotBody: { marginTop: spacing.md },
    knotImage: { width: '100%', height: 160, marginBottom: spacing.md },
    knotUse: { color: colors.text, fontSize: 13, lineHeight: 18, opacity: 0.85, marginBottom: spacing.sm },
    knotStep: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: spacing.xs },
    hazardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
    hazardIcon: { fontSize: 22 },
    hazardTag: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    hazardSection: {
      fontFamily: colors.fonts.label,
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.accent,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowBody: { flex: 1 },
    rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
    rowContent: { color: colors.text, fontSize: 13, lineHeight: 18, marginTop: spacing.xs, opacity: 0.85 },
    rowMeta: { fontFamily: colors.fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.xs },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  });
}
