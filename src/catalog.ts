import { GearCategory } from './types';

export interface CatalogItem {
  name: string;
  category: GearCategory;
}

/**
 * Common gear items offered in the "+ Ítem" picker so most entries can be tapped instead of
 * typed. Independent from seedData.ts's Día Cero starter checklist — this is a general
 * catalog of names/categories only (no quantities), meant to speed up adding items the
 * starter checklist didn't already cover.
 */
export const CATALOG_ITEMS: CatalogItem[] = [
  // Agua
  { name: 'Agua embotellada', category: 'Agua' },
  { name: 'Bidón plegable', category: 'Agua' },
  { name: 'Filtro de agua portátil', category: 'Agua' },
  { name: 'Pastillas potabilizadoras', category: 'Agua' },
  { name: 'Cantimplora', category: 'Agua' },
  { name: 'Mochila de hidratación (camelback)', category: 'Agua' },
  { name: 'Purificador UV', category: 'Agua' },
  { name: 'Sales de rehidratación oral', category: 'Agua' },
  { name: 'Embudo', category: 'Agua' },
  { name: 'Lona para recolectar agua de lluvia', category: 'Agua' },

  // Alimentos
  { name: 'Comida liofilizada', category: 'Alimentos' },
  { name: 'Latas de conserva', category: 'Alimentos' },
  { name: 'Barritas energéticas', category: 'Alimentos' },
  { name: 'Frutos secos', category: 'Alimentos' },
  { name: 'Chocolate', category: 'Alimentos' },
  { name: 'Sobres de sopa deshidratada', category: 'Alimentos' },
  { name: 'Leche en polvo', category: 'Alimentos' },
  { name: 'Café o té instantáneo', category: 'Alimentos' },
  { name: 'Sal', category: 'Alimentos' },
  { name: 'Cocina de camping', category: 'Alimentos' },
  { name: 'Hornillo de gas', category: 'Alimentos' },
  { name: 'Cartuchos de gas', category: 'Alimentos' },
  { name: 'Cubiertos plegables', category: 'Alimentos' },
  { name: 'Abrelatas manual', category: 'Alimentos' },
  { name: 'Termo', category: 'Alimentos' },

  // Salud
  { name: 'Botiquín de primeros auxilios', category: 'Salud' },
  { name: 'Analgésicos', category: 'Salud' },
  { name: 'Antidiarreicos', category: 'Salud' },
  { name: 'Antihistamínicos', category: 'Salud' },
  { name: 'Suero fisiológico', category: 'Salud' },
  { name: 'Gasas estériles', category: 'Salud' },
  { name: 'Vendas elásticas', category: 'Salud' },
  { name: 'Cinta adhesiva médica', category: 'Salud' },
  { name: 'Alcohol en gel', category: 'Salud' },
  { name: 'Guantes de nitrilo', category: 'Salud' },
  { name: 'Mascarillas', category: 'Salud' },
  { name: 'Termómetro', category: 'Salud' },
  { name: 'Medicación personal (crónicos)', category: 'Salud' },
  { name: 'Repelente de insectos', category: 'Salud' },
  { name: 'Protector solar', category: 'Salud' },
  { name: 'Tijeras de emergencia', category: 'Salud' },
  { name: 'Apósitos adhesivos (curitas)', category: 'Salud' },
  { name: 'Apósitos grandes', category: 'Salud' },
  { name: 'Rollo de venda de gasa', category: 'Salud' },
  { name: 'Venda triangular', category: 'Salud' },
  { name: 'Cinta hipoalergénica', category: 'Salud' },
  { name: 'Tela adhesiva (esparadrapo)', category: 'Salud' },
  { name: 'Algodón e hisopos', category: 'Salud' },
  { name: 'Antiséptico (clorhexidina)', category: 'Salud' },
  { name: 'Toallitas antisépticas', category: 'Salud' },
  { name: 'Jabón neutro', category: 'Salud' },
  { name: 'Pinza de depilar', category: 'Salud' },
  { name: 'Jeringas sin aguja', category: 'Salud' },
  { name: 'Imperdibles', category: 'Salud' },
  { name: 'Bolsitas para residuos', category: 'Salud' },
  { name: 'Barbijo o barrera facial para RCP', category: 'Salud' },
  { name: 'Gasas no adherentes (quemaduras)', category: 'Salud' },
  { name: 'Apósitos para quemaduras', category: 'Salud' },
  { name: 'Gel para quemaduras', category: 'Salud' },
  { name: 'Compresas frías instantáneas', category: 'Salud' },
  { name: 'Férula para dedos', category: 'Salud' },
  { name: 'Paracetamol', category: 'Salud' },
  { name: 'Ibuprofeno', category: 'Salud' },
  { name: 'Antiácido', category: 'Salud' },
  { name: 'Crema para picaduras', category: 'Salud' },

  // Herramientas
  { name: 'Navaja multiusos', category: 'Herramientas' },
  { name: 'Cuerda o cordino', category: 'Herramientas' },
  { name: 'Cinta americana (duct tape)', category: 'Herramientas' },
  { name: 'Encendedor', category: 'Herramientas' },
  { name: 'Fósforos impermeables', category: 'Herramientas' },
  { name: 'Ferrocerio', category: 'Herramientas' },
  { name: 'Linterna de mano', category: 'Herramientas' },
  { name: 'Linterna frontal', category: 'Herramientas' },
  { name: 'Silbato de emergencia', category: 'Herramientas' },
  { name: 'Sierra plegable', category: 'Herramientas' },
  { name: 'Pala plegable', category: 'Herramientas' },
  { name: 'Martillo pequeño', category: 'Herramientas' },
  { name: 'Guantes de trabajo', category: 'Herramientas' },
  { name: 'Brújula', category: 'Herramientas' },
  { name: 'Espejo de señales', category: 'Herramientas' },
  { name: 'Candado', category: 'Herramientas' },

  // Comunicación
  { name: 'Walkie-talkie', category: 'Comunicación' },
  { name: 'Radio AM/FM a pilas', category: 'Comunicación' },
  { name: 'Radio de manivela', category: 'Comunicación' },
  { name: 'Bengalas o señales luminosas', category: 'Comunicación' },
  { name: 'Silbato', category: 'Comunicación' },
  { name: 'Pito de niebla', category: 'Comunicación' },

  // Energía
  { name: 'Powerbank', category: 'Energía' },
  { name: 'Pilas AA/AAA de repuesto', category: 'Energía' },
  { name: 'Panel solar portátil', category: 'Energía' },
  { name: 'Cargador de manivela', category: 'Energía' },
  { name: 'Velas', category: 'Energía' },
  { name: 'Encendedor recargable', category: 'Energía' },
  { name: 'Generador portátil', category: 'Energía' },
  { name: 'Cable de carga', category: 'Energía' },

  // Documentos
  { name: 'Fotocopias de DNI', category: 'Documentos' },
  { name: 'Libreta de vacunación', category: 'Documentos' },
  { name: 'Efectivo en billetes chicos', category: 'Documentos' },
  { name: 'Pendrive con documentación', category: 'Documentos' },
  { name: 'Mapa físico de la zona', category: 'Documentos' },
  { name: 'Ficha de contactos de emergencia', category: 'Documentos' },
  { name: 'Copia del seguro médico', category: 'Documentos' },
  { name: 'Escrituras o documentación de propiedad', category: 'Documentos' },

  // Otros
  { name: 'Manta térmica', category: 'Otros' },
  { name: 'Bolsa de dormir', category: 'Otros' },
  { name: 'Poncho impermeable', category: 'Otros' },
  { name: 'Ropa de abrigo', category: 'Otros' },
  { name: 'Calzado de repuesto', category: 'Otros' },
  { name: 'Bolsas de basura resistentes', category: 'Otros' },
  { name: 'Guantes térmicos', category: 'Otros' },
  { name: 'Gorro o buff', category: 'Otros' },
  { name: 'Cuerda para tender ropa', category: 'Otros' },
  { name: 'Juego de cartas', category: 'Otros' },
  { name: 'Libreta y lápiz', category: 'Otros' },
  { name: 'Correa de anclaje para niños', category: 'Otros' },
];
