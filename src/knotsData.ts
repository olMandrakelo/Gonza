export interface Knot {
  id: string;
  name: string;
  use: string;
  steps: string[];
  image: number;
}

/**
 * Static reference content for Material's "Guía de nudos" mode — not user data,
 * so it isn't stored via useStorageList like the rest of Material's entries.
 */
export const KNOTS: Knot[] = [
  {
    id: 'ocho',
    name: 'Nudo en ocho',
    use: 'Nudo de tope: evita que la cuerda se escape de una polea, un mosquetón o de la mano. Base de otros nudos más complejos.',
    steps: [
      'Hacé un seno (una curva) en la cuerda.',
      'Pasá el chicote por detrás del firme.',
      'Llevá el chicote a través del seno, formando el dibujo de un "8".',
      'Ajustá tirando parejo de ambos extremos.',
    ],
    image: require('./assets/knots/ocho.png'),
  },
  {
    id: 'nudo_llano',
    name: 'Nudo llano',
    use: 'Unir dos cuerdas del mismo grosor: vendajes, empaquetar, atar una lona. No usar para cargas ni rescate: se puede aflojar o zafar solo.',
    steps: [
      'Cruzá el chicote izquierdo sobre el derecho y pasalo por debajo.',
      'Con lo que quedó a la derecha, cruzalo sobre el otro y pasalo por debajo.',
      'Tirá parejo de los cuatro extremos para ajustar.',
    ],
    image: require('./assets/knots/nudo_llano.png'),
  },
  {
    id: 'as_de_guia',
    name: 'As de guía',
    use: 'Gaza (lazo) fija que no se ajusta ni afloja bajo carga: rescate, anclaje, izar algo. Uno de los nudos más útiles para emergencias.',
    steps: [
      'Hacé un ojal pequeño en la cuerda, cerca del extremo.',
      'El chicote sube por el ojal ("el conejo sale de la cueva").',
      'Rodea por detrás del firme ("da la vuelta al árbol").',
      'Vuelve a bajar por el mismo ojal ("y vuelve a la cueva").',
      'Ajustá tirando del firme y de la gaza, sosteniendo el chicote.',
    ],
    image: require('./assets/knots/as_de_guia.png'),
  },
  {
    id: 'ballestrinque',
    name: 'Ballestrinque',
    use: 'Amarre rápido de una cuerda a un poste o palo. Fácil de hacer y deshacer, pero no es confiable si la carga tira desde ángulos cambiantes.',
    steps: [
      'Pasá la cuerda por detrás del poste y cruzala sobre sí misma.',
      'Dale una segunda vuelta al poste, por arriba de la primera.',
      'Pasá el chicote por debajo de esa segunda vuelta.',
      'Ajustá tirando de ambos extremos.',
    ],
    image: require('./assets/knots/ballestrinque.png'),
  },
  {
    id: 'prusik',
    name: 'Nudo prusik',
    use: 'Nudo de fricción sobre una cuerda fija: se desliza a mano pero frena solo bajo carga. Sirve para ascender o como aseguro auxiliar.',
    steps: [
      'Formá un aro con un cordino más fino que la cuerda principal.',
      'Pasalo alrededor de la cuerda principal.',
      'Pasá el aro dentro de sí mismo, envolviendo la cuerda unas 3 veces.',
      'Acomodá las vueltas parejas y ajustá deslizando.',
    ],
    image: require('./assets/knots/prusik.png'),
  },
];
