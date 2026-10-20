import React, { useCallback, useMemo, useRef, useState } from 'react';
import { BackHandler, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Bar, Button, Card, Chip, EmptyState, Field, Label, Meter, Screen, ScreenHeader, confirmClear } from '../ui/components';
import { ItemPickerModal } from '../ui/ItemPickerModal';
import { useTheme } from '../ui/ThemeContext';
import { Colors, progressColor, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { Bag, GEAR_CATEGORIES, GEAR_PRIORITIES, GearCategory, GearItem, GearPriority } from '../types';
import { buildSeed } from '../seedData';
import { UNASSIGNED, byBag, byCategory, readiness } from '../progress';
import { tipFor } from '../tips';
import { SITUATIONS, SituationKey, bySituation, itemsForSituation } from '../situations';
import { SOON_DAYS, addMonths, parseExpiry } from '../alerts';
import { CATALOG_ITEMS } from '../catalog';

/** Tap-to-pick presets offered alongside the free-text emoji field when naming a mochila. */
const BAG_EMOJI_PRESETS = [
  '🎒', '🧳', '🩹', '⛑️', '💧', '🔥', '🛠️', '📡', '🔦', '🍫', '📄', '🐾', '🏠', '🚗', '🧒', '🧭',
];

type GroupMode = 'categoria' | 'mochila' | 'situacion';

/** 'resumen' shows readiness + grouped bars; 'todos' and the category/bag variants are
 * filtered item lists — one screen, no navigation-stack entries. */
type ViewMode =
  | { kind: 'resumen' }
  | { kind: 'todos' }
  | { kind: 'category'; value: GearCategory }
  | { kind: 'bag'; value: string }
  | { kind: 'situation'; value: SituationKey };

function fmtDate(d: Date) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Small status lines under an item: expiry and periodic-check state. */
function itemNotes(it: GearItem): { text: string; warn: boolean }[] {
  const out: { text: string; warn: boolean }[] = [];
  const exp = parseExpiry(it.expiresAt);
  if (it.expiresAt) {
    if (!exp) out.push({ text: `Vence: ${it.expiresAt}`, warn: false });
    else {
      const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
      if (days < 0) out.push({ text: `Vencido (${it.expiresAt})`, warn: true });
      else out.push({ text: `Vence ${it.expiresAt}`, warn: days <= SOON_DAYS });
    }
  }
  if (it.reviewEveryMonths) {
    const last = it.lastReviewedAt ? new Date(it.lastReviewedAt) : null;
    if (!last || isNaN(last.getTime())) out.push({ text: `Control cada ${it.reviewEveryMonths} m · sin revisar todavía`, warn: true });
    else {
      const due = addMonths(last, it.reviewEveryMonths);
      out.push({ text: `Control cada ${it.reviewEveryMonths} m · próximo ${fmtDate(due)}`, warn: due.getTime() < Date.now() });
    }
  }
  return out;
}

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items, loading, addItem, addMany, updateItem, removeItem, clearAll: clearItems } = useStorageList<GearItem>('gonza:gear');
  const {
    items: bags,
    addItem: addBag,
    addMany: addManyBags,
    updateItem: updateBag,
    removeItem: removeBag,
    clearAll: clearBags,
  } = useStorageList<Bag>('gonza:bags');

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [view, setView] = useState<ViewMode>({ kind: 'resumen' });
  const [groupMode, setGroupMode] = useState<GroupMode>('categoria');

  // Inicio opens a specific mochila by navigating here with { bagId }; consume the param so
  // coming back to this tab later doesn't re-trigger it.
  const bagIdParam: string | undefined = route.params?.bagId;
  useFocusEffect(
    useCallback(() => {
      if (!bagIdParam) return;
      setGroupMode('mochila');
      setView({ kind: 'bag', value: bagIdParam });
      navigation.setParams({ bagId: undefined });
    }, [bagIdParam, navigation])
  );
  const [showForm, setShowForm] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearCategory>('Otros');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState<GearPriority>('recomendado');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [reviewEvery, setReviewEvery] = useState('');
  const [bagId, setBagId] = useState<string | undefined>(undefined);

  const [showBagForm, setShowBagForm] = useState(false);
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [bagName, setBagName] = useState('');
  const [bagEmoji, setBagEmoji] = useState('');

  const { done: have, ratio } = useMemo(() => readiness(items), [items]);

  const categoryRows = useMemo(() => byCategory(items), [items]);
  const bagRows = useMemo(() => byBag(items, bags), [items, bags]);
  const situationRows = useMemo(() => bySituation(items), [items]);

  const listed = useMemo(() => {
    if (view.kind === 'todos') return items;
    if (view.kind === 'category') return items.filter((it) => it.category === view.value);
    if (view.kind === 'situation') return itemsForSituation(items, view.value);
    if (view.kind === 'bag') {
      const bagIds = new Set(bags.map((b) => b.id));
      if (view.value === UNASSIGNED) return items.filter((it) => !it.bagId || !bagIds.has(it.bagId));
      return items.filter((it) => it.bagId === view.value);
    }
    return [];
  }, [items, bags, view]);

  function resetForm() {
    setName('');
    setCategory('Otros');
    setQuantity('');
    setPriority('recomendado');
    setBagId(undefined);
    setEditingId(null);
    setExpiresAt('');
    setReviewEvery('');
    setShowForm(false);
  }

  function startEdit(it: GearItem) {
    setEditingId(it.id);
    setName(it.name);
    setCategory(it.category);
    setQuantity(it.quantity ?? '');
    setPriority(it.priority ?? 'recomendado');
    setBagId(it.bagId);
    setExpiresAt(it.expiresAt ?? '');
    setReviewEvery(it.reviewEveryMonths ? String(it.reviewEveryMonths) : '');
    setShowForm(true);
  }

  // The category/bag drill-down and the add form are local state, not navigation-stack entries,
  // so Android's hardware back button doesn't know about them by default and exits the app
  // instead of stepping back one level. Intercept it here, in priority order; the item picker's
  // own Modal already handles back on its own, so defer to it when it's open. Once there's
  // nothing left to undo (already at the resumen), fall back to "press again to exit" instead of
  // quitting on a single accidental tap — Equipo is the app's first tab, so a bare back press
  // here has nowhere else in the app to go.
  //
  // The listener itself is registered once (stable empty deps) and reads current state through
  // refs rather than resubscribing on every state change, to avoid a stale-closure/resubscribe
  // race that could otherwise let a back press slip through to the OS mid-transition.
  const pickerOpenRef = useRef(pickerOpen);
  const showFormRef = useRef(showForm);
  const viewRef = useRef(view);
  pickerOpenRef.current = pickerOpen;
  showFormRef.current = showForm;
  viewRef.current = view;
  const lastBackPress = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (pickerOpenRef.current) return false;
        if (showFormRef.current) {
          setShowForm(false);
          return true;
        }
        if (viewRef.current.kind !== 'resumen') {
          setView({ kind: 'resumen' });
          return true;
        }
        if (Platform.OS === 'android') {
          const now = Date.now();
          if (now - lastBackPress.current < 2000) {
            return false;
          }
          lastBackPress.current = now;
          ToastAndroid.show('Tocá de nuevo para salir', ToastAndroid.SHORT);
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [])
  );

  async function handleSave() {
    if (!name.trim()) return;
    const months = parseInt(reviewEvery, 10);
    const fields = {
      name: name.trim(),
      category,
      priority,
      quantity: quantity.trim() || undefined,
      bagId,
      expiresAt: expiresAt.trim() || undefined,
      reviewEveryMonths: months > 0 ? months : undefined,
    };
    if (editingId) {
      await updateItem(editingId, fields);
    } else {
      await addItem({ ...fields, have: false });
    }
    resetForm();
  }

  function markReviewed(it: GearItem) {
    updateItem(it.id, { lastReviewedAt: new Date().toISOString() });
  }

  function resetBagForm() {
    setBagName('');
    setBagEmoji('');
    setEditingBagId(null);
    setShowBagForm(false);
  }

  function startEditBag(b: Bag) {
    setEditingBagId(b.id);
    setBagName(b.name);
    setBagEmoji(b.emoji ?? '');
    setShowBagForm(true);
  }

  async function handleSaveBag() {
    if (!bagName.trim()) return;
    const patch = { name: bagName.trim(), emoji: bagEmoji.trim() || undefined };
    if (editingBagId) {
      await updateBag(editingBagId, patch);
    } else {
      await addBag(patch);
    }
    resetBagForm();
  }

  async function handleLoadSeed() {
    const { bags: seedBags, items: seedItems } = buildSeed();
    await addManyBags(seedBags);
    await addMany(seedItems);
  }

  const bagTitle = (id: string) => (id === UNASSIGNED ? 'Sin mochila' : bags.find((b) => b.id === id)?.name ?? 'Mochila');

  const title =
    view.kind === 'resumen'
      ? 'Equipo'
      : view.kind === 'todos'
        ? 'Todos'
        : view.kind === 'category'
          ? view.value
          : view.kind === 'situation'
            ? (SITUATIONS.find((s) => s.key === view.value)?.label.replace(/^\S+\s/, '') ?? 'Situación')
            : bagTitle(view.value);

  const headerCode =
    view.kind === 'resumen'
      ? 'Sección 01 · Equipo'
      : `Sección 01 · ${title} · ${listed.filter((i) => i.have).length} de ${listed.length}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code={loading ? 'Cargando…' : headerCode}
          title={title}
          right={<Button title={showForm ? 'Cerrar' : '+ Ítem'} onPress={() => setShowForm((v) => !v)} />}
        />

        {view.kind !== 'resumen' && (
          <Pressable onPress={() => setView({ kind: 'resumen' })} style={styles.back}>
            <Text style={styles.backText}>‹ Resumen</Text>
          </Pressable>
        )}

        {showForm && (
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
            <Card>
              <Button title="Elegir de la lista" variant="secondary" onPress={() => setPickerOpen(true)} />
              <View style={styles.pickerGap} />
              <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: Filtro de agua" />
              <Label>Categoría</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {GEAR_CATEGORIES.map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </ScrollView>
              <Label>Prioridad</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {GEAR_PRIORITIES.map((p) => (
                  <Chip key={p.key} label={p.label} selected={priority === p.key} onPress={() => setPriority(p.key)} />
                ))}
              </ScrollView>
              <Field label="Cantidad (opcional)" value={quantity} onChangeText={setQuantity} placeholder="Ej: 2 unidades" />
              <Field label="Vence (opcional)" value={expiresAt} onChangeText={setExpiresAt} placeholder="MM/AAAA" keyboardType="numbers-and-punctuation" />
              <Field label="Revisar cada (meses, opcional)" value={reviewEvery} onChangeText={setReviewEvery} placeholder="Ej: 6 — para pilas y baterías" keyboardType="number-pad" />
              {bags.length > 0 && (
                <>
                  <Label>Mochila (opcional)</Label>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                    <Chip label="Ninguna" selected={!bagId} onPress={() => setBagId(undefined)} />
                    {bags.map((b) => (
                      <Chip
                        key={b.id}
                        label={b.emoji ? `${b.emoji} ${b.name}` : b.name}
                        selected={bagId === b.id}
                        onPress={() => setBagId(b.id)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
              <Button title={editingId ? 'Guardar cambios' : 'Guardar'} onPress={handleSave} />
            </Card>
          </ScrollView>
        )}

        {showForm ? null : view.kind === 'resumen' ? (
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

            <View style={styles.groupRow}>
              <Chip label="Por categoría" selected={groupMode === 'categoria'} onPress={() => setGroupMode('categoria')} />
              <Chip label="Por mochila" selected={groupMode === 'mochila'} onPress={() => setGroupMode('mochila')} />
              <Chip label="Por situación" selected={groupMode === 'situacion'} onPress={() => setGroupMode('situacion')} />
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyWrap}>
                <EmptyState text="Todavía no cargaste equipo. Tocá + Ítem para empezar." />
                <Button
                  title="Cargar checklist sugerido (Día Cero)"
                  variant="secondary"
                  onPress={handleLoadSeed}
                />
              </View>
            ) : groupMode === 'categoria' ? (
              <View style={styles.cats}>
                {categoryRows.map((row) => {
                  const r = row.done / row.total;
                  return (
                    <Pressable key={row.key} onPress={() => setView({ kind: 'category', value: row.key })} style={styles.catRow}>
                      <View style={styles.catTop}>
                        <Text style={styles.catName}>{row.label}</Text>
                        <Text style={styles.catFrac}>
                          {row.done}/{row.total}
                        </Text>
                      </View>
                      <Bar ratio={r} color={progressColor(colors, r)} />
                    </Pressable>
                  );
                })}
                <Pressable onPress={() => setView({ kind: 'todos' })} style={styles.allRow}>
                  <Text style={styles.allText}>Ver todos los ítems ›</Text>
                </Pressable>
              </View>
            ) : groupMode === 'situacion' ? (
              <View style={styles.cats}>
                {situationRows.map((row) => {
                  const r = row.total > 0 ? row.done / row.total : 0;
                  return (
                    <Pressable
                      key={row.key}
                      onPress={() => setView({ kind: 'situation', value: row.key as SituationKey })}
                      style={styles.catRow}
                    >
                      <View style={styles.catTop}>
                        <Text style={styles.catName}>{row.label}</Text>
                        <Text style={styles.catFrac}>
                          {row.done}/{row.total}
                        </Text>
                      </View>
                      <Bar ratio={r} color={progressColor(colors, r)} />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.cats}>
                {bagRows.map((row) => {
                  const r = row.total > 0 ? row.done / row.total : 0;
                  return (
                    <Pressable key={row.key} onPress={() => setView({ kind: 'bag', value: row.key })} style={styles.catRow}>
                      <View style={styles.catTop}>
                        <Text style={styles.catName}>{row.label}</Text>
                        <Text style={styles.catFrac}>
                          {row.done}/{row.total}
                        </Text>
                      </View>
                      <Bar ratio={r} color={progressColor(colors, r)} />
                    </Pressable>
                  );
                })}

                {showBagForm ? (
                  <Card>
                    <Field label="Nombre de la mochila" value={bagName} onChangeText={setBagName} placeholder="Ej: Mochila líder" />
                    <Label>Ícono (opcional)</Label>
                    <View style={styles.emojiRow}>
                      {BAG_EMOJI_PRESETS.map((e) => (
                        <Pressable
                          key={e}
                          onPress={() => setBagEmoji(e)}
                          style={[styles.emojiOption, bagEmoji === e && styles.emojiOptionSelected]}
                        >
                          <Text style={styles.emojiOptionText}>{e}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Field label="U otro emoji" value={bagEmoji} onChangeText={setBagEmoji} placeholder="🎒" />
                    <View style={styles.bagFormActions}>
                      <Button title="Cancelar" variant="secondary" onPress={resetBagForm} />
                      <Button title={editingBagId ? 'Guardar cambios' : 'Crear mochila'} onPress={handleSaveBag} />
                    </View>
                  </Card>
                ) : (
                  <Button title="+ Mochila" variant="secondary" onPress={() => setShowBagForm(true)} />
                )}

                {bags.length > 0 && (
                  <View style={styles.bagManage}>
                    <Label>Mochilas creadas</Label>
                    {bags.map((b) => (
                      <Pressable key={b.id} style={styles.bagManageRow} onPress={() => startEditBag(b)}>
                        <Text style={styles.bagManageName}>{b.emoji ? `${b.emoji} ${b.name}` : b.name}</Text>
                        <Pressable hitSlop={12} onPress={() => removeBag(b.id)}>
                          <Text style={styles.remove}>✕</Text>
                        </Pressable>
                      </Pressable>
                    ))}
                    <Button title="Vaciar mochilas" variant="danger" onPress={() => confirmClear('mochilas', clearBags)} />
                  </View>
                )}
              </View>
            )}
            {items.length > 0 && (
              <View style={styles.clearWrap}>
                <Button title="Vaciar equipo" variant="danger" onPress={() => confirmClear('el equipo (todos los ítems)', clearItems)} />
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={listed}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState text="No hay ítems acá todavía." />}
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => updateItem(item.id, { have: !item.have })}>
                <View style={[styles.box, item.have && styles.boxDone]}>
                  {item.have && <Text style={styles.check}>✓</Text>}
                </View>
                <View style={styles.itemBody}>
                  <Text style={[styles.itemName, item.have && styles.itemNameDone]}>{item.name}</Text>
                  {(view.kind === 'todos' || view.kind === 'bag') && <Text style={styles.itemCat}>{item.category}</Text>}
                  {item.priority ? (
                    <Text style={[styles.itemPriority, item.priority === 'esencial' && { color: colors.accent }]}>
                      {item.priority}
                    </Text>
                  ) : null}
                  {item.quantity ? <Text style={styles.itemQuantity}>{item.quantity}</Text> : null}
                  {tipFor(item.name) ? <Text style={styles.itemQuantity}>Mirá: {tipFor(item.name)}</Text> : null}
                  {itemNotes(item).map((n) => (
                    <Text key={n.text} style={[styles.itemQuantity, n.warn && { color: colors.warning }]}>
                      {n.text}
                    </Text>
                  ))}
                  {item.reviewEveryMonths ? (
                    <Pressable hitSlop={8} onPress={() => markReviewed(item)}>
                      <Text style={styles.reviewBtn}>Revisado hoy ›</Text>
                    </Pressable>
                  ) : null}
                </View>
                <Pressable hitSlop={12} onPress={() => startEdit(item)}>
                  <Text style={styles.remove}>✎</Text>
                </Pressable>
                <Pressable hitSlop={12} onPress={() => removeItem(item.id)}>
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </Screen>
      <ItemPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        catalog={CATALOG_ITEMS}
        onSelect={(item) => {
          setName(item.name);
          setCategory(item.category);
          if (item.quantity) setQuantity(item.quantity);
          if (item.priority) setPriority(item.priority);
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    back: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
    backText: { fontFamily: colors.fonts.label, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },
    formScroll: { flex: 1 },
    formWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    pickerGap: { height: spacing.md },
    chipsRow: { marginBottom: spacing.sm },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

    ready: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    readyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.sm },
    readyNum: { fontFamily: colors.fonts.label, fontSize: 38, fontWeight: '700', color: colors.text, lineHeight: 40 },
    readyPct: { fontSize: 17, color: colors.textMuted },
    readySide: { alignItems: 'flex-end' },
    readySideText: { fontFamily: colors.fonts.label, fontSize: 11, color: colors.textMuted, lineHeight: 17 },
    readySideStrong: { color: colors.text, fontWeight: '700' },

    groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },

    emptyWrap: { gap: spacing.md },
    cats: { gap: spacing.md },
    catRow: { gap: spacing.xs },
    catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    catName: { color: colors.text, fontSize: 14, fontWeight: '600' },
    catFrac: { fontFamily: colors.fonts.label, fontSize: 11, color: colors.textMuted },
    allRow: { paddingTop: spacing.sm },
    allText: { fontFamily: colors.fonts.label, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },

    emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
    emojiOption: {
      width: 40,
      height: 40,
      borderRadius: colors.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiOptionSelected: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    emojiOptionText: { fontSize: 18 },
    bagFormActions: { flexDirection: 'row', gap: spacing.sm },

    clearWrap: { marginTop: spacing.lg },
    bagManage: { marginTop: spacing.sm, gap: spacing.sm },
    bagManageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bagManageName: { color: colors.text, fontSize: 14 },

    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    box: {
      width: 20,
      height: 20,
      marginTop: 1,
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
    itemCat: { fontFamily: colors.fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginTop: 2 },
    itemPriority: { fontFamily: colors.fonts.label, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '700', color: colors.textMuted, marginTop: 2 },
    reviewBtn: { fontFamily: colors.fonts.label, fontSize: 11, fontWeight: '700', color: colors.accent, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
    itemQuantity: { fontSize: 12, lineHeight: 16, color: colors.textMuted, marginTop: 3 },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  });
}
