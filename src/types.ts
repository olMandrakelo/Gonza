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
