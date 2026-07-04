import { browser } from '$app/environment';
import { changeBus, type ChangeEvent, type FeatureId } from './changes.svelte';
import { semestre } from './semestres.svelte';
import { local } from './persistence.svelte';
import { SYNC_POLICIES, KEYS } from './sync-policies';

class SyncRouter {
	private _init = false;

	init() {
		if (this._init || !browser) return;
		this._init = true;

		changeBus.subscribeAll((event) => {
			const policy = SYNC_POLICIES[event.feature];
			if (!policy?.persist) return;

			if (event.feature === 'semesters') {
				this._persistSemesters(event);
			} else {
				this._persistFeature(event.feature);
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
