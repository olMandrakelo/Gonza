import { Bag, GEAR_CATEGORIES, GearCategory, GearItem } from './types';

/** Sentinel bag id for items with no bag assigned, so they still show up in "por mochila". */
export const UNASSIGNED = '__sin_mochila__';

export interface ProgressRow {
  key: string;
  label: string;
  total: number;
  done: number;
}

export function readiness(items: GearItem[]) {
  const done = items.filter((it) => it.have).length;
  return { done, total: items.length, pending: items.length - done, ratio: items.length ? done / items.length : 0 };
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

const PENDING_PRIORITY: GearCategory[] = ['Agua', 'Salud', 'Energía', 'Alimentos', 'Comunicación', 'Herramientas', 'Documentos', 'Otros'];

/** The most important items still missing: water and health first, the rest in a fixed order. */
export function topPending(items: GearItem[], n: number): GearItem[] {
  return items
    .filter((it) => !it.have)
    .sort((a, b) => PENDING_PRIORITY.indexOf(a.category) - PENDING_PRIORITY.indexOf(b.category))
    .slice(0, n);
}
