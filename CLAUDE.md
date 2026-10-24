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
  everything in `ThemeProvider` and sets up `NavigationContainer` with a bottom tab navigator (6 visible tabs: Inicio,
  Equipo, Cursos, Práctica, Material, Familia — Ajustes is still a registered screen but hidden from the bar with
  `tabBarItemStyle: { display: 'none' }`, reached from the ⚙ in Inicio's header; Inicio is the `initialRouteName`). Nav theme, tab bar colors, and the status bar style all read from `useTheme()` so they follow the active
  theme live; the tab bar height/padding add `useSafeAreaInsets().bottom` so it doesn't sit under Android's
  gesture/button nav.
- `src/types.ts` — shared domain types: `GearItem`, `Course`, `Material`, `Question`, `FamilyMember`, `FamilyPlan`
  (an `address` plus four `EvacuationRoute`s labelled A–D, each a meeting point + evacuation plan — `emptyFamilyPlan()`
  builds the blank shape).
- `src/storage.ts` — `useStorageList<T>(key)`, a generic hook giving `{ items, loading, addItem, updateItem, removeItem }`
  backed by AsyncStorage, JSON-serialized under one storage key per entity list. All screens use this instead of a
  custom backend/database — add new entity types by defining a type in `types.ts` and calling the hook with a new key.
  Both hooks return a `reload()` — tabs stay mounted, so a hook only reads storage once at startup; a screen that
  shows data edited elsewhere (Inicio) calls `reload()` from `useFocusEffect`.
  `useStorageObject<T>(key, empty)` is the same idea for a single record instead of a list (used for `FamilyPlan`,
  which has one fixed shape rather than add/remove entries).
- `src/progress.ts` — pure progress maths shared by Equipo and Inicio: `readiness`, `byCategory`, `byBag` (with the
  synthetic `UNASSIGNED` "Sin mochila" row) and `topPending` (water and health first). Keep one source so both
  screens always show the same numbers.
- `src/alerts.ts` — `computeAlerts(items, now)`: the single source for "what needs attention", used by Inicio's
  "Para revisar" card (and meant for the notification scheduler later). Reads three optional `GearItem` fields:
  `expiresAt` (free text, "MM/AAAA" = end of that month, or "DD/MM/AAAA"; anything unreadable is ignored rather
  than blocking a save), `reviewEveryMonths` and `lastReviewedAt` (periodic checks such as batteries; an item
  never reviewed counts as due). Buckets: vencidos, vencen en ≤30 días, controles a ≤7 días. Equipo shows the same
  state under each item and a "Revisado hoy" button that stamps `lastReviewedAt`; items are now editable via ✎.
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
  `senal` / `oliva` / `arena` / `acero` / `menta` / `dorado`) and the three `STYLE_PRESETS`; `buildColors(scheme, accentKey)` combines them into the active `Colors`.
  Also exports `mono` (the platform monospace face used for titles, labels and figures), `progressColor(colors, ratio)`
  for the shared short/halfway/on-track colour rule, and `normalizeAccentKey` which maps the pre-redesign accent keys
  onto the current ones so a stored preference survives the rename.
- `src/ui/ThemeContext.tsx` — `ThemeProvider` + `useTheme()`. Persists theme mode (`dark` / `light` / `system`) and
  accent choice to AsyncStorage, resolves `system` against `useColorScheme()`, and exposes `{ colors, spacing, radius, scheme, mode, setMode, accentKey, setAccentKey }`.
- `src/ui/components.tsx` — shared primitives (`Screen`, `ScreenHeader`, `Card`, `Field`, `Label`, `Chip`, `Button`,
  `Meter`, `Bar`, `EmptyState`), each reading colors from `useTheme()` and building their `StyleSheet` via `useMemo`
  so they re-theme live. `ScreenHeader` is the section-code + title masthead every screen opens with.
- `src/ui/icons.tsx` — tab icons drawn with `react-native-svg` (native; arrived in the 1.3.0 build). `TabIcon` renders one
  of seven paths in three user-selectable variants (`fino` / `grueso` / `duotono`, Ajustes → Íconos, persisted as
  `gonza:theme-icons`); `ICON_SETS` lists them for the picker.
- `src/ui/fonts.ts` — bundled fonts (Plus Jakarta Sans, Barlow Condensed, Fraunces, Figtree, JetBrains Mono from
  `@expo-google-fonts/*`, one file per weight imported by subpath so only the needed weights ship). `ThemeProvider`
  registers them with `useFonts` and holds the first frame until they load. `STYLE_FONTS` is each style's own
  title/label pairing; `FONT_CHOICES` are the picks offered in Ajustes → Fuente de títulos (`gonza:theme-font`,
  default "Según el estilo").
- `src/backup.ts` — Ajustes → Copia de seguridad: `exportBackup()` writes every `gonza:*` key to a JSON file and opens the
  share sheet; `pickBackup()` + `applyBackup()` restore one (validated by a `format` marker, replaces all data, always
  sets the seed flag, then the app reloads via `Updates.reloadAsync()`).
- `src/notifications.ts` — local reminders over `expo-notifications` (no server): `rescheduleReminders(items)` cancels all
  and re-schedules a reminder `leadDays` before each expiry, on the expiry day, when each periodic check falls due, plus
  a next-morning digest when `computeAlerts` already has something. Inicio calls it whenever it sees new gear data;
  settings live under `gonza:notifications` (off by default, permission asked when enabled). Android may delay these
  in battery-saver mode, so Inicio's "Para revisar" card remains the reliable source.
- `src/catalog.ts` — `CATALOG_ITEMS`, ~240 common gear names/categories offered in the "+ Ítem"
  picker so most entries can be tapped instead of typed (an optional `quantity` hint prefills "Cantidad", e.g.
  "Obligatorio por ley" on the Auto items). Independent from `seedData.ts`'s starter checklist. Categories (`GearCategory`)
  are prepper-style: Agua, Alimentos, Fuego, Cocina, Salud, Herramientas, Refugio y abrigo, Navegación y señales,
  Comunicación, Energía, Auto, Documentos, Otros. Salud follows the Red Cross kit list as loose items (no "Botiquín"
  category); Auto follows the Argentine Ley de Tránsito (matafuego + balizas obligatorios). `migrateCategoriesIfNeeded()`
  in `seedData.ts` (flag `gonza:categories-v2`) moves already-saved items onto the new categories by exact name.
  Items also carry an optional `priority` (`esencial` / `recomendado` / `opcional`, `GearItem.priority`; absent counts as
  `recomendado`). The catalog assigns one per item via its `ESSENTIAL_NAMES` / `OPTIONAL_NAMES` sets, the Equipo form has a
  "Prioridad" chip row, `readiness()` weights the percentage 3/2/1 and `topPending()` lists essentials first.
  `migratePrioritiesIfNeeded()` (flag `gonza:priorities-v1`) backfills saved items by exact name.
- `src/situations.ts` — `SITUATIONS` (apagón, evacuación, inundación, terremoto, incendio, ola de calor, auto) for Equipo's
  "Por situación" grouping. Membership is derived from an item's exact catalog name (Auto = the whole `Auto` category), so
  no stored field or migration; one item can sit in several situations. `bySituation()` feeds the summary rows,
  `itemsForSituation()` the drill-down list.
- `src/tips.ts` — `tipFor(name)`: "Qué mirar antes de comprar" notes for ~35 key items (water filter, torniquete, auto kit…),
  looked up by exact catalog name at render time and shown as "Mirá: …" under the item in Equipo. No stored field.
- `src/carKit.ts` — `buildCarKit(existing, bagId)`: ~30 catalog items (with their priorities) for Equipo's "Cargar checklist de
  auto" button. `ChecklistScreen` reuses a bag whose name contains "auto" or creates "🚗 Mochila de auto"; names already in
  that bag are skipped, so tapping it twice never duplicates. The loaded items are plain, editable `GearItem`s.
- `src/ui/ItemPickerModal.tsx` — two-step bottom sheet over `CATALOG_ITEMS`: first a list of categories (with item
  counts), then only that category's items with a search box scoped to it. The category state lives in the outer
  component so Android's back button steps back to the categories before closing. Built entirely on RN's own
  `Modal`/`FlatList`, no extra dependency, so it ships as a plain OTA update like the rest of the UI.
- `src/ui/appIcon.ts` — launcher-icon switching over `expo-alternate-app-icons`. The `require` is guarded and every
  call no-ops when the native module is absent, so an OTA update can't crash an older install; the Ajustes section
  only renders when `iconsSupported()` is true. The alternates themselves are declared in the `app.json` plugin
  entry — adding or renaming one is a native change and needs a rebuild, but switching between the declared ones is
  instant and offline.
- `src/knotsData.ts` — `KNOTS`, static reference content (name, use, numbered steps, a diagram `require()`d from
  `src/assets/knots/`) for Material's "Guía de nudos" mode. Not user data, so it isn't read through `useStorageList`
  like the rest of Material — it's a plain constant rendered read-only. The diagrams are plain PNGs (RN's own
  `Image`, not SVG or a native renderer), so this ships as a normal OTA update like everything else in `src/`.
- `src/hazardsData.ts` — `HAZARDS`, static antes/durante/después guides (crecida del Paraná, tormentas, corte de
  luz, ola de calor) for Material's "Guías de riesgo" mode. Same static-constant pattern as `knotsData.ts`.
  Transcribed from a reference the user shared that also had a live Paraná river-level gauge — that part was left
  out since it needs a real hydrometric data feed, which doesn't fit this app's local-first, no-network design.
- `src/emergencyNumbers.ts` — `EMERGENCY_NUMBERS`, static tap-to-call reference numbers (911, SAME, Bomberos,
  Defensa Civil Rosario) shown at the top of `FamilyScreen`'s "Plan de emergencia" mode. Each entry has a `dial`
  (digits-only, for `Linking.openURL('tel:'+dial)`) separate from its `display` string.
- `src/screens/`
  - `HomeScreen.tsx` — Inicio: readiness % + `Meter`, 911/SAME tap-to-call and a "Plan de salida" shortcut, per-mochila
    bars, the 5 most important pending items, short notices for gaps in the family plan, and a courses line. Reads
    everything through the storage hooks and `reload()`s on focus. Navigates with params: `Equipo` `{ bagId }` opens
    that mochila, `Familia` `{ mode: 'plan' }` opens the plan; both screens consume the param on focus and clear it.
  - `ChecklistScreen.tsx` — gear/supplies checklist. Two levels: a `resumen` view (readiness percentage, segmented
    `Meter`, and one `Bar` per row) drills into a single group's item list, or into all items. The resumen groups
    either by `GearCategory` or by `Bag` (a "Por categoría" / "Por mochila" toggle) — a `GearItem.bagId` is which
    packed backpack it's in, and a shared item needed in two bags is two separate `GearItem` rows (each with its
    own bagId and have status), not one item referencing many bags, since each bag needs its own physical unit
    anyway. Items with no bag, or an orphaned `bagId` left behind by a deleted bag, fall into a synthetic
    "Sin mochila" group computed on the fly rather than stored. In "Por mochila" each bag's progress row carries ✎ (opens the create form pre-filled, in edit mode — `updateItem`
    instead of `addItem`, same pattern as `FamilyScreen`'s member rows) and ✕ (confirm, then delete; its items fall into
    "Sin mochila"); there is no separate "Mochilas creadas" list. The emoji field offers `BAG_EMOJI_PRESETS` (a tap-to-pick row) plus free text for anything not
    covered — plain unicode characters, so no icon font/SVG dependency.
  - `CoursesScreen.tsx` — courses tracker with status (`pendiente` / `en_curso` / `hecho`), cycled by tapping a row.
  - `MaterialScreen.tsx` — three modes via Chip toggle: `Mis notas` (study notes/links, optionally linked to a
    course — the original CRUD list), `Guía de nudos`, and `Guías de riesgo` — the latter two are read-only,
    tap-to-expand lists over the static `KNOTS` (`src/knotsData.ts`) and `HAZARDS` (`src/hazardsData.ts`).
  - `QuizScreen.tsx` — question bank (CRUD) plus a "Simulacro" mode that runs a shuffled quiz over all or
    course-filtered questions and scores it.
  - `FamilyScreen.tsx` — two modes: `Integrantes` (CRUD list of `FamilyMember`, one per person: contacts, blood
    type, allergies — a phone1 shows a tap-to-call 📞) and `Plan de emergencia` (the static `EMERGENCY_NUMBERS`
    tap-to-call list, then the single `FamilyPlan` — address plus routes A–D). The plan is edited as local draft
    state and written in one `save()` call from an explicit button, not per-keystroke. Below that, "Enviar a la
    familia" lists every member with a `phone1` and opens `https://wa.me/<digits>?text=...` (via `Linking`) with
    the current draft formatted by `buildPlanMessage()` — WhatsApp opens with the chat and message prefilled, the
    user still taps send themselves. This is deliberately not real sync: the app stays local-first/no-backend, so
    "share with the family" means "hand them a prefilled message," not a shared live document. `waLink()` strips
    non-digits from the stored phone string; a number saved without its country code may open the wrong chat.
    The address and each route also take an optional `mapsLink` (a pasted Google Maps share URL) — `mapsUrlFor()`
    opens that link when present, otherwise builds a `google.com/maps/search` URL from the free-text
    address/meeting point, so "Abrir en Maps" and the links included in `buildPlanMessage()` work either way. No
    native maps SDK: same plain-`Linking`-URL approach as the `tel:`/`wa.me` links on this screen, so it stays OTA.
  - `SettingsScreen.tsx` — theme mode and accent color picker, backed by `useTheme()`.

Every list screen (Equipo items and mochilas, Cursos, Material notas, Preguntas, Integrantes) ends with a danger-variant
"Vaciar …" button (a small outlined red button, `Button variant="danger"`) that goes through `confirmClear()`
(`src/ui/components.tsx`, an `Alert` confirm) and then the hook's `clearAll()` (`useStorageList`, a single `persist([])`).
Equipo's "Vaciar equipo…" is the exception: it opens `ChoiceSheet` (`src/ui/ChoiceSheet.tsx`, a small bottom sheet) with
"¿Qué querés vaciar?" — only the ticked items, only the pending ones, one category, one mochila, or everything — and the
partial options confirm with the exact count (`confirmRemove()`) before calling the hook's `removeMany(ids)`. Cursos (hechos / en curso / pendientes / todos) and Preguntas (de un curso / sin curso / todas) use the same sheet. Clearing doesn't reset the seed flag, so the starter
checklist won't silently reload — Equipo's empty state still offers "Cargar checklist sugerido".

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

**1.3.0 (versionCode 4)** added native modules: `react-native-svg`, `expo-contacts` (family "Elegir de contactos" uses
`expo-contacts/legacy` `presentContactPickerAsync`; permission `READ_CONTACTS`), `expo-notifications`
(`POST_NOTIFICATIONS`), `expo-font`, `expo-document-picker`, `expo-sharing` and `expo-file-system/legacy`. Installs still on
1.2.0 stop receiving updates (different runtimeVersion) until they install the 1.3.0 APK, which goes over the existing
install and keeps its data (same package). Build flow on the PC: `git pull`, `npm install`, then
`eas build --platform android --profile preview`.

## Visual direction

The look is a selectable **style** (Ajustes → Estilo), independent of light/dark mode and accent: `limpio` (cool
off-white, white shadowed cards, large radii, sans titles, teal), `tactico` (near-black/amber, small radii,
condensed uppercase titles, flat bordered cards) and `oliva` (the original olive/sand "field sheet", serif titles,
monospace labels — the default for existing installs). A style supplies the base palette per scheme, corner radii,
typefaces, title transform and whether cards use shadow or a hairline border (`STYLE_PRESETS` in `src/ui/theme.ts`).
Switching style also resets the accent to that style's default (`defaultAccent`); the accent picker still overrides.
Fonts are bundled files (see `src/ui/fonts.ts`); each style has its own pairing and the user can override the title font. Colour still carries one meaning each: accent marks interactive and "short on
this", `colors.ok` marks done, `colors.warning` marks halfway.

Style tokens ride on the `colors` object every screen already gets (`colors.radius`, `colors.fonts.{title,label}`,
`colors.titleTransform`, `colors.elevated`), so `makeStyles(colors)` re-themes live. Never import a static radius or
font into a screen — read them from `colors`.

## Conventions

- UI copy is in Spanish (Argentina), matching the target user.
- Keep new entities local-first: no network calls, no auth beyond what's needed for EAS builds/updates. If a backend
  is ever introduced for app data, treat it as a deliberate scope change, not an incidental addition.
