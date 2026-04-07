import { browser } from '$app/environment';
import { SemestresManager } from './semestres.svelte';
import { RamosManager } from './ramos.svelte';
import { NotasManager } from './notas.svelte';
import { EventsManager } from './events.svelte';
import { PreferencesManager } from './preferences.svelte';
import { EvaluacionEventsManager } from './evaluacion-events.svelte';

const STORAGE_KEY = (sem: string) => `RAMOLIBRE_ROOT_STORE_V1_${sem}`;
const SEMESTER_KEY = 'RAMOLIBRE_SEMESTER';
const PREFERENCES_KEY = 'RAMOLIBRE_PREFERENCES_V1';

class RootStore {
	private _semestres = new SemestresManager();
	private _ramos = new RamosManager();
	private _notas = new NotasManager();
	private _events = new EventsManager();
	private _preferences = new PreferencesManager();
	private _evaluacionEvents = new EvaluacionEventsManager();

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

	get preferences() {
		return this._preferences;
	}

	get evaluacionEvents() {
		return this._evaluacionEvents;
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
		this.evaluacionEvents.fromSerial(data.evaluacionEvents ?? []);
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
		this.evaluacionEvents.clear();
	}

	removeRamo(ramoId: string) {
		this._ramos.remove(ramoId);
		this._notas.clearRamo(ramoId);
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
			evaluacionEvents: this.evaluacionEvents.toSerial()
		};
		const semester = this.semestres.activeName ?? 'default';
		const semesters = this.semestres.toSerial();

		localStorage.setItem(STORAGE_KEY(semester), JSON.stringify(semesterSnapshot));
		localStorage.setItem(SEMESTER_KEY, JSON.stringify(semesters));
		localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences.toSerial()));
	}
}

export const db = new RootStore();
