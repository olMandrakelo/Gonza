import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bar, Button, Card, Chip, EmptyState, Field, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, mono, radius, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { COURSE_STATUSES, Course, CourseStatus } from '../types';

function nextStatus(status: CourseStatus): CourseStatus {
  if (status === 'pendiente') return 'en_curso';
  if (status === 'en_curso') return 'hecho';
  return 'pendiente';
}

export default function CoursesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const statusColor: Record<CourseStatus, string> = {
    pendiente: colors.textMuted,
    en_curso: colors.warning,
    hecho: colors.ok,
  };
  const { items, loading, addItem, updateItem, removeItem } = useStorageList<Course>('gonza:courses');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [link, setLink] = useState('');
  const [filter, setFilter] = useState<CourseStatus | 'Todos'>('Todos');

  const done = items.filter((c) => c.status === 'hecho').length;
  const ratio = items.length ? done / items.length : 0;

  const filtered = useMemo(
    () => (filter === 'Todos' ? items : items.filter((c) => c.status === filter)),
    [items, filter]
  );

  function resetForm() {
    setName('');
    setProvider('');
    setLink('');
    setShowForm(false);
  }

  async function handleAdd() {
    if (!name.trim()) return;
    await addItem({
      name: name.trim(),
      provider: provider.trim() || undefined,
      link: link.trim() || undefined,
      status: 'pendiente',
    });
    resetForm();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code={loading ? 'Cargando…' : `Sección 02 · ${done} de ${items.length} hechos`}
          title="Cursos"
          right={<Button title={showForm ? 'Cerrar' : '+ Curso'} onPress={() => setShowForm((v) => !v)} />}
        />

        {items.length > 0 && (
          <View style={styles.barWrap}>
            <Bar ratio={ratio} color={colors.ok} />
          </View>
        )}

        {showForm && (
          <View style={styles.formWrap}>
            <Card>
              <Field label="Nombre del curso" value={name} onChangeText={setName} placeholder="Ej: RCP y primeros auxilios" />
              <Field label="Institución (opcional)" value={provider} onChangeText={setProvider} placeholder="Ej: Cruz Roja" />
              <Field label="Link (opcional)" value={link} onChangeText={setLink} placeholder="https://…" autoCapitalize="none" />
              <Button title="Guardar" onPress={handleAdd} />
            </Card>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="Todos" selected={filter === 'Todos'} onPress={() => setFilter('Todos')} />
          {COURSE_STATUSES.map((s) => (
            <Chip key={s.value} label={s.label} selected={filter === s.value} onPress={() => setFilter(s.value)} />
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState text="Todavía no cargaste cursos. Tocá + Curso para empezar." />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable style={styles.rowBody} onPress={() => updateItem(item.id, { status: nextStatus(item.status) })}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                {item.provider ? <Text style={styles.rowMeta}>{item.provider}</Text> : null}
                <View style={[styles.pill, { borderColor: statusColor[item.status] }]}>
                  <Text style={[styles.pillText, { color: statusColor[item.status] }]}>
                    {COURSE_STATUSES.find((s) => s.value === item.status)?.label}
                  </Text>
                </View>
              </Pressable>
              <Pressable hitSlop={12} onPress={() => removeItem(item.id)}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      </Screen>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    barWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    formWrap: { paddingHorizontal: spacing.lg },
    filterRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.xs, flexGrow: 0 },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
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
    rowMeta: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginTop: 3 },
    pill: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginTop: spacing.sm,
    },
    pillText: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '700' },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  });
}
