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

- `App.tsx` — root component; before rendering anything it awaits `seedGearIfNeeded()` (see below), then wraps
  everything in `ThemeProvider` and sets up `NavigationContainer` with a bottom tab navigator (6 tabs, one per
  screen). Nav theme, tab bar colors, and the status bar style all read from `useTheme()` so they follow the active
  theme live; the tab bar height/padding add `useSafeAreaInsets().bottom` so it doesn't sit under Android's
  gesture/button nav.
- `src/types.ts` — shared domain types: `GearItem`, `Course`, `Material`, `Question`, `FamilyMember`, `FamilyPlan`
  (an `address` plus four `EvacuationRoute`s labelled A–D, each a meeting point + evacuation plan — `emptyFamilyPlan()`
  builds the blank shape).
- `src/storage.ts` — `useStorageList<T>(key)`, a generic hook giving `{ items, loading, addItem, updateItem, removeItem }`
  backed by AsyncStorage, JSON-serialized under one storage key per entity list. All screens use this instead of a
  custom backend/database — add new entity types by defining a type in `types.ts` and calling the hook with a new key.
  `useStorageObject<T>(key, empty)` is the same idea for a single record instead of a list (used for `FamilyPlan`,
  which has one fixed shape rather than add/remove entries).
- `src/seedData.ts` — `SEED_BAGS` (the 4 backpacks from the "Día Cero" 72h guide: líder, apoyo, niñ@ 1, niñ@ 2) and
  `SEED_ITEMS_BY_BAG` (one items array per bag, transcribed straight from the guide rather than consolidated, so the
  suggested checklist loads split by mochila instead of as one flat list). `buildSeed()` assigns fresh ids to both
  and wires each item's `bagId` to the bag generated alongside it in that same call — used both by
  `seedGearIfNeeded()` (below) and by the "Cargar checklist sugerido" fallback button in `ChecklistScreen`'s empty
  state. `seedGearIfNeeded()`, called once from `App.tsx` before the first screen mounts, writes a `buildSeed()`
  result directly to `gonza:bags` and `gonza:gear` in AsyncStorage only if both lists are still empty, then sets a
  flag so it never runs again — it will not resurrect bags or items a user deleted. It writes directly rather than
  looping `addItem`/`addBag`, since looping would race `useStorageList`'s closured `items` state and silently drop
  all but the last write.
- `src/ui/theme.ts` — spacing/radius tokens, dark/light base palettes, and the accent presets (`ACCENT_PRESETS`:
  `senal` / `oliva` / `arena` / `acero`); `buildColors(scheme, accentKey)` combines them into the active `Colors`.
  Also exports `mono` (the platform monospace face used for titles, labels and figures), `progressColor(colors, ratio)`
  for the shared short/halfway/on-track colour rule, and `normalizeAccentKey` which maps the pre-redesign accent keys
  onto the current ones so a stored preference survives the rename.
- `src/ui/ThemeContext.tsx` — `ThemeProvider` + `useTheme()`. Persists theme mode (`dark` / `light` / `system`) and
  accent choice to AsyncStorage, resolves `system` against `useColorScheme()`, and exposes `{ colors, spacing, radius, scheme, mode, setMode, accentKey, setAccentKey }`.
- `src/ui/components.tsx` — shared primitives (`Screen`, `ScreenHeader`, `Card`, `Field`, `Label`, `Chip`, `Button`,
  `Meter`, `Bar`, `EmptyState`), each reading colors from `useTheme()` and building their `StyleSheet` via `useMemo`
  so they re-theme live. `ScreenHeader` is the section-code + title masthead every screen opens with.
- `src/ui/icons.tsx` — tab icons built from plain `View`s (borders and radii), not SVG or an icon font. Both of those
  are native modules: adding one would force a fresh `eas build` and break the over-the-air update path, so icon work
  must stay within RN primitives unless a native rebuild is already planned.
- `src/catalog.ts` — `CATALOG_ITEMS`, ~90 common gear names/categories (no quantities) offered in the "+ Ítem"
  picker so most entries can be tapped instead of typed. Independent from `seedData.ts`'s starter checklist.
- `src/ui/ItemPickerModal.tsx` — search + tap-to-select bottom sheet over `CATALOG_ITEMS`, grouped by category via
  `SectionList`. Built entirely on RN's own `Modal`/`SectionList`, no extra dependency, so it ships as a plain OTA
  update like the rest of the UI.
- `src/ui/appIcon.ts` — launcher-icon switching over `expo-alternate-app-icons`. The `require` is guarded and every
  call no-ops when the native module is absent, so an OTA update can't crash an older install; the Ajustes section
  only renders when `iconsSupported()` is true. The alternates themselves are declared in the `app.json` plugin
  entry — adding or renaming one is a native change and needs a rebuild, but switching between the declared ones is
  instant and offline.
- `src/knotsData.ts` — `KNOTS`, static reference content (name, use, numbered steps, a diagram `require()`d from
  `src/assets/knots/`) for Material's "Guía de nudos" mode. Not user data, so it isn't read through `useStorageList`
  like the rest of Material — it's a plain constant rendered read-only. The diagrams are plain PNGs (RN's own
  `Image`, not SVG or a native renderer), so this ships as a normal OTA update like everything else in `src/`.
- `src/screens/`
  - `ChecklistScreen.tsx` — gear/supplies checklist. Two levels: a `resumen` view (readiness percentage, segmented
    `Meter`, and one `Bar` per row) drills into a single group's item list, or into all items. The resumen groups
    either by `GearCategory` or by `Bag` (a "Por categoría" / "Por mochila" toggle) — a `GearItem.bagId` is which
    packed backpack it's in, and a shared item needed in two bags is two separate `GearItem` rows (each with its
    own bagId and have status), not one item referencing many bags, since each bag needs its own physical unit
    anyway. Items with no bag, or an orphaned `bagId` left behind by a deleted bag, fall into a synthetic
    "Sin mochila" group computed on the fly rather than stored.
  - `CoursesScreen.tsx` — courses tracker with status (`pendiente` / `en_curso` / `hecho`), cycled by tapping a row.
  - `MaterialScreen.tsx` — two modes via Chip toggle: `Mis notas` (study notes/links, optionally linked to a
    course — the original CRUD list) and `Guía de nudos`, a read-only, tap-to-expand list over the static `KNOTS`
    from `src/knotsData.ts`.
  - `QuizScreen.tsx` — question bank (CRUD) plus a "Simulacro" mode that runs a shuffled quiz over all or
    course-filtered questions and scores it.
  - `FamilyScreen.tsx` — two modes: `Integrantes` (CRUD list of `FamilyMember`, one per person: contacts, blood
    type, allergies) and `Plan de emergencia` (the single `FamilyPlan` — address plus routes A–D). The plan is
    edited as local draft state and written in one `save()` call from an explicit button, not per-keystroke.
  - `SettingsScreen.tsx` — theme mode and accent color picker, backed by `useTheme()`.

Screens follow the same pattern for theme-aware styles: read `colors` from `useTheme()`, then
`const styles = useMemo(() => makeStyles(colors), [colors])` where `makeStyles` is a module-level function
returning `StyleSheet.create(...)`. Don't build a `StyleSheet` from a static color import at module scope — it won't
react to theme changes.

## Distribution & updates

The app is distributed as a standalone Android APK (`eas build --platform android --profile preview`, see `eas.json`)
installed directly on family members' phones — not through Expo Go or the Play Store. JS/asset-only changes ship as
**OTA updates** via `expo-updates`: `.github/workflows/eas-update.yml` runs `eas update --branch preview` on every
push to `claude/preparacionistas-app-d9fljw`, and installed apps pick it up automatically on next launch (no
reinstall, no PC). This requires an `EXPO_TOKEN` repo secret tied to the Expo account that owns the project.

`runtimeVersion` uses the `appVersion` policy (`app.json`), so an OTA update only applies to installs whose native
`version` matches. Use that deliberately: when a change adds or depends on a native module, bump `expo.version` in
the same commit so the update cannot reach older installs that lack the module. That is why shipping the icon
switcher moved the app to 1.2.0. That means:
- Bumping `expo.version` in `app.json`, or any native-level change (new native dependency, permissions, app icon,
  package name) requires a fresh `eas build` — the "one more PC session" case — since existing installs can't pick
  those up over the air.
- Everything else (screens, styles, logic, the theme system) ships as a plain OTA update once the above CI is set up.

## Visual direction

The app is styled as a **field inventory sheet**, not a generic dark app: neutrals biased toward olive rather than
pure grey, monospace for titles/labels/figures with the system sans for running text, squared-off radii, and signal
orange as the default accent. Colour carries one meaning each — the accent marks interactive and "short on this",
`colors.ok` (olive) marks done, `colors.warning` (sand) marks halfway. Screens open with a data block (readiness,
progress, score strip) rather than an empty list, so nothing reads as a blank page.

## Conventions

- UI copy is in Spanish (Argentina), matching the target user.
- Keep new entities local-first: no network calls, no auth beyond what's needed for EAS builds/updates. If a backend
  is ever introduced for app data, treat it as a deliberate scope change, not an incidental addition.
