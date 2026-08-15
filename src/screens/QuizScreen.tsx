import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState, Field, Screen } from '../ui/components';
import { colors, spacing } from '../ui/theme';
import { useStorageList } from '../storage';
import { Course, Question } from '../types';

type Mode = 'banco' | 'simulacro';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizScreen() {
  const { items: questions, loading, addItem, removeItem } = useStorageList<Question>('gonza:questions');
  const { items: courses } = useStorageList<Course>('gonza:courses');
  const [mode, setMode] = useState<Mode>('banco');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Simulacros</Text>
            <Text style={styles.subtitle}>{loading ? 'Cargando…' : `${questions.length} preguntas`}</Text>
          </View>
        </View>
        <View style={styles.modeRow}>
          <Chip label="Banco de preguntas" selected={mode === 'banco'} onPress={() => setMode('banco')} />
          <Chip label="Simulacro" selected={mode === 'simulacro'} onPress={() => setMode('simulacro')} />
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
            <Text style={styles.fieldLabel}>Opciones (marcá la correcta)</Text>
            {optionTexts.map((opt, i) => (
              <View key={i} style={styles.optionRow}>
                <Pressable
                  style={[styles.radio, correctIndex === i && styles.radioSelected]}
                  onPress={() => setCorrectIndex(i)}
                />
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Opción ${i + 1}`}
                  placeholderTextColor={colors.textMuted}
                  value={opt}
                  onChangeText={(v) => setOption(i, v)}
                />
              </View>
            ))}
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
        {questions.length === 0 && !showForm && <EmptyState text="Todavía no cargaste preguntas. Tocá + Pregunta para empezar." />}
        {questions.map((q) => (
          <View key={q.id} style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{q.text}</Text>
              <Text style={styles.rowMeta}>
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
  const [courseFilter, setCourseFilter] = useState<string | 'Todos'>('Todos');
  const [running, setRunning] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const pool = useMemo(
    () => (courseFilter === 'Todos' ? questions : questions.filter((q) => q.courseId === courseFilter)),
    [questions, courseFilter]
  );

  function start() {
    setRunning(shuffle(pool));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  function choose(optionIndex: number) {
    if (selected !== null || !running) return;
    setSelected(optionIndex);
    if (optionIndex === running[index].correctIndex) {
      setScore((s) => s + 1);
    }
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
          <Card>
            <Text style={styles.resultTitle}>Resultado</Text>
            <Text style={styles.resultScore}>
              {score} / {running.length} correctas
            </Text>
          </Card>
        )}
        <View style={{ marginTop: spacing.md }}>
          <Text style={styles.fieldLabel}>Curso (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            <Chip label="Todos" selected={courseFilter === 'Todos'} onPress={() => setCourseFilter('Todos')} />
            {courses.map((c) => (
              <Chip key={c.id} label={c.name} selected={courseFilter === c.id} onPress={() => setCourseFilter(c.id)} />
            ))}
          </ScrollView>
        </View>
        {pool.length === 0 ? (
          <EmptyState text="No hay preguntas cargadas para este filtro todavía." />
        ) : (
          <Button title={`Empezar simulacro (${pool.length} preguntas)`} onPress={start} />
        )}
      </ScrollView>
    );
  }

  const q = running[index];

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <Text style={styles.progress}>
        Pregunta {index + 1} / {running.length}
      </Text>
      <Card>
        <Text style={styles.quizQuestion}>{q.text}</Text>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isChosen = i === selected;
          const revealed = selected !== null;
          return (
            <Pressable
              key={i}
              onPress={() => choose(i)}
              style={[
                styles.quizOption,
                revealed && isCorrect && styles.quizOptionCorrect,
                revealed && isChosen && !isCorrect && styles.quizOptionWrong,
              ]}
            >
              <Text style={styles.quizOptionText}>{opt}</Text>
            </Pressable>
          );
        })}
        {selected !== null && <Button title={index + 1 >= running.length ? 'Ver resultado' : 'Siguiente'} onPress={next} />}
      </Card>
    </ScrollView>
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
  modeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  addRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  fieldLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  chipsRow: { marginBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
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
  remove: { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing.xs },
  progress: { color: colors.textMuted, marginBottom: spacing.sm },
  quizQuestion: { color: colors.text, fontSize: 17, fontWeight: '600', marginBottom: spacing.md },
  quizOption: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  quizOptionCorrect: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  quizOptionWrong: { borderColor: colors.danger, backgroundColor: '#3A2320' },
  quizOptionText: { color: colors.text },
  resultTitle: { color: colors.textMuted, fontSize: 14 },
  resultScore: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: spacing.xs },
});
