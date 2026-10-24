import { CATALOG_ITEMS } from './catalog';
import { generateId } from './storage';
import { Bag, GearItem } from './types';

export const CAR_BAG: Omit<Bag, 'id'> = { name: 'Mochila de auto', emoji: '🚗' };

/** Catalog names loaded by Equipo's "Cargar checklist de auto" — what to carry in the car, essentials first. */
const CAR_KIT_NAMES = [
  'Matafuego ABC (mín. 1 kg, oblea vigente)', 'Balizas triangulares (2)', 'Martillo rompe-vidrios y corta-cinturón',
  'Cables de arranque (pinza)', 'Rueda de auxilio en buen estado', 'Gato y llave de cruz',
  'Cédula verde y azul del auto', 'Licencia de conducir', 'Póliza de seguro del auto',
  'Agua embotellada', 'Linterna frontal', 'Powerbank', 'Manta térmica',
  'Chaleco reflectivo', 'Botiquín de auto', 'Compresor de aire 12V', 'Kit de reparación de pinchaduras',
  'Cable o eslinga de remolque', 'Linterna con imán', 'Llave de tuercas de seguridad (antirrobo)',
  'Guantes de mecánico', 'Fusibles de repuesto', 'Cargador de auto para celular', 'Líquido refrigerante de repuesto',
  'Cinta aisladora', 'Barritas energéticas',
  'Arrancador portátil (jump starter)', 'Pala plegable para barro o nieve', 'Tablas o alfombras de tracción (barro/arena)',
  'Cadenas para nieve (zonas frías)', 'Rascador de hielo (zonas frías)',
];

/** The car kit's items for `bagId`, skipping any name already in that bag so tapping the button twice never duplicates. */
export function buildCarKit(existing: GearItem[], bagId: string): GearItem[] {
  const have = new Set(existing.filter((it) => it.bagId === bagId).map((it) => it.name.toLowerCase()));
  return CAR_KIT_NAMES.flatMap((name) => {
    const c = CATALOG_ITEMS.find((it) => it.name === name);
    if (!c || have.has(name.toLowerCase())) return [];
    return [{ id: generateId(), name: c.name, category: c.category, priority: c.priority, quantity: c.quantity, have: false, bagId }];
  });
}
