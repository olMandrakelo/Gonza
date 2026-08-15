import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { Course, Material } from '../types';

export default function MaterialScreen() {
  const { items, loading, addItem, removeItem } = useStorageList<Material>('gonza:material');
  const { items: courses } = useStorageList<Course>('gonza:courses');
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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Material</Text>
            <Text style={styles.subtitle}>{loading ? 'Cargando…' : `${items.length} guardados`}</Text>
          </View>
          <Button title={showForm ? 'Cerrar' : '+ Material'} onPress={() => setShowForm((v) => !v)} />
        </View>

        {showForm && (
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
                <Text style={styles.fieldLabel}>Curso relacionado (opcional)</Text>
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
        )}

        <FlatList
          data={items}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState text="Todavía no guardaste material. Tocá + Material para empezar." />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                {item.content ? <Text style={styles.rowContent}>{item.content}</Text> : null}
                {courseName(item.courseId) ? (
                  <Text style={styles.rowMeta}>Curso: {courseName(item.courseId)}</Text>
                ) : null}
              </View>
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

const styles = StyleSheet.create({
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
  fieldLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  chipsRow: { marginBottom: spacing.md },
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
  rowContent: { color: colors.text, fontSize: 13, marginTop: spacing.xs, opacity: 0.85 },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  remove: { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing.xs },
});
