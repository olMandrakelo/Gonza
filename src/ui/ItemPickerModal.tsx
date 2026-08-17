import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { CatalogItem } from '../catalog';
import { GEAR_CATEGORIES } from '../types';
import { useTheme } from './ThemeContext';
import { Colors, mono, radius, spacing } from './theme';

/** Bottom-sheet item picker: search + tap-to-select, grouped by category. Built on RN's own
 * Modal/SectionList — no extra dependency, so this ships as a plain OTA update. */
export function ItemPickerModal({
  visible,
  onClose,
  onSelect,
  catalog,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  catalog: CatalogItem[];
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? catalog.filter((it) => it.name.toLowerCase().includes(q)) : catalog;
    return GEAR_CATEGORIES.map((cat) => ({
      title: cat,
      data: filtered.filter((it) => it.category === cat),
    })).filter((s) => s.data.length > 0);
  }, [catalog, query]);

  function handleSelect(item: CatalogItem) {
    onSelect(item);
    setQuery('');
  }

  function handleClose() {
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Elegí un ítem</Text>
            <Pressable hitSlop={12} onPress={handleClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Buscar…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <SectionList
            sections={sections}
            keyExtractor={(item, i) => item.category + item.name + i}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => handleSelect(item)}>
                <Text style={styles.rowText}>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No encontramos nada con ese nombre.</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
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
    title: { fontFamily: mono, fontSize: 16, fontWeight: '700', color: colors.text },
    close: { color: colors.textMuted, fontSize: 18, paddingHorizontal: spacing.xs },
    search: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      fontSize: 15,
      marginBottom: spacing.sm,
    },
    sectionHeader: {
      fontFamily: mono,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.accent,
      backgroundColor: colors.surface,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
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
