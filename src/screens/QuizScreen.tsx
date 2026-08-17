import React, { useCallback, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Chip, EmptyState, Field, Label, Screen, ScreenHeader } from '../ui/components';
import { useTheme } from '../ui/ThemeContext';
import { Colors, mono, radius, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { Course, Question } from '../types';

type Mode = 'banco' | 'simulacro';

const LETTERS = ['A', 'B', 'C', 'D'];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items: questions, loading, addItem, removeItem } = useStorageList<Question>('gonza:questions');
  const { items: courses } = useStorageList<Course>('gonza:courses');
  const [mode, setMode] = useState<Mode>('simulacro');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <ScreenHeader
          code={loading ? 'Cargando…' : `Sección 03 · ${questions.length} preguntas`}
          title="Práctica"
        />
        <View style={styles.modeRow}>
          <Chip label="Simulacro" selected={mode === 'simulacro'} onPress={() => setMode('simulacro')} />
          <Chip label="Banco" selected={mode === 'banco'} onPress={() => setMode('banco')} />
        </View>
        {mode === 'banco' ? (
          <QuestionBank questions={questions} courses={courses} addItem={addItem} removeItem={removeItem} />
        ) : (
          <Simulacro questions={questions} courses={courses} />
        )}
      </Screen>
    </SafeAreaView>
  );
}

function QuestionBank({
  questions,
  courses,
  addItem,
  removeItem,
}: {
  questions: Question[];
  courses: Course[];
  addItem: (q: Omit<Question, 'id'>) => Promise<Question>;
  removeItem: (id: string) => Promise<void>;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [optionTexts, setOptionTexts] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);

  function resetForm() {
    setText('');
    setOptionTexts(['', '', '', '']);
    setCorrectIndex(null);
    setCourseId(undefined);
    setShowForm(false);
  }

  function setOption(i: number, value: string) {
    setOptionTexts((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  }

  async function handleAdd() {
    const trimmed = optionTexts.map((t) => t.trim());
    const filled = trimmed.map((t, i) => ({ t, i })).filter((x) => x.t.length > 0);
    if (!text.trim() || filled.length < 2 || correctIndex === null || !trimmed[correctIndex]) return;
    const options = filled.map((x) => x.t);
    const newCorrectIndex = filled.findIndex((x) => x.i === correctIndex);
    await addItem({ text: text.trim(), options, correctIndex: newCorrectIndex, courseId });
    resetForm();
  }

  function courseName(id?: string) {
    return courses.find((c) => c.id === id)?.name;
  }

  return (
    <>
      <View style={styles.addRow}>
        <Button title={showForm ? 'Cerrar' : '+ Pregunta'} onPress={() => setShowForm((v) => !v)} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {showForm && (
          <Card>
            <Field label="Pregunta" value={text} onChangeText={setText} placeholder="Ej: ¿Cuánta agua por persona por día?" />
            <Label>Opciones — marcá la correcta</Label>
            {optionTexts.map((opt, i) => (
              <View key={i} style={styles.optionRow}>
                <Pressable
                  style={[styles.radio, correctIndex === i && styles.radioSelected]}
                  onPress={() => setCorrectIndex(i)}
                >
                  <Text style={[styles.radioText, correctIndex === i && styles.radioTextSelected]}>{LETTERS[i]}</Text>
                </Pressable>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Opción ${LETTERS[i]}`}
                  placeholderTextColor={colors.textMuted}
                  value={opt}
                  onChangeText={(v) => setOption(i, v)}
                />
              </View>
            ))}
            {courses.length > 0 && (
              <>
                <Label>Curso relacionado (opcional)</Label>
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
        {questions.length === 0 && !showForm && (
          <EmptyState text="Todavía no cargaste preguntas. Tocá + Pregunta para empezar." />
        )}
        {questions.map((q) => (
          <View key={q.id} style={styles.bankRow}>
            <View style={styles.bankBody}>
              <Text style={styles.bankText}>{q.text}</Text>
              <Text style={styles.bankMeta}>
                {q.options.length} opciones{courseName(q.courseId) ? ` · ${courseName(q.courseId)}` : ''}
              </Text>
            </View>
            <Pressable hitSlop={12} onPress={() => removeItem(q.id)}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function Simulacro({ questions, courses }: { questions: Question[]; courses: Course[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [courseFilter, setCourseFilter] = useState<string | 'Todos'>('Todos');
  const [running, setRunning] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const pool = useMemo(
    () => (courseFilter === 'Todos' ? questions : questions.filter((q) => q.courseId === courseFilter)),
    [questions, courseFilter]
  );

  const score = answers.filter(Boolean).length;

  // Being mid-simulacro is local state, not a navigation-stack entry, so the hardware back
  // button doesn't know about it by default and exits the app instead of leaving the quiz.
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (running && !finished) {
          setRunning(null);
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [running, finished])
  );

  function start() {
    setRunning(shuffle(pool));
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  }

  function choose(optionIndex: number) {
    if (selected !== null || !running) return;
    setSelected(optionIndex);
    setAnswers((prev) => [...prev, optionIndex === running[index].correctIndex]);
  }

  function next() {
    if (!running) return;
    if (index + 1 >= running.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (!running || finished) {
    return (
      <ScrollView contentContainerStyle={styles.list}>
        {finished && running && (
          <View style={styles.result}>
            <Label>Resultado</Label>
            <Text style={styles.resultScore}>
              {score}
              <Text style={styles.resultOf}> / {running.length}</Text>
            </Text>
            <View style={styles.strip}>
              {answers.map((hit, i) => (
                <View key={i} style={[styles.stripCell, hit ? styles.stripHit : styles.stripMiss]} />
              ))}
            </View>
          </View>
        )}
        {courses.length > 0 && (
          <>
            <Label>Curso (opcional)</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              <Chip label="Todos" selected={courseFilter === 'Todos'} onPress={() => setCourseFilter('Todos')} />
              {courses.map((c) => (
                <Chip key={c.id} label={c.name} selected={courseFilter === c.id} onPress={() => setCourseFilter(c.id)} />
              ))}
            </ScrollView>
          </>
        )}
        {pool.length === 0 ? (
          <EmptyState text="No hay preguntas cargadas para este filtro todavía." />
        ) : (
          <Button title={`Empezar · ${pool.length} preguntas`} onPress={start} />
        )}
      </ScrollView>
    );
  }

  const q = running[index];

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.strip}>
        {running.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stripCell,
              i < answers.length && (answers[i] ? styles.stripHit : styles.stripMiss),
            ]}
          />
        ))}
      </View>

      <View style={styles.prompt}>
        <Text style={styles.promptNum}>
          Pregunta {index + 1} de {running.length}
        </Text>
        <Text style={styles.promptText}>{q.text}</Text>
      </View>

      <View style={styles.opts}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isChosen = i === selected;
          const revealed = selected !== null;
          return (
            <Pressable
              key={i}
              onPress={() => choose(i)}
              style={[
                styles.opt,
                revealed && isCorrect && styles.optRight,
                revealed && isChosen && !isCorrect && styles.optWrong,
              ]}
            >
              <Text style={[styles.optLetter, revealed && isCorrect && styles.optLetterRight]}>{LETTERS[i]}</Text>
              <Text style={styles.optText}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected !== null && (
        <View style={styles.nextWrap}>
          <Button title={index + 1 >= running.length ? 'Ver resultado' : 'Siguiente'} onPress={next} />
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    modeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
    addRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
    chipsRow: { marginBottom: spacing.sm },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

    strip: { flexDirection: 'row', gap: 3, marginBottom: spacing.md },
    stripCell: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt },
    stripHit: { backgroundColor: colors.ok },
    stripMiss: { backgroundColor: colors.accent },

    prompt: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    promptNum: { fontFamily: mono, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent },
    promptText: { color: colors.text, fontSize: 16, fontWeight: '600', lineHeight: 22, marginTop: spacing.xs },

    opts: { gap: spacing.sm },
    opt: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    optRight: { borderColor: colors.ok, backgroundColor: colors.accentMuted },
    optWrong: { borderColor: colors.danger },
    optLetter: { fontFamily: mono, fontSize: 12, color: colors.textMuted, fontWeight: '700' },
    optLetterRight: { color: colors.ok },
    optText: { color: colors.text, fontSize: 14, flex: 1 },

    nextWrap: { marginTop: spacing.md },

    result: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    resultScore: { fontFamily: mono, fontSize: 34, fontWeight: '700', color: colors.text, lineHeight: 38 },
    resultOf: { fontSize: 17, color: colors.textMuted },

    optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    radio: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    radioText: { fontFamily: mono, fontSize: 12, fontWeight: '700', color: colors.textMuted },
    radioTextSelected: { color: colors.accent },
    optionInput: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 14,
    },

    bankRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bankBody: { flex: 1 },
    bankText: { color: colors.text, fontSize: 14, lineHeight: 19 },
    bankMeta: { fontFamily: mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted, marginTop: 3 },
    remove: { color: colors.textMuted, fontSize: 15, paddingHorizontal: spacing.xs },
  });
}
