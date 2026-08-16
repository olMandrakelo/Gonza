# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Preparacionista** is a personal Expo (React Native + TypeScript) mobile app for tracking prepper/emergency-readiness
gear, courses, study material, and practice quizzes. It's single-user, local-first: all data is stored on-device
with `@react-native-async-storage/async-storage`, no backend or auth.

## Commands

- `npm install` — install dependencies
- `npm start` — start the Expo dev server (then press `i`/`a`/`w`, or scan the QR code with Expo Go)
- `npm run ios` / `npm run android` / `npm run web` — start targeting a specific platform
- `npm run typecheck` — `tsc --noEmit`

There is no test suite yet.

## Architecture

- `App.tsx` — root component; wraps everything in `ThemeProvider` and sets up `NavigationContainer` with a bottom
  tab navigator (5 tabs, one per screen). Nav theme, tab bar colors, and the status bar style all read from
  `useTheme()` so they follow the active theme live.
- `src/types.ts` — shared domain types: `GearItem`, `Course`, `Material`, `Question`.
- `src/storage.ts` — `useStorageList<T>(key)`, a generic hook giving `{ items, loading, addItem, updateItem, removeItem }`
  backed by AsyncStorage, JSON-serialized under one storage key per entity list. All screens use this instead of a
  custom backend/database — add new entity types by defining a type in `types.ts` and calling the hook with a new key.
- `src/ui/theme.ts` — spacing/radius tokens, dark/light base palettes, and the accent color presets (`ACCENT_PRESETS`);
  `buildColors(scheme, accentKey)` combines them into the active `Colors` object.
- `src/ui/ThemeContext.tsx` — `ThemeProvider` + `useTheme()`. Persists theme mode (`dark` / `light` / `system`) and
  accent choice to AsyncStorage, resolves `system` against `useColorScheme()`, and exposes `{ colors, spacing, radius, scheme, mode, setMode, accentKey, setAccentKey }`.
- `src/ui/components.tsx` — shared primitives (`Screen`, `Card`, `Field`, `Chip`, `Button`, `EmptyState`), each reading
  colors from `useTheme()` and building their `StyleSheet` via `useMemo` so they re-theme live.
- `src/screens/`
  - `ChecklistScreen.tsx` — gear/supplies checklist, grouped by category, toggle "tengo esto" per item.
  - `CoursesScreen.tsx` — courses tracker with status (`pendiente` / `en_curso` / `hecho`), cycled by tapping a row.
  - `MaterialScreen.tsx` — study notes/links, optionally linked to a course.
  - `QuizScreen.tsx` — question bank (CRUD) plus a "Simulacro" mode that runs a shuffled quiz over all or
    course-filtered questions and scores it.
  - `SettingsScreen.tsx` — theme mode and accent color picker, backed by `useTheme()`.

Screens follow the same pattern for theme-aware styles: read `colors` from `useTheme()`, then
`const styles = useMemo(() => makeStyles(colors), [colors])` where `makeStyles` is a module-level function
returning `StyleSheet.create(...)`. Don't build a `StyleSheet` from a static color import at module scope — it won't
react to theme changes.

## Conventions

- UI copy is in Spanish (Argentina), matching the target user.
- Keep new entities local-first: no network calls, no auth. If a backend is ever introduced, treat it as a deliberate
  scope change, not an incidental addition.
