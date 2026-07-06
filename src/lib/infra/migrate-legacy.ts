import { local } from './persistence.svelte';
import { KEYS } from './sync-policies';
import { generateUUID } from '$lib/utils/crypto';

// --- Legacy types (copied, not imported) ---

interface LegacySemestres {
	active: number | null;
	list: string[];
}

interface LegacyHorario {
	id: string;
	ramoId?: string;
	day: string;
	start: string;
	end: string;
	location?: string;
	type: string;
}

interface LegacyEvent {
	id: string;
	ramoId?: string;
	dueDate: string;
	location?: string;
	title: string;
	description?: string;
	priority: string;
	completed: boolean;
}

type LegacyRamoEntry = [string, { nombre: string; color: string }];

interface LegacyRamoNotas {
	evaluaciones?: unknown[];
	tags?: unknown[];
	restricciones?: unknown[];
}

interface LegacyRoot {
	ramos?: LegacyRamoEntry[];
	horarios?: [string, LegacyHorario][];
	events?: [string, LegacyEvent][];
	notas?: { ramos?: [string, LegacyRamoNotas][] };
}

const SEM_KEY = 'RAMOLIBRE_SEMESTER_V1';
const PREFS_KEY = 'RAMOLIBRE_PREFERENCES_V1';
const ROOT_PREFIX = 'RAMOLIBRE_ROOT_STORE_V1_';

const DAY_MAP: Record<string, number> = {
	L: 1,
	M: 2,
	X: 3,
	J: 4,
	V: 5,
	S: 6
};

export interface LegacyCounts {
	semesters: number;
	ramos: number;
	horarios: number;
	events: number;
	notasRamos: number;
}

export function detectLegacy(): LegacyCounts | null {
	const semRaw = localStorage.getItem(SEM_KEY);
	if (!semRaw) return null;

	let legacySem: LegacySemestres;
	try {
		legacySem = JSON.parse(semRaw);
	} catch {
		return null;
	}

	if (!legacySem.list || legacySem.list.length === 0) return null;

	let ramos = 0;
	let horarios = 0;
	let events = 0;
	let notasRamos = 0;

	for (const name of legacySem.list) {
		const rootRaw = localStorage.getItem(ROOT_PREFIX + name);
		if (!rootRaw) continue;
		try {
			const root: LegacyRoot = JSON.parse(rootRaw);
			if (root.ramos) ramos += root.ramos.length;
			if (root.horarios) horarios += root.horarios.length;
			if (root.events) events += root.events.length;
			if (root.notas?.ramos) notasRamos += root.notas.ramos.length;
		} catch {
			// skip corrupt data
		}
	}

	return { semesters: legacySem.list.length, ramos, horarios, events, notasRamos };
}

export function runMigration(): void {
	const semRaw = localStorage.getItem(SEM_KEY);
	if (!semRaw) return;

	const legacySem: LegacySemestres = JSON.parse(semRaw);
	const list = legacySem.list;
	if (list.length === 0) return;

	const activeIdx = legacySem.active;
	const activeName = activeIdx !== null && activeIdx < list.length ? list[activeIdx] : list[0];

	const nameToUuid = new Map<string, string>();
	for (const name of list) {
		nameToUuid.set(name, generateUUID());
	}
	const activeUuid = nameToUuid.get(activeName)!;

	// Semesters
	const semesters: [string, { name: string }][] = list.map((name) => [
		nameToUuid.get(name)!,
		{ name }
	]);
	local.save(KEYS.semesters, semesters);
	local.save(KEYS.active, activeUuid);

	// Preferences (theme only)
	const legacyPrefsRaw = localStorage.getItem(PREFS_KEY);
	let legacyTheme = 'dark';
	if (legacyPrefsRaw) {
		try {
			const p = JSON.parse(legacyPrefsRaw);
			if (p.general?.theme) legacyTheme = p.general.theme;
		} catch {
			// ignore
		}
	}
	local.save(KEYS.preferences, {
		theme: legacyTheme,
		schedule: { showCalendarEvents: false, orientation: 'normal' },
		calendar: { showHorarios: false },
		layout: { sidebarCollapsed: false }
	});

	// Per-semester data
	for (const [name, uuid] of nameToUuid.entries()) {
		const rootRaw = localStorage.getItem(ROOT_PREFIX + name);
		if (!rootRaw) continue;

		let root: LegacyRoot;
		try {
			root = JSON.parse(rootRaw);
		} catch {
			continue;
		}

		// Ramos (legacy `nombre` → new `name`)
		if (root.ramos && root.ramos.length > 0) {
			const mapped = root.ramos.map(
				([id, r]) =>
					[id, { name: r.nombre, color: r.color }] as [string, { name: string; color: string }]
			);
			local.save(uuid + '_' + KEYS.ramos, mapped);
		}

		// Horarios → Schedule
		const scheduleEntries: [string, unknown][] = [];
		if (root.horarios && root.horarios.length > 0) {
			for (const [hid, h] of root.horarios) {
				scheduleEntries.push([
					hid,
					{
						id: hid,
						ramoId: h.ramoId,
						category: h.type,
						title: h.type,
						startTime: h.start,
						endTime: h.end,
						daysOfWeek: [DAY_MAP[h.day] ?? 1],
						description: h.location ?? ''
					}
				]);
			}
		}

		// Events → Schedule (merge)
		if (root.events && root.events.length > 0) {
			for (const [eid, e] of root.events) {
				scheduleEntries.push([
					eid,
					{
						id: eid,
						ramoId: e.ramoId,
						title: e.title,
						category: 'event',
						date: e.dueDate,
						description: [e.location, e.description].filter(Boolean).join('\n')
					}
				]);
			}
		}

		if (scheduleEntries.length > 0) {
			local.save(uuid + '_' + KEYS.schedule, scheduleEntries);
		}
	}
}

export function cleanupLegacy(): void {
	const keysToRemove: string[] = [];
	for (const key of Object.keys(localStorage)) {
		if (key.startsWith('RAMOLIBRE_') && !key.startsWith('RAMOLIBRE_V2_')) {
			keysToRemove.push(key);
		}
	}
	for (const key of keysToRemove) {
		localStorage.removeItem(key);
	}
}
