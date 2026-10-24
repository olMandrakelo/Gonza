/**
 * "Qué mirar antes de comprar" for the items where people most often pick wrong. Looked up by an
 * item's exact catalog name at render time (like situations.ts), so it needs no stored field or
 * migration. Sources: Instinto Imparable's buying guides, the Red Cross kit checklist and the
 * Ley de Tránsito for the car items.
 */
const TIPS: Record<string, string> = {
  // Agua
  'Filtro de agua portátil': 'Litros que filtra de verdad, que retenga bacterias y protozoos, peso plegado.',
  'Pastillas potabilizadoras': 'Litros por pastilla, fecha de vencimiento y tiempo de acción.',
  'Agua embotellada': 'Ocupa y vence, y no sirve si tenés que salir caminando: complementala con filtro o pastillas.',
  // Alimentos
  'Barritas energéticas': 'Calorías por paquete, años de vencimiento, que no necesiten agua.',
  'Ración de emergencia (tipo 3600 kcal)': 'Vencimiento real (no el del envase), calorías del menú completo.',
  // Fuego
  'Ferrocerio': 'Ferrocerio, no piedra: funciona mojado y con viento. Mirá el grosor de la barra y que traiga rascador de acero.',
  'Encendedor': 'Se moja, se gasta y se pierde: llevá un ferrocerio de respaldo.',
  // Salud
  'Torniquete (CAT)': 'Que sea torniquete de verdad. Practicá con él antes de necesitarlo.',
  'Barbijo FFP2 / FFP3 (humo y polvo)': 'Filtración FFP2 o FFP3, que selle bien en la cara, vencimiento. Un trapo no filtra nada.',
  'Mascarillas': 'Para humo y polvo en suspensión hace falta FFP2/FFP3, no una común.',
  'Medicación personal (crónicos)': 'Revisá los vencimientos cada 6 meses y reponé lo vencido.',
  'Aspirina 81 mg (sobres)': 'La lista de la Cruz Roja Americana usa 81 mg: consultá la dosis con tu médico.',
  'Termómetro oral': 'Está en la lista de la Cruz Roja para el botiquín familiar.',
  // Herramientas
  'Multiherramienta (alicate)': 'Que los alicates sean sólidos, acero inoxidable, bloqueo de hoja. No la compres barata.',
  'Linterna frontal': 'Recargable por USB-C, autonomía en modo bajo, cinta que no resbale.',
  'Paracord (20 m)': 'Paracord 550 auténtico (7 hilos internos), metros reales, núcleo trenzado.',
  'Cuerda o cordino': 'Mirá la carga de rotura y los metros reales.',
  // Refugio
  'Manta térmica': 'Que sea gruesa (las finas se rompen), tamaño desplegada. Llevá dos, no una.',
  'Bolsa de dormir': 'Temperatura de confort real, no la extrema; peso, tamaño plegado y si es impermeable por fuera.',
  // Navegación y señales
  'Brújula': 'Limbo giratorio, líquido sin burbujas, legible de noche.',
  'Silbato de emergencia': 'Que suene fuerte sin soplar mucho, con cordón y sin bolita interior.',
  // Comunicación
  'Radio de manivela': 'Bandas AM/FM, manivela y solar, y si además carga el celular.',
  'Radio AM/FM a pilas': 'Cuando se satura la red móvil, la radio sigue emitiendo avisos oficiales.',
  'Walkie-talkie': 'Alcance real (no el del anuncio), que use pilas comunes y sea PMR446 legal.',
  // Energía
  'Powerbank': 'Capacidad real en mAh, cantidad de salidas, carga rápida.',
  'Panel solar portátil': 'Mirá los vatios reales y que sea compatible con tu powerbank.',
  // Documentos
  'Fotocopias de DNI': 'Copia en papel y en el celular. Sin documentos todo se complica después.',
  // Auto
  'Matafuego ABC (mín. 1 kg, oblea vigente)': 'Polvo ABC, 1 kg mínimo, indicador de carga, oblea vigente y al alcance del conductor (no en el baúl).',
  'Balizas triangulares (2)': 'Dos triángulos reflectivos: uno adelante y otro atrás, a 75 m en ruta y 150 m en autopista.',
  'Chaleco reflectivo': 'No es obligatorio a nivel nacional, pero si te bajás a la banquina sin él podés ser sancionado.',
  'Botiquín de auto': 'Obligatorio en algunas provincias (como Mendoza). Revisá qué provincias vas a cruzar.',
  'Martillo rompe-vidrios y corta-cinturón': 'Que corte cinturón además de romper el vidrio, punta de acero templado y soporte fijo al alcance del conductor.',
  'Cables de arranque (pinza)': 'Pinzas decentes y buen calibre. Un cable fino no arranca nada.',
  'Compresor de aire 12V': 'Que llegue a la presión de tu rueda y tenga cable largo.',
  'Rueda de auxilio en buen estado': 'Revisá la presión cada tanto y que el gato y la llave de cruz entren en el baúl.',
  'Arrancador portátil (jump starter)': 'Capacidad acorde a tu motor (nafta o diésel) y mantené la batería cargada.',
};

export function tipFor(name: string): string | undefined {
  return TIPS[name];
}
