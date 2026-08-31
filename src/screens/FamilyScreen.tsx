import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, mono, spacing } from '../ui/theme';
import { useStorageList, useStorageObject } from '../storage';
import { EvacuationRoute, FamilyMember, FamilyPlan, emptyFamilyPlan } from '../types';

type Mode = 'integrantes' | 'plan';

export default function FamilyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [mode, setMode] = useState<Mode>('integrantes');
  const { items: members } = useStorageList<FamilyMember>('gonza:family');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader code={`Sección 06 · ${members.length} integrantes`} title="Familia" />
        <View style={styles.modeRow}>
          <Chip label="Integrantes" selected={mode === 'integrantes'} onPress={() => setMode('integrantes')} />
          <Chip label="Plan de emergencia" selected={mode === 'plan'} onPress={() => setMode('plan')} />
        </View>
        {mode === 'integrantes' ? <Members /> : <Plan />}
      </Screen>
    </SafeAreaView>
  );
}

function Members() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items, addItem, updateItem, removeItem } = useStorageList<FamilyMember>('gonza:family');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setName('');
    setPhone1('');
    setPhone2('');
    setBirthDate('');
    setBloodType('');
    setAllergies('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(m: FamilyMember) {
    setEditingId(m.id);
    setName(m.name);
    setPhone1(m.phone1 ?? '');
    setPhone2(m.phone2 ?? '');
    setBirthDate(m.birthDate ?? '');
    setBloodType(m.bloodType ?? '');
    setAllergies(m.allergies ?? '');
    setNotes(m.notes ?? '');
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    const patch = {
      name: name.trim(),
      phone1: phone1.trim() || undefined,
      phone2: phone2.trim() || undefined,
      birthDate: birthDate.trim() || undefined,
      bloodType: bloodType.trim() || undefined,
      allergies: allergies.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (editingId) {
      await updateItem(editingId, patch);
    } else {
      await addItem(patch);
    }
    resetForm();
  }

  return (
    <>
      <View style={styles.addRow}>
        <Button
          title={showForm ? 'Cerrar' : '+ Persona'}
          onPress={() => (showForm ? resetForm() : setShowForm(true))}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {showForm && (
          <Card>
            <Field label="Nombre" value={name} onChangeText={setName} placeholder="Ej: María" />
            <Field label="Teléfono de contacto 1" value={phone1} onChangeText={setPhone1} keyboardType="phone-pad" />
            <Field label="Teléfono de contacto 2 (opcional)" value={phone2} onChangeText={setPhone2} keyboardType="phone-pad" />
            <Field label="Fecha de nacimiento" value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/AAAA" />
            <Field label="Grupo sanguíneo" value={bloodType} onChangeText={setBloodType} placeholder="Ej: 0+" autoCapitalize="characters" />
            <Field label="Alergias" value={allergies} onChangeText={setAllergies} placeholder="Ej: Ninguna" />
            <Field
              label="Comentarios"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />
            <Button title={editingId ? 'Guardar cambios' : 'Guardar'} onPress={handleSave} />
          </Card>
        )}
        {items.length === 0 && !showForm && (
          <EmptyState text="Todavía no cargaste a nadie. Tocá + Persona para empezar." />
        )}
        {items.map((m) => (
          <Pressable key={m.id} style={styles.memberRow} onPress={() => startEdit(m)}>
            <View style={styles.memberBody}>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberMeta}>
                {[m.phone1, m.bloodType].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
              </Text>
              {m.allergies ? <Text style={styles.memberAllergy}>Alergias: {m.allergies}</Text> : null}
            </View>
            <Pressable hitSlop={12} onPress={() => removeItem(m.id)}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function Plan() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { value: stored, loading, save } = useStorageObject<FamilyPlan>('gonza:family-plan', emptyFamilyPlan);
  const [draft, setDraft] = useState<FamilyPlan>(emptyFamilyPlan);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !hydrated) {
      setDraft(stored);
      setHydrated(true);
    }
  }, [loading, hydrated, stored]);

  function updateRoute(index: number, patch: Partial<EvacuationRoute>) {
    setSaved(false);
    setDraft((d) => ({ ...d, routes: d.routes.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  }

  async function handleSave() {
    await save(draft);
    setSaved(true);
  }

  if (!hydrated) return null;

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <Card>
        <Field
          label="Dirección"
          value={draft.address}
          onChangeText={(v) => {
            setSaved(false);
            setDraft((d) => ({ ...d, address: v }));
          }}
          placeholder="Domicilio familiar"
        />
      </Card>

      {draft.routes.map((route, i) => (
        <Card key={route.label}>
          <Text style={styles.routeLabel}>Ruta {route.label}</Text>
          <Field
            label="Punto de reunión"
            value={route.meetingPoint}
            onChangeText={(v) => updateRoute(i, { meetingPoint: v })}
            placeholder="Ej: Plaza frente a la escuela"
          />
          <Field
            label="Plan de evacuación"
            value={route.plan}
            onChangeText={(v) => updateRoute(i, { plan: v })}
            placeholder="Cómo llegar, con quién, qué hacer si no se puede"
            multiline
            numberOfLines={3}
            style={{ minHeight: 70, textAlignVertical: 'top' }}
          />
        </Card>
      ))}

      <Button title={saved ? 'Guardado ✓' : 'Guardar plan'} onPress={handleSave} />
    </ScrollView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    modeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
    addRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

    memberRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    memberBody: { flex: 1 },
    memberName: { color: colors.text, fontSize: 15, fontWeight: '600' },
    memberMeta: {
      fontFamily: mono,
      fontSize: 10,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginTop: 3,
    },
    memberAllergy: { color: colors.warning, fontSize: 12, marginTop: spacing.xs },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },

    routeLabel: {
      fontFamily: mono,
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: spacing.md,
    },
  });
}
