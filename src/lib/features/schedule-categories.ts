import {
	Presentation,
	CircleAlert,
	Book,
	FlaskConical,
	Users,
	Wrench,
	Clock,
	Ellipsis,
	File,
	Plane
} from '@lucide/svelte';
import type { ScheduleCategory } from './schedule.svelte';

export interface CategoryDef {
	value: ScheduleCategory;
	label: string;
	icon: typeof Book;
}

export const CATEGORIES: CategoryDef[] = [
	{ value: 'exam', label: 'Examen', icon: Presentation },
	{ value: 'urgent', label: 'Urgente', icon: CircleAlert },
	{ value: 'book', label: 'Libro', icon: Book },
	{ value: 'lab', label: 'Lab', icon: FlaskConical },
	{ value: 'assist', label: 'Asistencia', icon: Users },
	{ value: 'taller', label: 'Taller', icon: Wrench },
	{ value: 'event', label: 'Evento', icon: Clock },
	{ value: 'entrega', label: 'Entrega', icon: File },
	{ value: 'viaje', label: 'Viaje', icon: Plane },
	{ value: 'other', label: 'Otro', icon: Ellipsis }
];

export const CATEGORY_ICONS: Record<string, typeof Book> = Object.fromEntries(
	CATEGORIES.map((c) => [c.value, c.icon])
);

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
	CATEGORIES.map((c) => [c.value, c.label])
);
