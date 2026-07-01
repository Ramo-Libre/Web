import { browser } from '$app/environment';
import { PreferencesManager, type PreferencesSerial } from '$lib/features/preferences.svelte';
import { DEFAULT_RAMOS, RamosManager, type RamosSerial } from '$lib/features/ramos.svelte';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteMap } from 'svelte/reactivity';
import { local } from './persistence.svelte';
import { ScheduleManager, type ScheduleSerial } from '$lib/features/schedule.svelte';
import { EscenariosManager, type EscenariosSerial } from '$lib/features/notas.svelte';
import type { MockDataOutputV2 } from '$lib/dev-tools/types-v2';

export interface SemestreData {
	name: string;
}

const enum KEYS {
	ACTIVE_SEM = 'ACT',
	SEMESTRES = 'SEM',
	RAMOS = 'RMS',
	SCHEDULE = 'SCH',
	ESCENARIOS = 'ESC',
	PREFERENCES = 'PRE'
}

type SemestresSerial = [string, SemestreData][];

class SemestresManager {
	private _active = $state<string>('');
	private _semestres = $state<SvelteMap<string, SemestreData>>(new SvelteMap());

	private _preferences = new PreferencesManager();
	private _ramos = new RamosManager();
	private _schedule = new ScheduleManager();
	private _escenarios = new EscenariosManager();

	constructor() {
		if (browser) this.load();
		$effect.root(() => {
			$effect(() => {
				this.persist();
			});
		});
	}

	private prefix(id_key: string) {
		return (this._active || '$DEFAULT$') + '_' + id_key;
	}

	private load() {
		console.log('semestres:load');
		this._active = local.get<string>(KEYS.ACTIVE_SEM) || '';
		const raw = local.get<SemestresSerial>(KEYS.SEMESTRES);
		this._semestres = new SvelteMap(raw ?? []);

		this.loadCurrentSemester();
	}

	loadCurrentSemester() {
		console.log('semestres:loadCurrentSemester');

		const prefs = local.get<PreferencesSerial>(this.prefix(KEYS.PREFERENCES));
		if (prefs) this._preferences.fromSerial(prefs);

		const ramos = local.get<RamosSerial>(this.prefix(KEYS.RAMOS)) || DEFAULT_RAMOS;
		this._ramos.fromSerial(ramos);

		const schedule = local.get<ScheduleSerial>(this.prefix(KEYS.SCHEDULE)) || [];
		this._schedule.fromSerial(schedule);

		const escenarios = local.get<EscenariosSerial>(this.prefix(KEYS.ESCENARIOS)) || [];
		this._escenarios.fromSerial(escenarios);
	}

	private persist() {
		console.log('semestres:persist');
		local.save(KEYS.ACTIVE_SEM, this._active);
		local.save(KEYS.SEMESTRES, Array.from(this._semestres.entries()));

		const toSave = {
			[KEYS.RAMOS]: this._ramos.toSerial(),
			[KEYS.SCHEDULE]: this._schedule.toSerial(),
			[KEYS.ESCENARIOS]: this._escenarios.toSerial(),
			[KEYS.PREFERENCES]: this._preferences.toSerial()
		};

		for (const [id_key, val] of Object.entries(toSave)) {
			const key = this.prefix(id_key);
			local.save(key, val);
		}
	}

	get active() {
		return this._active ? (this._semestres.get(this._active)?.name ?? '') : '';
	}

	get activeId() {
		return this._active;
	}

	get semestres() {
		return this._semestres;
	}

	add(name: string): string {
		const id = generateUUID();
		this._semestres.set(id, { name });
		if (!this._active) this._active = id;
		return id;
	}

	remove(id: string) {
		this._semestres.delete(id);
		if (this._active === id) {
			this._active = '';
			this.loadCurrentSemester();
		}
	}

	select(id: string) {
		if (!this._semestres.has(id)) return;
		this._active = id;
		this.loadCurrentSemester();
	}

	rename(id: string, name: string) {
		const data = this._semestres.get(id);
		if (!data) return;
		this._semestres.set(id, { ...data, name });
	}

	get preferences() {
		return this._preferences;
	}

	get ramos() {
		return this._ramos;
	}

	get schedule() {
		return this._schedule;
	}

	get escenarios() {
		return this._escenarios;
	}

	applyMock(data: MockDataOutputV2) {
		this._semestres = new SvelteMap(data.semestres.map((s) => [s.id, { name: s.name }]));
		this._active = data.active;

		const entry = data.data[this._active];
		if (entry) {
			this._ramos.fromSerial(entry.ramos);
			this._schedule.fromSerial(entry.schedule);
			this._escenarios.fromSerial(entry.escenarios);
		}

		this.persist();
	}
}

export const semestre = new SemestresManager();
