import { browser } from '$app/environment';
import { changeBus, type FeatureId } from './changes.svelte';
import type { ChangeEvent } from './changes.svelte';
import type { SyncAdapter } from './sync-adapter';
import { noopAdapter } from './sync-noop.svelte';
import { semestre } from './semestres.svelte';
import { local } from './persistence.svelte';
import { SYNC_POLICIES, KEYS } from './sync-policies';

class SyncRouter {
	private _init = false;
	private _adapter: SyncAdapter = noopAdapter;

	get adapter() {
		return this._adapter;
	}

	setAdapter(adapter: SyncAdapter) {
		if (this._adapter.id !== 'noop') {
			this._adapter.disconnect();
		}
		this._adapter = adapter;
	}

	init() {
		if (this._init || !browser) return;
		this._init = true;

		this._adapter.connect();
		this._adapter.onRemoteChanges((events) => this._handleRemoteEvents(events));

		changeBus.subscribeAll((event) => {
			const policy = SYNC_POLICIES[event.feature];
			if (!policy?.persist) return;

			if (event.feature === 'semesters') {
				this._persistSemesters(event);
			} else {
				this._persistFeature(event.feature);
			}

			if (policy?.sync) {
				this._adapter.push([event]);
			}
		});
	}

	persistAll() {
		if (!browser) return;
		const features: FeatureId[] = ['preferences', 'ramos', 'schedule', 'escenarios'];
		for (const f of features) {
			this._persistFeature(f);
		}
		this._persistActiveSem();
		this._persistSemesterList();
	}

	private _handleRemoteEvents(events: ChangeEvent[]) {
		for (const event of events) {
			if (event.origin !== 'remote' || event.payload === undefined) continue;

			if (event.feature === 'semesters') {
				semestre.applySemestersSnapshot(event.payload as { semestres: [string, { name: string }][]; active: string });
				this._persistActiveSem();
				this._persistSemesterList();
			} else {
				const manager = semestre.managerFor(event.feature);
				manager.fromSerial(event.payload);
				this._persistFeature(event.feature);
			}
		}
	}

	private _persistFeature(feature: FeatureId) {
		if (feature === 'preferences') {
			local.save(KEYS.preferences, semestre.managerFor('preferences').toSerial());
		} else {
			const semId = semestre.activeId || '$DEFAULT$';
			local.save(semId + '_' + KEYS[feature], semestre.managerFor(feature).toSerial());
		}
	}

	private _persistSemesters(event: ChangeEvent) {
		this._persistActiveSem();
		this._persistSemesterList();

		if (event.action === 'deleted' && event.entityId) {
			for (const key of ['RMS', 'SCH', 'ESC']) {
				local.remove(event.entityId + '_' + key);
			}
		}
	}

	private _persistActiveSem() {
		local.save(KEYS.active, semestre.activeId);
	}

	private _persistSemesterList() {
		local.save(KEYS.semesters, Array.from(semestre.semestres.entries()));
	}
}

export const syncRouter = new SyncRouter();
