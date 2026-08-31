import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './storage';
import { Bag, GearItem } from './types';

const SEEDED_FLAG = 'gonza:seeded-checklist-dia-cero';
const GEAR_KEY = 'gonza:gear';
const BAGS_KEY = 'gonza:bags';

type SeedGearItem = Omit<GearItem, 'id' | 'have' | 'bagId'>;

/** The 4 backpacks from the "Día Cero" 72h family bag guide, in the guide's own order. */
export const SEED_BAGS: Omit<Bag, 'id'>[] = [
  { name: 'Mochila líder', emoji: '🎒' },
  { name: 'Mochila apoyo', emoji: '🎒' },
  { name: 'Mochila niñ@ 1', emoji: '🧒' },
  { name: 'Mochila niñ@ 2', emoji: '🧒' },
];

/**
 * Items for each of SEED_BAGS, in the same order — one array per backpack, transcribed
 * straight from the Día Cero guide instead of consolidated into a single flat list, so the
 * suggested checklist actually loads split by mochila like the source guide.
 */
export const SEED_ITEMS_BY_BAG: SeedGearItem[][] = [
  // Mochila líder — adulto, carga operativa
  [
    { name: 'Agua fraccionada (3L)', category: 'Agua', quantity: 'En varias botellas' },
    { name: 'Camelback 2L (vacío)', category: 'Agua' },
    { name: 'Filtro portátil de agua', category: 'Agua' },
    { name: 'Pastillas potabilizadoras (blíster)', category: 'Agua' },
    { name: 'Alimentación de alta densidad (72h)', category: 'Alimentos', quantity: 'Liofilizados, atún, barritas, chocolate' },
    { name: 'Kit de cocina ligero', category: 'Alimentos', quantity: 'Cazo, cubiertos, hornillo casero' },
    { name: 'Mudas de ropa seca', category: 'Otros', quantity: 'Calcetines, camiseta, campera, gorro, buff, guantes' },
    { name: 'Poncho impermeable multi-uso', category: 'Otros' },
    { name: 'Saco de dormir de emergencia y manta térmica', category: 'Otros' },
    { name: '2 bolsas de basura industriales grandes', category: 'Otros' },
    { name: 'Encendedor, ferrocerio y material de ignición', category: 'Herramientas' },
    { name: 'Walkie-talkie PMR446', category: 'Comunicación' },
    { name: 'Linterna frontal y de mano', category: 'Herramientas' },
    { name: 'Powerbank, cables y pilas de repuesto', category: 'Energía' },
    { name: 'Multiherramienta robusta, cuerda y anclaje para niñ@s', category: 'Herramientas' },
    { name: 'Radio de transmisión AM/FM', category: 'Comunicación' },
    { name: 'Botiquín de primeros auxilios', category: 'Salud' },
    { name: 'Kit de higiene crítica', category: 'Salud' },
    { name: 'Cortauñas, mascarillas y seguridad', category: 'Salud' },
    { name: 'Ficha identificativa de contingencia', category: 'Documentos', quantity: 'Cargala en la sección Familia' },
    { name: 'Pendrive cifrado de documentación y mapa en papel', category: 'Documentos' },
    { name: 'Efectivo líquido fraccionado', category: 'Documentos' },
  ],
  // Mochila apoyo — adulto, apoyo logístico
  [
    { name: 'Agua fraccionada (2L)', category: 'Agua' },
    { name: 'Soft flasks 0,5L (vacías)', category: 'Agua' },
    { name: 'Pastillas potabilizadoras (blíster)', category: 'Agua' },
    { name: 'Alimentación de alta densidad (72h)', category: 'Alimentos', quantity: 'Liofilizados, atún, barritas, chocolate' },
    { name: 'Kit de cocina ligero', category: 'Alimentos', quantity: 'Cazo, cubiertos, sistema de calentamiento' },
    { name: 'Mudas de ropa seca', category: 'Otros', quantity: 'Calcetines, camiseta, campera, gorro, buff, guantes' },
    { name: 'Poncho impermeable multi-uso', category: 'Otros' },
    { name: 'Saco de dormir de emergencia y manta térmica', category: 'Otros' },
    { name: '2 bolsas de basura industriales grandes', category: 'Otros' },
    { name: 'Encendedor y material de ignición', category: 'Herramientas' },
    { name: 'Walkie-talkie PMR446', category: 'Comunicación' },
    { name: 'Linterna frontal y de mano', category: 'Herramientas' },
    { name: 'Powerbank, cables y pilas de repuesto', category: 'Energía' },
    { name: 'Navaja, cuerda y anclaje para niñ@s', category: 'Herramientas' },
    { name: 'Radio de transmisión AM/FM', category: 'Comunicación' },
    { name: 'Kit de higiene crítica', category: 'Salud' },
    { name: 'Cortauñas, mascarillas y seguridad', category: 'Salud' },
    { name: 'Ficha identificativa de contingencia', category: 'Documentos', quantity: 'Cargala en la sección Familia' },
    { name: 'Copia pendrive cifrado de documentación y mapa en papel', category: 'Documentos' },
  ],
  // Mochila niñ@ 1 — autonomía adaptada
  [
    { name: 'Agua fraccionada (2L)', category: 'Agua' },
    { name: 'Alimentación de confort emocional', category: 'Alimentos', quantity: 'Barritas, chocolate, galletas' },
    { name: 'Kit de cocina individual', category: 'Alimentos', quantity: 'Cazo y cubiertos livianos' },
    { name: 'Mudas de ropa seca', category: 'Otros', quantity: 'Calcetines, camiseta, campera, gorro, buff, guantes' },
    { name: 'Chubasquero infantil de alta visibilidad', category: 'Otros' },
    { name: 'Manta de emergencia', category: 'Otros' },
    { name: '2 bolsas de basura medianas', category: 'Otros' },
    { name: 'Walkie-talkie PMR446 (canal bloqueado)', category: 'Comunicación' },
    { name: 'Iluminación autónoma infantil', category: 'Herramientas' },
    { name: 'Higiene y protección adaptada', category: 'Salud', quantity: 'Cepillo, toallitas, papel higiénico, mascarilla infantil' },
    { name: 'Ficha identificativa de contingencia', category: 'Documentos', quantity: 'Cargala en la sección Familia' },
    { name: 'Entretenimiento y distracción', category: 'Otros', quantity: 'Libro, libreta, lápices, un juguete' },
    { name: 'Silbato de emergencia acústico', category: 'Herramientas' },
  ],
  // Mochila niñ@ 2 — autonomía adaptada
  [
    { name: 'Agua fraccionada (1L)', category: 'Agua' },
    { name: 'Alimentación de confort emocional', category: 'Alimentos', quantity: 'Barritas, chocolate, galletas' },
    { name: 'Kit de cocina individual', category: 'Alimentos', quantity: 'Cazo y cubiertos livianos' },
    { name: 'Mudas de ropa seca', category: 'Otros', quantity: 'Calcetines, camiseta, campera, gorro, buff, guantes' },
    { name: 'Chubasquero infantil de alta visibilidad', category: 'Otros' },
    { name: 'Manta de emergencia', category: 'Otros' },
    { name: '2 bolsas de basura medianas', category: 'Otros' },
    { name: 'Walkie-talkie PMR446 (canal bloqueado)', category: 'Comunicación' },
    { name: 'Iluminación autónoma infantil', category: 'Herramientas' },
    { name: 'Higiene y protección adaptada', category: 'Salud', quantity: 'Pasta dental, toallitas, higiene íntima' },
    { name: 'Ficha identificativa de contingencia', category: 'Documentos', quantity: 'Cargala en la sección Familia' },
    { name: 'Entretenimiento y distracción', category: 'Otros', quantity: 'Libro, libreta, lápices, un juguete' },
    { name: 'Silbato de emergencia acústico', category: 'Herramientas' },
  ],
];

/** Builds fresh, id-assigned bags + gear items from SEED_BAGS/SEED_ITEMS_BY_BAG, each item's
 * bagId pointing at the bag generated alongside it in this same call. */
export function buildSeed(): { bags: Bag[]; items: GearItem[] } {
  const bags: Bag[] = SEED_BAGS.map((b) => ({ ...b, id: generateId() }));
  const items: GearItem[] = bags.flatMap((bag, i) =>
    SEED_ITEMS_BY_BAG[i].map((item) => ({ ...item, id: generateId(), have: false, bagId: bag.id }))
  );
  return { bags, items };
}

/**
 * Seeds the gear checklist and its 4 starter mochilas once, from the Día Cero 72h guide. Runs
 * before the first screen mounts (see App.tsx) so useStorageList never reads a stale empty
 * list. Only writes if both lists are still empty — never overwrites bags or items the user
 * already added or edited. Writes directly rather than looping addItem/addBag, since looping
 * would race useStorageList's closured items state and silently drop all but the last write.
 */
export async function seedGearIfNeeded(): Promise<void> {
  try {
    const already = await AsyncStorage.getItem(SEEDED_FLAG);
    if (already) return;

    const [existingGearRaw, existingBagsRaw] = await Promise.all([
      AsyncStorage.getItem(GEAR_KEY),
      AsyncStorage.getItem(BAGS_KEY),
    ]);
    const existingGear: GearItem[] = existingGearRaw ? JSON.parse(existingGearRaw) ?? [] : [];
    const existingBags: Bag[] = existingBagsRaw ? JSON.parse(existingBagsRaw) ?? [] : [];

    if (existingGear.length === 0 && existingBags.length === 0) {
      const { bags, items } = buildSeed();
      await AsyncStorage.setItem(BAGS_KEY, JSON.stringify(bags));
      await AsyncStorage.setItem(GEAR_KEY, JSON.stringify(items));
    }

    await AsyncStorage.setItem(SEEDED_FLAG, 'done');
  } catch (err) {
    // Never block app startup on a seeding failure — the "Cargar checklist sugerido" button
    // in the empty Equipo view is the fallback if this silently didn't run.
    console.error('seedGearIfNeeded failed', err);
  }
}
