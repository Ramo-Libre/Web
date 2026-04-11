import { browser } from '$app/environment';
import { SemestresManager } from './semestres.svelte';
import { RamosManager } from './ramos.svelte';
import { NotasManager } from './notas.svelte';
import { EventsManager } from './events.svelte';
import { PreferencesManager } from './preferences.svelte';
import { EvaluacionEventsManager } from './evaluacion-events.svelte';
import { HorariosManager } from './horarios.svelte';
import { DevManager } from './dev.svelte';
import { PUBLIC_SHOW_DEV_TOOLS } from '$env/static/public';
import type { MockDataOutput } from '$lib/dev-tools/gen';
import { AuthManager } from './auth.svelte';

export const RAMOLIBE_KEY_PREFIX = 'RAMOLIBRE_';
const STORAGE_KEY = (sem: string) => `${RAMOLIBE_KEY_PREFIX}ROOT_STORE_V1_${sem}`;
const SEMESTER_KEY = `${RAMOLIBE_KEY_PREFIX}SEMESTER`;
const PREFERENCES_KEY = `${RAMOLIBE_KEY_PREFIX}PREFERENCES_V1`;
const DEV_KEY = `${RAMOLIBE_KEY_PREFIX}DEV_V1`;

class RootStore {
	private _semestres = new SemestresManager();
	private _ramos = new RamosManager();
	private _notas = new NotasManager();
	private _events = new EventsManager();
	private _horarios = new HorariosManager();
	private _preferences = new PreferencesManager();
	private _evaluacionEvents = new EvaluacionEventsManager();

	private _dev: null | DevManager = null;
	private _auth = new AuthManager();

	get semestres() {
		return this._semestres;
	}

	get ramos() {
		return this._ramos;
	}

	get notas() {
		return this._notas;
	}

	get events() {
		return this._events;
	}

	get horarios() {
		return this._horarios;
	}

	get preferences() {
		return this._preferences;
	}

	get evaluacionEvents() {
		return this._evaluacionEvents;
	}

	get dev() {
		return this._dev;
	}

	get auth() {
		return this._auth;
	}

	get empty(): boolean {
		return this._semestres.empty() && this._ramos.empty();
	}

	constructor() {
		if (browser) this.load();
		$effect.root(() => {
			$effect(() => {
				db.save();
			});
		});

		$effect.root(() => {
			$effect(() => {
				const activeSemester = this.semestres.activeName;
				if (browser && activeSemester !== undefined) {
					this.loadCurrentSemesterRamos();
				}
			});
		});
	}

	private load() {
		// Load semester data first
		const semesterData = JSON.parse(localStorage.getItem(SEMESTER_KEY) || '{}');
		if (semesterData) this.semestres.fromSerial(semesterData);

		const preferencesData = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
		if (preferencesData) this.preferences.fromSerial(preferencesData);

		const isDevDataEnabled = PUBLIC_SHOW_DEV_TOOLS === 'true';
		if (isDevDataEnabled) {
			const devData = JSON.parse(localStorage.getItem(DEV_KEY) || '{}');
			if (devData && this._dev) this._dev.fromSerial(devData);
		}

		// Load current semester's ramo data
		this.loadCurrentSemesterRamos();
	}

	private loadCurrentSemesterRamos() {
		console.log('Loading ramos for current semester');
		const semester = this.semestres.activeName ?? 'default';
		const data = JSON.parse(localStorage.getItem(STORAGE_KEY(semester)) || '{}');
		// Cargar datos
		this.ramos.fromSerial(data.ramos ?? []);
		this.notas.fromSerial(data.notas ?? { ramos: [] });
		this.events.fromSerial(data.events ?? []);
		this.horarios.fromSerial(data.horarios ?? []);
		this.evaluacionEvents.fromSerial(data.evaluacionEvents ?? []);
		if (PUBLIC_SHOW_DEV_TOOLS === 'true') {
			this._dev = new DevManager();
			this._dev.fromSerial(JSON.parse(localStorage.getItem(DEV_KEY) || '{}'));
		}
	}
	fromMock(data: MockDataOutput) {
		if (!browser) return;
		console.log('Iniciando inyección masiva de Mock Data...');

		// 1. Limpieza (Igual que antes)
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith('RAMOLIBRE_') && key !== PREFERENCES_KEY && key !== DEV_KEY) {
				localStorage.removeItem(key);
			}
		});

		// 2. Persistencia (Cambio de forEach de Map a Object.entries)
		Object.entries(data.semestres_data).forEach(([semesterName, content]) => {
			const snapshot = {
				ramos: content.ramos,
				notas: content.notas,
				events: content.eventos,
				horarios: content.horarios,
				evaluacionEvents: []
			};
			localStorage.setItem(STORAGE_KEY(semesterName), JSON.stringify(snapshot));
		});

		// 3. Managers (Igual que antes)
		this.semestres.fromSerial(data.semestres);
		this.loadCurrentSemesterRamos();

		console.log('Inyección masiva completada.');
	}

	deleteSemesterData(semesterName: string) {
		if (!browser) return;

		const storageKey = STORAGE_KEY(semesterName);
		localStorage.removeItem(storageKey);

		// Find and remove the semester from the list
		const semesterIndex = this.semestres.list.findIndex((name) => name === semesterName);
		if (semesterIndex !== -1) {
			this.clear(semesterIndex);
		}
	}

	private clear(semester?: number) {
		if (semester !== undefined) {
			this.semestres.remove(semester);
		} else {
			this.semestres.clear();
		}
		this.ramos.clear();
		this.notas.clear();
		this.events.clear();
		this.horarios.clear();
		this.evaluacionEvents.clear();
		if (PUBLIC_SHOW_DEV_TOOLS === 'true' && this._dev) {
			this._dev.clear();
		}
	}

	removeRamo(ramoId: string) {
		this._ramos.remove(ramoId);
		this._notas.clearRamo(ramoId);
		this._horarios.removeByRamo(ramoId);
		this._evaluacionEvents.removeByRamo(ramoId);
	}

	removeEvent(eventId: string) {
		this._events.remove(eventId);
		this._evaluacionEvents.removeByEventId(eventId);
	}

	removeEvaluacion(ramoId: string, evaluacionId: string) {
		this._notas.getEvaluaciones(ramoId).remove(evaluacionId);
		this._evaluacionEvents.removeByEvaluacion(ramoId, evaluacionId);
	}

	private save() {
		console.log('RootStore save triggered');
		if (!browser) return;
		// Recolectar los datos de cada manager
		const semesterSnapshot = {
			ramos: this.ramos.toSerial(),
			notas: this.notas.toSerial(),
			events: this.events.toSerial(),
			horarios: this.horarios.toSerial(),
			evaluacionEvents: this.evaluacionEvents.toSerial()
		};
		const semester = this.semestres.activeName ?? 'default';
		const semesters = this.semestres.toSerial();

		localStorage.setItem(STORAGE_KEY(semester), JSON.stringify(semesterSnapshot));
		localStorage.setItem(SEMESTER_KEY, JSON.stringify(semesters));
		localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences.toSerial()));

		if (PUBLIC_SHOW_DEV_TOOLS === 'true' && this._dev) {
			localStorage.setItem(DEV_KEY, JSON.stringify(this._dev.toSerial()));
		}
	}
}

export const db = new RootStore();
