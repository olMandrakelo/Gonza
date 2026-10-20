import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogItem } from '../catalog';
import { GEAR_CATEGORIES, GearCategory } from '../types';
import { useTheme } from './ThemeContext';
import { Colors, spacing } from './theme';

/** Bottom-sheet item picker in two steps: pick a category, then tap an item from just that category
 * (with a search box inside it). Built on RN's own Modal/FlatList — no extra dependency, so this ships
 * as a plain OTA update. */
export function ItemPickerModal(props: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  catalog: CatalogItem[];
}) {
  // Lifted here so the Android back button (Modal's onRequestClose) can step back to the category list first.
  const [category, setCategory] = useState<GearCategory | null>(null);

  function handleRequestClose() {
    if (category) setCategory(null);
    else props.onClose();
  }

  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={handleRequestClose}>
      {/*
       * RN's Modal renders into its own native window/surface, which the outer SafeAreaProvider
       * (mounted once at the app root) doesn't reliably measure — its insets can read as 0 here
       * even on a device with on-screen nav buttons. Nesting a fresh provider makes this Modal
       * measure its own surface directly, so Sheet's useSafeAreaInsets() below is accurate.
       */}
      <SafeAreaProvider>
        <Sheet {...props} category={category} setCategory={setCategory} />
      </SafeAreaProvider>
    </Modal>
  );
}

function Sheet({
  onClose,
  onSelect,
  catalog,
  category,
  setCategory,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  catalog: CatalogItem[];
  category: GearCategory | null;
  setCategory: (c: GearCategory | null) => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () =>
      GEAR_CATEGORIES.map((cat) => ({ cat, count: catalog.filter((it) => it.category === cat).length })).filter(
        (c) => c.count > 0
      ),
    [catalog]
  );

  const items = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    return catalog.filter((it) => it.category === category && (!q || it.name.toLowerCase().includes(q)));
  }, [catalog, category, query]);

  function backToCategories() {
    setQuery('');
    setCategory(null);
  }

  function handleSelect(item: CatalogItem) {
    onSelect(item);
    setQuery('');
    setCategory(null);
  }

  function handleClose() {
    setQuery('');
    setCategory(null);
    onClose();
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, { marginBottom: insets.bottom }]}>
        <View style={styles.headerRow}>
          {category ? (
            <Pressable hitSlop={12} onPress={backToCategories} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Categorías</Text>
            </Pressable>
          ) : (
            <Text style={styles.title}>Elegí una categoría</Text>
          )}
          <Pressable hitSlop={12} onPress={handleClose}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {category ? (
          <>
            <Text style={styles.catTitle}>{category}</Text>
            <TextInput
              style={styles.search}
              placeholder={`Buscar en ${category}…`}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
            />
            <FlatList
              data={items}
              keyExtractor={(item, i) => item.name + i}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: spacing.xl }}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => handleSelect(item)}>
                  <Text style={styles.rowText}>{item.name}</Text>
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No encontramos nada con ese nombre.</Text>}
            />
          </>
        ) : (
          <FlatList
            data={counts}
            keyExtractor={(c) => c.cat}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            renderItem={({ item }) => (
              <Pressable style={styles.catRow} onPress={() => setCategory(item.cat)}>
                <Text style={styles.catRowText}>{item.cat}</Text>
                <Text style={styles.catCount}>
                  {item.count} ›
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: colors.radius.lg,
      borderTopRightRadius: colors.radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      height: '82%',
      paddingTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: { fontFamily: colors.fonts.label, fontSize: 16, fontWeight: '700', color: colors.text },
    backBtn: { paddingVertical: 2 },
    backText: { fontFamily: colors.fonts.label, fontSize: 14, fontWeight: '700', color: colors.accent },
    catTitle: { fontFamily: colors.fonts.title, fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    catRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    catRowText: { color: colors.text, fontSize: 17, fontWeight: '600' },
    catCount: { fontFamily: colors.fonts.label, fontSize: 13, color: colors.textMuted },
    close: { color: colors.textMuted, fontSize: 18, paddingHorizontal: spacing.xs },
    search: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: colors.radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      fontSize: 15,
      marginBottom: spacing.sm,
    },
    row: {
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowText: { color: colors.text, fontSize: 15 },
    empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  });
}
