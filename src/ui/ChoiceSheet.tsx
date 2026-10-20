import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { Colors, spacing } from './theme';

export interface ChoiceOption {
  label: string;
  /** Short right-aligned text, e.g. an item count. */
  hint?: string;
  destructive?: boolean;
  onPress: () => void;
}

/** Small bottom sheet that lists a few options to pick from (used by the "¿Qué querés vaciar?" menus).
 * Built on RN's own Modal, like ItemPickerModal, so it ships as a plain OTA update. */
export function ChoiceSheet(props: {
  visible: boolean;
  title: string;
  options: ChoiceOption[];
  /** When set, shows "‹ Atrás" instead of a title-only header. */
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onBack ?? props.onClose}>
      <SafeAreaProvider>
        <Sheet {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}

function Sheet({ title, options, onBack, onClose }: { title: string; options: ChoiceOption[]; onBack?: () => void; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { marginBottom: insets.bottom }]}>
        <View style={styles.headerRow}>
          {onBack ? (
            <Pressable hitSlop={12} onPress={onBack}>
              <Text style={styles.backText}>‹ Atrás</Text>
            </Pressable>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          <Pressable hitSlop={12} onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
          {options.map((o) => (
            <Pressable key={o.label} style={styles.row} onPress={o.onPress}>
              <Text style={[styles.rowText, o.destructive && { color: colors.danger }]}>{o.label}</Text>
              {o.hint ? <Text style={styles.hint}>{o.hint}</Text> : null}
            </Pressable>
          ))}
          <Pressable style={styles.row} onPress={onClose}>
            <Text style={[styles.rowText, { color: colors.textMuted }]}>Cancelar</Text>
          </Pressable>
        </ScrollView>
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
      maxHeight: '70%',
      paddingTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.sm },
    title: { flex: 1, fontFamily: colors.fonts.label, fontSize: 16, fontWeight: '700', color: colors.text },
    backText: { fontFamily: colors.fonts.label, fontSize: 14, fontWeight: '700', color: colors.accent },
    close: { color: colors.textMuted, fontSize: 18, paddingHorizontal: spacing.xs },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowText: { color: colors.text, fontSize: 16, fontWeight: '600' },
    hint: { fontFamily: colors.fonts.label, fontSize: 13, color: colors.textMuted },
  });
}
