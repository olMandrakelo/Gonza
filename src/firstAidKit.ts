import { CATALOG_ITEMS } from './catalog';
import { generateId } from './storage';
import { Bag, GearItem } from './types';

export const FIRST_AID_BAG: Omit<Bag, 'id'> = { name: 'Botiquín', emoji: '⛑️' };

/** Catalog names loaded by Equipo's "Cargar ítems de botiquín", following the American Red Cross family kit checklist. */
const FIRST_AID_NAMES = [
  'Apósitos compresivos (2)', 'Curitas surtidas (25)', 'Guantes sin látex (2 pares)', 'Gasas estériles 5x5 y 10x10 cm',
  'Torniquete (CAT)', 'Medicación personal (crónicos)',
  'Tela adhesiva (esparadrapo)', 'Pomada antibiótica (sobres)', 'Toallitas antisépticas', 'Aspirina 81 mg (sobres)',
  'Pomada de hidrocortisona (sobres)', 'Vendas de rollo 7,5 y 10 cm', 'Venda triangular', 'Compresas frías instantáneas',
  'Barbijo o barrera facial para RCP', 'Manta térmica (botiquín)', 'Termómetro oral', 'Pinza de depilar',
  'Tijeras de emergencia', 'Suero fisiológico', 'Alcohol en gel', 'Antihistamínico (sobres)',
  'Hoja con teléfonos de emergencia e instrucciones',
  'Kit de sutura de emergencia', 'Férula para dedos', 'Cabestrillo / inmovilizador de brazo',
];

/** The kit's items for `bagId`, skipping names already in that bag so tapping twice never duplicates. */
export function buildFirstAidKit(existing: GearItem[], bagId: string): GearItem[] {
  const have = new Set(existing.filter((it) => it.bagId === bagId).map((it) => it.name.toLowerCase()));
  return FIRST_AID_NAMES.flatMap((name) => {
    const c = CATALOG_ITEMS.find((it) => it.name === name);
    if (!c || have.has(name.toLowerCase())) return [];
    return [{ id: generateId(), name: c.name, category: c.category, priority: c.priority, quantity: c.quantity, have: false, bagId }];
  });
}

export function findFirstAidBag(bags: Bag[]): Bag | undefined {
  return bags.find((b) => b.name.toLowerCase().includes('botiqu'));
}
