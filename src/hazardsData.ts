export interface Hazard {
  id: string;
  icon: string;
  title: string;
  tag: string;
  antes: string[];
  durante: string[];
  despues: string[];
}

/**
 * Static reference content for Material's "Guías de riesgo" mode — not user data, so it isn't
 * stored via useStorageList like the rest of Material's entries. Transcribed from a family
 * emergency-plan reference the user shared, trimmed to the antes/durante/después guides
 * themselves (the live Paraná river-level gauge it also had needs a real data feed, which
 * doesn't fit this app's local-first, no-network-calls design).
 */
export const HAZARDS: Hazard[] = [
  {
    id: 'crecida',
    icon: '🌊',
    title: 'Crecida del Paraná',
    tag: 'Costa y bajos ribereños',
    antes: [
      'Sabé si tu casa está en zona de riesgo hídrico municipal.',
      'Ten armado el bolso de 72 horas (ver Equipo).',
      'Guardá documentos y objetos de valor en bolsas impermeables, en alto.',
      'Acordá con la familia un punto de encuentro fuera de la zona baja.',
    ],
    durante: [
      'Si Defensa Civil ordena evacuar, salí — no esperes a "ver cómo sigue".',
      'Cortá luz y gas antes de irte si el agua está por entrar.',
      'No cruces caminos ni arroyos con agua en movimiento, ni a pie ni en auto.',
      'Llevá el bolso de emergencia y los documentos.',
    ],
    despues: [
      'No vuelvas hasta que Defensa Civil confirme que es seguro.',
      'No tomes agua de la canilla hasta confirmación oficial.',
      'Fotografiá daños antes de limpiar, para el seguro si tenés.',
    ],
  },
  {
    id: 'tormenta',
    icon: '⛈️',
    title: 'Tormentas severas / viento',
    tag: 'Granizo, ráfagas, rayos',
    antes: [
      'Sacá o asegurá objetos sueltos de balcones y patios (macetas, sombrillas).',
      'Cargá el celular y ten linterna a mano.',
      'Revisá que canaletas y desagües no estén tapados.',
    ],
    durante: [
      'Quedate adentro, lejos de ventanas grandes.',
      'No uses el teléfono conectado al cargador durante tormenta eléctrica fuerte.',
      'Si estás manejando, parate en un lugar seguro, no bajo árboles ni carteles.',
    ],
    despues: [
      'No toques cables caídos, avisá a la empresa eléctrica.',
      'Revisá el techo y desagües antes de la próxima lluvia.',
    ],
  },
  {
    id: 'corte',
    icon: '💡',
    title: 'Corte de luz prolongado',
    tag: 'Más de unas horas',
    antes: [
      'Ten linterna, pilas y un power bank cargado.',
      'Guardá el número de emergencias de la distribuidora (EPE).',
      'Si alguien depende de electricidad para salud (oxígeno, heladera de medicamentos), tené un plan B.',
    ],
    durante: [
      'No abras la heladera/freezer más de lo necesario.',
      'Desenchufá equipos sensibles por si hay pico al volver la luz.',
      'Usá velas con cuidado, mejor linterna.',
    ],
    despues: ['Revisá que los alimentos perecederos sigan siendo seguros (más de 4 h sin frío: dudar).'],
  },
  {
    id: 'calor',
    icon: '🌡️',
    title: 'Ola de calor',
    tag: 'Golpe de calor, deshidratación',
    antes: [
      'Identificá quién en la familia es más vulnerable (bebés, mayores, quienes tengan alguna condición de salud).',
      'Ten a mano sales de rehidratación o agua en cantidad.',
    ],
    durante: [
      'Hidratate seguido, aunque no tengas sed.',
      'Evitá esfuerzo físico y sol directo entre 12 y 17 h.',
      'Buscá espacios con sombra o aire acondicionado para las horas pico.',
    ],
    despues: ['Ante mareos, piel caliente y seca, o confusión: eso es golpe de calor, es urgencia — llamá al 107.'],
  },
];
