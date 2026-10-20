import { GearItem } from './types';
import { ProgressRow } from './progress';

export type SituationKey = 'apagon' | 'evacuacion' | 'inundacion' | 'terremoto' | 'incendio' | 'calor' | 'auto';

export interface Situation {
  key: SituationKey;
  label: string;
  /** Exact catalog names that serve this situation. An item can belong to several. */
  names: string[];
  /** Also include every item of this category (Auto is a whole category, not a list of names). */
  category?: GearItem['category'];
}

/**
 * Situations for Equipo's "Por situación" view. Membership is derived from an item's name, so it
 * needs no stored field or migration: anything saved from the catalog (or the same name typed by
 * hand) lines up, and items with a custom name simply don't appear under a situation.
 */
export const SITUATIONS: Situation[] = [
  {
    key: 'apagon',
    label: '🔦 Apagón',
    names: [
      'Linterna frontal', 'Powerbank', 'Radio AM/FM a pilas', 'Radio de manivela', 'Efectivo en billetes chicos',
      'Pilas AA/AAA de repuesto', 'Velas', 'Cocina de camping', 'Agua embotellada', 'Panel solar portátil',
      'Generador portátil', 'Lámpara solar',
    ],
  },
  {
    key: 'evacuacion',
    label: '🎒 Evacuación',
    names: [
      'Mochila de evacuación 72 h', 'Agua embotellada', 'Filtro de agua portátil', 'Barritas energéticas', 'Manta térmica',
      'Linterna frontal', 'Powerbank', 'Fotocopias de DNI', 'Medicación personal (crónicos)', 'Torniquete (CAT)',
      'Gasas estériles 5x5 y 10x10 cm', 'Silbato de emergencia', 'Brújula', 'Mapa físico de la zona',
      'Pendrive con documentación',
    ],
  },
  {
    key: 'inundacion',
    label: '🌊 Inundación',
    names: [
      'Pastillas potabilizadoras', 'Agua embotellada', 'Poncho impermeable', 'Calzado de repuesto', 'Linterna frontal',
      'Radio AM/FM a pilas', 'Radio de manivela', 'Bolsas ziploc', 'Pendrive con documentación',
      'Bolsa de vivac de emergencia',
    ],
  },
  {
    key: 'terremoto',
    label: '🏚️ Terremoto',
    names: [
      'Silbato de emergencia', 'Linterna frontal', 'Torniquete (CAT)', 'Apósitos compresivos (2)', 'Guantes de trabajo',
      'Barbijo FFP2 / FFP3 (humo y polvo)', 'Agua embotellada', 'Radio AM/FM a pilas', 'Calzado de repuesto',
      'Multiherramienta (alicate)',
    ],
  },
  {
    key: 'incendio',
    label: '🔥 Incendio',
    names: [
      'Silbato de emergencia', 'Fotocopias de DNI', 'Barbijo FFP2 / FFP3 (humo y polvo)', 'Linterna frontal',
      'Gel para quemaduras', 'Apósitos para quemaduras', 'Matafuego ABC (mín. 1 kg, oblea vigente)',
    ],
  },
  {
    key: 'calor',
    label: '🌡️ Ola de calor',
    names: [
      'Agua embotellada', 'Sales de rehidratación oral', 'Protector solar', 'Sombrero o gorra para el sol', 'Powerbank',
      'Compresas frías instantáneas', 'Termómetro',
    ],
  },
  { key: 'auto', label: '🚗 Auto', names: [], category: 'Auto' },
];

export function itemsForSituation(items: GearItem[], key: SituationKey): GearItem[] {
  const s = SITUATIONS.find((x) => x.key === key);
  if (!s) return [];
  const names = new Set(s.names.map((n) => n.toLowerCase()));
  return items.filter((it) => names.has(it.name.toLowerCase()) || (s.category !== undefined && it.category === s.category));
}

/** One row per situation that has at least one saved item. */
export function bySituation(items: GearItem[]): ProgressRow[] {
  return SITUATIONS.map((s) => {
    const list = itemsForSituation(items, s.key);
    return { key: s.key, label: s.label, total: list.length, done: list.filter((it) => it.have).length };
  }).filter((row) => row.total > 0);
}
