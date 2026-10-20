import { Bag, GEAR_CATEGORIES, GearCategory, GearItem, GearPriority } from './types';

/** Sentinel bag id for items with no bag assigned, so they still show up in "por mochila". */
export const UNASSIGNED = '__sin_mochila__';

export interface ProgressRow {
  key: string;
  label: string;
  total: number;
  done: number;
}

const PRIORITY_WEIGHT: Record<GearPriority, number> = { esencial: 3, recomendado: 2, opcional: 1 };
const PRIORITY_ORDER: GearPriority[] = ['esencial', 'recomendado', 'opcional'];

/** Items saved before priorities existed count as 'recomendado'. */
export function priorityOf(it: GearItem): GearPriority {
  return it.priority ?? 'recomendado';
}

/** `done`/`total` are plain item counts; `ratio` is weighted so essential items move the percentage more. */
export function readiness(items: GearItem[]) {
  const done = items.filter((it) => it.have).length;
  const weight = (it: GearItem) => PRIORITY_WEIGHT[priorityOf(it)];
  const totalWeight = items.reduce((sum, it) => sum + weight(it), 0);
  const doneWeight = items.filter((it) => it.have).reduce((sum, it) => sum + weight(it), 0);
  return { done, total: items.length, pending: items.length - done, ratio: totalWeight ? doneWeight / totalWeight : 0 };
}

export function byCategory(items: GearItem[]): (ProgressRow & { key: GearCategory })[] {
  return GEAR_CATEGORIES.map((c) => {
    const list = items.filter((it) => it.category === c);
    return { key: c, label: c, total: list.length, done: list.filter((it) => it.have).length };
  }).filter((row) => row.total > 0);
}

/** One row per bag, plus a synthetic "Sin mochila" row for items with no bag or an orphaned bagId. */
export function byBag(items: GearItem[], bags: Bag[]): ProgressRow[] {
  const bagIds = new Set(bags.map((b) => b.id));
  const rows = bags.map((b) => {
    const list = items.filter((it) => it.bagId === b.id);
    return {
      key: b.id,
      label: b.emoji ? `${b.emoji} ${b.name}` : b.name,
      total: list.length,
      done: list.filter((it) => it.have).length,
    };
  });
  const unassigned = items.filter((it) => !it.bagId || !bagIds.has(it.bagId));
  if (unassigned.length > 0) {
    rows.push({
      key: UNASSIGNED,
      label: 'Sin mochila',
      total: unassigned.length,
      done: unassigned.filter((it) => it.have).length,
    });
  }
  return rows;
}

const PENDING_PRIORITY: GearCategory[] = [
  'Agua', 'Salud', 'Fuego', 'Refugio y abrigo', 'Energía', 'Alimentos', 'Cocina', 'Auto', 'Navegación y señales',
  'Comunicación', 'Herramientas', 'Documentos', 'Otros',
];

/** The most important items still missing: essentials first, then by category (water and health first). */
export function topPending(items: GearItem[], n: number): GearItem[] {
  return items
    .filter((it) => !it.have)
    .sort(
      (a, b) =>
        PRIORITY_ORDER.indexOf(priorityOf(a)) - PRIORITY_ORDER.indexOf(priorityOf(b)) ||
        PENDING_PRIORITY.indexOf(a.category) - PENDING_PRIORITY.indexOf(b.category)
    )
    .slice(0, n);
}
