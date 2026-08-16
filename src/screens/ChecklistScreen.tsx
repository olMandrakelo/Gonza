import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bar, Button, Card, Chip, EmptyState, Field, Label, Meter, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, mono, progressColor, radius, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { GEAR_CATEGORIES, GearCategory, GearItem } from '../types';

/** 'resumen' shows readiness + per-category bars; anything else is a filtered item list. */
type View_ = 'resumen' | 'todos' | GearCategory;

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items, loading, addItem, updateItem, removeItem } = useStorageList<GearItem>('gonza:gear');
  const [view, setView] = useState<View_>('resumen');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearCategory>('Otros');
  const [quantity, setQuantity] = useState('');

  const have = items.filter((it) => it.have).length;
  const ratio = items.length ? have / items.length : 0;

  const byCategory = useMemo(
    () =>
      GEAR_CATEGORIES.map((c) => {
        const list = items.filter((it) => it.category === c);
        return { category: c, total: list.length, done: list.filter((it) => it.have).length };
      }).filter((row) => row.total > 0),
    [items]
  );

  const listed = useMemo(() => {
    if (view === 'resumen') return [];
    if (view === 'todos') return items;
    return items.filter((it) => it.category === view);
  }, [items, view]);

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

  const headerCode =
    view === 'resumen'
      ? 'Sección 01 · Equipo'
      : view === 'todos'
        ? `Sección 01 · Todos · ${have} de ${items.length}`
        : `Sección 01 · ${view} · ${listed.filter((i) => i.have).length} de ${listed.length}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code={loading ? 'Cargando…' : headerCode}
          title={view === 'resumen' ? 'Equipo' : view === 'todos' ? 'Todos' : view}
          right={<Button title={showForm ? 'Cerrar' : '+ Ítem'} onPress={() => setShowForm((v) => !v)} />}
        />

        {view !== 'resumen' && (
          <Pressable onPress={() => setView('resumen')} style={styles.back}>
            <Text style={styles.backText}>‹ Resumen</Text>
          </Pressable>
        )}

        {showForm && (
          <View style={styles.formWrap}>
            <Card>
              <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Filtro de agua" />
              <Label>Categoría</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {GEAR_CATEGORIES.map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </ScrollView>
              <Field label="Cantidad (opcional)" value={quantity} onChangeText={setQuantity} placeholder="Ej: 2 unidades" />
              <Button title="Guardar" onPress={handleAdd} />
            </Card>
          </View>
        )}

        {view === 'resumen' ? (
          <ScrollView contentContainerStyle={styles.list}>
            <View style={styles.ready}>
              <View style={styles.readyTop}>
                <View>
                  <Label>Preparación</Label>
                  <Text style={styles.readyNum}>
                    {Math.round(ratio * 100)}
                    <Text style={styles.readyPct}>%</Text>
                  </Text>
                </View>
                <View style={styles.readySide}>
                  <Text style={styles.readySideText}>
                    <Text style={styles.readySideStrong}>{have}</Text> de {items.length} ítems
                  </Text>
                  <Text style={styles.readySideText}>{items.length - have} pendientes</Text>
                </View>
              </View>
              <Meter ratio={ratio} />
            </View>

            {byCategory.length === 0 ? (
              <EmptyState text="Todavía no cargaste equipo. Tocá + Ítem para empezar." />
            ) : (
              <View style={styles.cats}>
                {byCategory.map((row) => {
                  const r = row.done / row.total;
                  return (
                    <Pressable key={row.category} onPress={() => setView(row.category)} style={styles.catRow}>
                      <View style={styles.catTop}>
                        <Text style={styles.catName}>{row.category}</Text>
                        <Text style={styles.catFrac}>
                          {row.done}/{row.total}
                        </Text>
                      </View>
                      <Bar ratio={r} color={progressColor(colors, r)} />
                    </Pressable>
                  );
                })}
                <Pressable onPress={() => setView('todos')} style={styles.allRow}>
                  <Text style={styles.allText}>Ver todos los ítems ›</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={listed}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState text="No hay ítems en esta categoría todavía." />}
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => updateItem(item.id, { have: !item.have })}>
                <View style={[styles.box, item.have && styles.boxDone]}>
                  {item.have && <Text style={styles.check}>✓</Text>}
                </View>
                <View style={styles.itemBody}>
                  <Text style={[styles.itemName, item.have && styles.itemNameDone]}>{item.name}</Text>
                  {view === 'todos' && <Text style={styles.itemCat}>{item.category}</Text>}
                </View>
                <Text style={styles.itemMeta}>{item.quantity || '—'}</Text>
                <Pressable hitSlop={12} onPress={() => removeItem(item.id)}>
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    back: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
    backText: { fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },
    formWrap: { paddingHorizontal: spacing.lg },
    chipsRow: { marginBottom: spacing.sm },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

    ready: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    readyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
    readyNum: { fontFamily: mono, fontSize: 38, fontWeight: '700', color: colors.text, lineHeight: 40 },
    readyPct: { fontSize: 17, color: colors.textMuted },
    readySide: { alignItems: 'flex-end' },
    readySideText: { fontFamily: mono, fontSize: 11, color: colors.textMuted, lineHeight: 17 },
    readySideStrong: { color: colors.text, fontWeight: '700' },

    cats: { gap: spacing.md },
    catRow: { gap: spacing.xs },
    catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    catName: { color: colors.text, fontSize: 14, fontWeight: '600' },
    catFrac: { fontFamily: mono, fontSize: 11, color: colors.textMuted },
    allRow: { paddingTop: spacing.sm },
    allText: { fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    box: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxDone: { backgroundColor: colors.ok, borderColor: colors.ok },
    check: { color: colors.background, fontSize: 12, fontWeight: '700' },
    itemBody: { flex: 1 },
    itemName: { color: colors.text, fontSize: 15 },
    itemNameDone: { color: colors.textMuted },
    itemCat: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginTop: 2 },
    itemMeta: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  });
}
