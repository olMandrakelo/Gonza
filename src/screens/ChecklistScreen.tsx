import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { GEAR_CATEGORIES, GearCategory, GearItem } from '../types';

export default function ChecklistScreen() {
  const { items, loading, addItem, updateItem, removeItem } = useStorageList<GearItem>('gonza:gear');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearCategory>('Otros');
  const [quantity, setQuantity] = useState('');
  const [filter, setFilter] = useState<GearCategory | 'Todas'>('Todas');

  const filtered = useMemo(
    () => (filter === 'Todas' ? items : items.filter((it) => it.category === filter)),
    [items, filter]
  );

  const haveCount = items.filter((it) => it.have).length;

  function resetForm() {
    setName('');
    setCategory('Otros');
    setQuantity('');
    setShowForm(false);
  }

  async function handleAdd() {
    if (!name.trim()) return;
    await addItem({ name: name.trim(), category, have: false, quantity: quantity.trim() || undefined });
    resetForm();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Checklist</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Cargando…' : `${haveCount}/${items.length} conseguido`}
            </Text>
          </View>
          <Button title={showForm ? 'Cerrar' : '+ Ítem'} onPress={() => setShowForm((v) => !v)} />
        </View>

        {showForm && (
          <Card>
            <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Filtro de agua" />
            <Text style={styles.fieldLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {GEAR_CATEGORIES.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>
            <Field
              label="Cantidad (opcional)"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ej: 2 unidades"
            />
            <Button title="Guardar" onPress={handleAdd} />
          </Card>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="Todas" selected={filter === 'Todas'} onPress={() => setFilter('Todas')} />
          {GEAR_CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={filter === c} onPress={() => setFilter(c)} />
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState text="Todavía no cargaste nada acá. Tocá + Ítem para empezar." />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => updateItem(item.id, { have: !item.have })}>
              <View style={[styles.checkbox, item.have && styles.checkboxChecked]}>
                {item.have && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, item.have && styles.rowTitleDone]}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.category}
                  {item.quantity ? ` · ${item.quantity}` : ''}
                </Text>
              </View>
              <Pressable hitSlop={12} onPress={() => removeItem(item.id)}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            </Pressable>
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
  filterRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm, flexGrow: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#0F1512', fontWeight: '700' },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  remove: { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing.xs },
});
