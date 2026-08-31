export type GearCategory =
  | 'Agua'
  | 'Alimentos'
  | 'Salud'
  | 'Herramientas'
  | 'Comunicación'
  | 'Energía'
  | 'Documentos'
  | 'Otros';

export const GEAR_CATEGORIES: GearCategory[] = [
  'Agua',
  'Alimentos',
  'Salud',
  'Herramientas',
  'Comunicación',
  'Energía',
  'Documentos',
  'Otros',
];

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  have: boolean;
  quantity?: string;
  notes?: string;
  /** Which packed backpack this item belongs to, if any. A conceptually shared item (e.g.
   * "Agua" needed in two bags) is two separate GearItem rows, each with its own bagId and its
   * own have status — not one item referencing multiple bags — since each bag needs its own
   * physical unit anyway. */
  bagId?: string;
}

export interface Bag {
  id: string;
  name: string;
  emoji?: string;
}

export type CourseStatus = 'pendiente' | 'en_curso' | 'hecho';

export const COURSE_STATUSES: { value: CourseStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'hecho', label: 'Hecho' },
];

export interface Course {
  id: string;
  name: string;
  provider?: string;
  status: CourseStatus;
  notes?: string;
  link?: string;
}

export interface Material {
  id: string;
  title: string;
  content: string;
  courseId?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  courseId?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone1?: string;
  phone2?: string;
  birthDate?: string;
  bloodType?: string;
  allergies?: string;
  notes?: string;
}

export const ROUTE_LABELS = ['A', 'B', 'C', 'D'] as const;
export type RouteLabel = (typeof ROUTE_LABELS)[number];

export interface EvacuationRoute {
  label: RouteLabel;
  meetingPoint: string;
  plan: string;
}

export interface FamilyPlan {
  address: string;
  routes: EvacuationRoute[];
}

export function emptyFamilyPlan(): FamilyPlan {
  return {
    address: '',
    routes: ROUTE_LABELS.map((label) => ({ label, meetingPoint: '', plan: '' })),
  };
}
