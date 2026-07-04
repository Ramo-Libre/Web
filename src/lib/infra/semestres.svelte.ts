import { browser } from '$app/environment';
import { PreferencesManager, type PreferencesSerial } from '$lib/features/preferences.svelte';
import { DEFAULT_RAMOS, RamosManager, type RamosSerial } from '$lib/features/ramos.svelte';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteMap } from 'svelte/reactivity';
import { local } from './persistence.svelte';
import { ScheduleManager, type ScheduleSerial } from '$lib/features/schedule.svelte';
import { EscenariosManager, type EscenariosSerial } from '$lib/features/notas.svelte';
import { changeBus, type FeatureId } from './changes.svelte';
import { syncRouter } from './sync-router.svelte';
import { KEYS } from './sync-policies';
import type { MockDataOutputV2 } from '$lib/dev-tools/types-v2';
import type { Serializable } from '$lib/types/state';

export interface SemestreData {
	name: string;
}

type SemestresSerial = [string, SemestreData][];

class SemestresManager {
	private _active = $state<string>('');
	private _semestres = $state<SvelteMap<string, SemestreData>>(new SvelteMap());

	private _preferences = new PreferencesManager();
	private _schedule = new ScheduleManager();
	private _escenarios = new EscenariosManager();
	private _ramos = new RamosManager((id) => {
		this._schedule.removeByRamo(id);
		this._escenarios.removeByRamo(id);
	});

	constructor() {
		if (browser) {
			changeBus.setSemesterIdProvider(() => this._active);
			syncRouter.init();
			this.load();
		}
	}

	private prefix(id_key: string) {
		return (this._active || '$DEFAULT$') + '_' + id_key;
	}

	private load() {
		this._active = local.get<string>(KEYS.active) || '';
		const raw = local.get<SemestresSerial>(KEYS.semesters);
		this._semestres = new SvelteMap(raw ?? []);

		const prefs = local.get<PreferencesSerial>(KEYS.preferences);
		if (prefs) this._preferences.fromSerial(prefs);

		this.loadCurrentSemester();
	}

	loadCurrentSemester() {
		const ramos = local.get<RamosSerial>(this.prefix(KEYS.ramos)) || DEFAULT_RAMOS;
		this._ramos.fromSerial(ramos);

		const schedule = local.get<ScheduleSerial>(this.prefix(KEYS.schedule)) || [];
		this._schedule.fromSerial(schedule);

		const escenarios = local.get<EscenariosSerial>(this.prefix(KEYS.escenarios)) || [];
		this._escenarios.fromSerial(escenarios);
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
		this._active = id;
		this.loadCurrentSemester();
		changeBus.emit('semesters', 'created', id);
		return id;
	}

	remove(id: string) {
		this._semestres.delete(id);
		if (this._active === id) {
			this._active = '';
			this.loadCurrentSemester();
		}
		changeBus.emit('semesters', 'deleted', id);
	}

	select(id: string) {
		if (!this._semestres.has(id)) return;
		this._active = id;
		this.loadCurrentSemester();
		changeBus.emit('semesters', 'updated', id);
	}

	rename(id: string, name: string) {
		const data = this._semestres.get(id);
		if (!data) return;
		this._semestres.set(id, { ...data, name });
		changeBus.emit('semesters', 'updated', id);
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

	get hasData() {
		return this._semestres.size > 0 || !this._ramos.empty() || !this._schedule.empty() || !this._escenarios.empty();
	}

	managerFor(feature: FeatureId): Serializable<unknown> {
		switch (feature) {
			case 'preferences': return this._preferences;
			case 'ramos': return this._ramos;
			case 'schedule': return this._schedule;
			case 'escenarios': return this._escenarios;
			case 'semesters': throw new Error('semesters has no manager');
		}
	}

	applySemestersSnapshot(payload: { semestres: [string, SemestreData][]; active: string }) {
		this._semestres = new SvelteMap(payload.semestres);
		this._active = payload.active;
		this.loadCurrentSemester();
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

		syncRouter.persistAll();
	}
}

export const semestre = new SemestresManager();
