import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './storage';
import { GearItem } from './types';

const SEEDED_FLAG = 'gonza:seeded-checklist-dia-cero';
const GEAR_KEY = 'gonza:gear';

/**
 * Starter checklist consolidated from the "Día Cero" 72h family bag guide (4 backpacks:
 * líder, apoyo logístico, and two kids). Items that repeat near-identically across bags are
 * merged into one entry with the per-bag breakdown in `quantity`, so the list stays a family
 * checklist rather than 60+ near-duplicate rows.
 */
export const SEED_ITEMS: Omit<GearItem, 'id' | 'have'>[] = [
  { name: 'Agua fraccionada', category: 'Agua', quantity: '8L total: 3L líder + 2L apoyo + 2L y 1L niños' },
  { name: 'Camelback 2L (vacío)', category: 'Agua', quantity: 'Mochila líder' },
  { name: 'Filtro portátil de agua', category: 'Agua' },
  { name: 'Pastillas potabilizadoras', category: 'Agua', quantity: 'Un blíster por mochila' },
  { name: 'Soft flasks 0,5L (vacías)', category: 'Agua', quantity: 'Mochila apoyo' },
  { name: 'Comida de alta densidad (72h)', category: 'Alimentos', quantity: 'Liofilizados, atún, barritas — mochilas adultos' },
  { name: 'Comida de confort para niños', category: 'Alimentos', quantity: 'Barritas, chocolate, galletas — mochilas niños' },
  { name: 'Kit de cocina', category: 'Alimentos', quantity: 'Cazo + cubiertos, uno por mochila' },
  { name: 'Mudas de ropa seca', category: 'Otros', quantity: 'Una por persona: calcetines, camiseta, campera, gorro, buff, guantes' },
  { name: 'Poncho impermeable', category: 'Otros', quantity: 'Mochilas adultos' },
  { name: 'Chubasquero infantil alta visibilidad', category: 'Otros', quantity: 'Mochilas niños' },
  { name: 'Saco de dormir / manta térmica', category: 'Otros', quantity: 'Uno por persona' },
  { name: 'Manta de emergencia infantil', category: 'Otros', quantity: 'Mochilas niños' },
  { name: 'Bolsas de basura (impermeabilizar)', category: 'Otros', quantity: 'Grandes en adultos, medianas en niños' },
  { name: 'Encendedor y ferrocerio', category: 'Herramientas', quantity: 'Mochila líder' },
  { name: 'Encendedor', category: 'Herramientas', quantity: 'Mochila apoyo' },
  { name: 'Walkie-talkie PMR446', category: 'Comunicación', quantity: '4 unidades — canal bloqueado en las de niños' },
  { name: 'Radio AM/FM', category: 'Comunicación', quantity: 'Mochilas adultos' },
  { name: 'Linterna frontal y de mano', category: 'Herramientas', quantity: 'Mochilas adultos' },
  { name: 'Iluminación autónoma infantil', category: 'Herramientas', quantity: 'Mochilas niños' },
  { name: 'Powerbank, cables y pilas', category: 'Energía', quantity: 'Mochilas adultos' },
  { name: 'Multiherramienta o navaja + cuerda y anclaje niños', category: 'Herramientas', quantity: 'Una por mochila adulto' },
  { name: 'Botiquín de primeros auxilios', category: 'Salud', quantity: 'Mochila líder' },
  { name: 'Kit de higiene crítica', category: 'Salud', quantity: 'Mochilas adultos' },
  { name: 'Higiene y protección infantil', category: 'Salud', quantity: 'Mochilas niños' },
  { name: 'Cortauñas, mascarillas y spray de seguridad', category: 'Salud', quantity: 'Mochilas adultos' },
  { name: 'Ficha identificativa de contingencia', category: 'Documentos', quantity: 'Una por mochila (x4) — cargala en la sección Familia' },
  { name: 'Pendrive cifrado + mapa en papel', category: 'Documentos', quantity: 'Original en líder, copia en apoyo' },
  { name: 'Efectivo fraccionado', category: 'Documentos', quantity: 'Mochila líder' },
  { name: 'Silbato de emergencia', category: 'Herramientas', quantity: 'Mochilas niños' },
  { name: 'Entretenimiento (libro, libreta, lápices, juguete)', category: 'Otros', quantity: 'Mochilas niños' },
];

/**
 * Seeds the gear checklist once, from the Día Cero 72h guide. Runs before the first screen
 * mounts (see App.tsx) so useStorageList never reads a stale empty list. Only writes if the
 * checklist is still empty — never overwrites items the user already added or edited.
 */
export async function seedGearIfNeeded(): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(SEEDED_FLAG);
    if (already) return;

    const existingRaw = await AsyncStorage.getItem(GEAR_KEY);
    const existing: GearItem[] = existingRaw ? JSON.parse(existingRaw) ?? [] : [];

    if (existing.length === 0) {
      const seeded: GearItem[] = SEED_ITEMS.map((item) => ({ ...item, id: generateId(), have: false }));
      await AsyncStorage.setItem(GEAR_KEY, JSON.stringify(seeded));
    }

    await AsyncStorage.setItem(SEEDED_FLAG, 'done');
  } catch (err) {
    // Never block app startup on a seeding failure — the "Cargar checklist sugerido" button
    // in the empty Equipo view is the fallback if this silently didn't run.
    console.error('seedGearIfNeeded failed', err);
  }
}
