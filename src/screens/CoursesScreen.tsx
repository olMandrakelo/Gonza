import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Screen } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, spacing } from '../ui/theme';
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
    hecho: colors.accent,
  };
  const { items, loading, addItem, updateItem, removeItem } = useStorageList<Course>('gonza:courses');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [link, setLink] = useState('');
  const [filter, setFilter] = useState<CourseStatus | 'Todos'>('Todos');

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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Cursos</Text>
            <Text style={styles.subtitle}>{loading ? 'Cargando…' : `${items.length} en la lista`}</Text>
          </View>
          <Button title={showForm ? 'Cerrar' : '+ Curso'} onPress={() => setShowForm((v) => !v)} />
        </View>

        {showForm && (
          <Card>
            <Field label="Nombre del curso" value={name} onChangeText={setName} placeholder="Ej: RCP y primeros auxilios" />
            <Field label="Institución (opcional)" value={provider} onChangeText={setProvider} placeholder="Ej: Cruz Roja" />
            <Field label="Link (opcional)" value={link} onChangeText={setLink} placeholder="https://…" autoCapitalize="none" />
            <Button title="Guardar" onPress={handleAdd} />
          </Card>
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
                <View style={[styles.statusPill, { borderColor: statusColor[item.status] }]}>
                  <Text style={[styles.statusText, { color: statusColor[item.status] }]}>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    title: { color: colors.text, fontSize: 24, fontWeight: '700' },
    subtitle: { color: colors.textMuted, marginTop: 2 },
    filterRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm, flexGrow: 0 },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    rowBody: { flex: 1 },
    rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
    rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    statusPill: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginTop: spacing.sm,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    remove: { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing.xs },
  });
}
