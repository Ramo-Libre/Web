import { browser } from '$app/environment';
import { changeBus, type FeatureId, type EntityChange } from './changes.svelte';
import type { SyncAdapter, ConflictEvent } from './sync-adapter';
import { noopAdapter } from './sync-noop.svelte';
import { semestre } from './semestres.svelte';
import type { Serializable } from '$lib/types/state';
import { local } from './persistence.svelte';
import { SYNC_POLICIES, KEYS } from './sync-policies';

interface EntityManager extends Serializable<unknown> {
	toOne(id: string): unknown | null;
	fromOne(id: string, data: unknown): void;
	removeSilent(id: string): void;
}

const CONFLICT_QUEUE_KEY = 'RAMOLIBRE_V2_UNRESOLVED_CONFLICTS';

class SyncRouter {
	private _init = false;
	private _adapter: SyncAdapter = noopAdapter;
	private _unsubscribeRemote: (() => void) | null = null;
	private _pushedSemesters = new Set<string>();

	get adapter() {
		return this._adapter;
	}

	async setAdapter(adapter: SyncAdapter) {
		if (this._adapter.id === adapter.id) return;

		if (this._adapter.id !== 'noop') {
			this._adapter.disconnect();
		}
		if (this._unsubscribeRemote) {
			this._unsubscribeRemote();
			this._unsubscribeRemote = null;
		}

		this._adapter = adapter;

		if (this._init) {
			await this._adapter.connect();
			this._unsubscribeRemote = this._adapter.onRemoteChanges(
				(events) => this._handleRemoteEvents(events)
			);
		}
	}

	init() {
		if (this._init || !browser) return;
		this._init = true;
		this._loadPushedSemesters();

		this._adapter.connect();
		this._unsubscribeRemote = this._adapter.onRemoteChanges(
			(events) => this._handleRemoteEvents(events)
		);

		changeBus.subscribeAll(async (event) => {
			const policy = SYNC_POLICIES[event.feature];
			if (!policy?.persist) return;

			if (event.feature === 'semesters') {
				this._persistSemesters(event);
			} else {
				this._persistFeature(event.feature);
			}

			if (!policy?.sync) return;

			// Skip push for auto-created semesters with no content
			if (event.feature === 'semesters' && event.action === 'created' &&
				semestre.ramos.empty() && semestre.schedule.empty() && semestre.escenarios.empty()) {
				return;
			}

			// For 'semesters' events: push server → mark pushed
			if (event.feature === 'semesters') {
				if (event.action === 'deleted' && !this._pushedSemesters.has(event.entityId)) {
					return;
				}

				let payload: unknown = null;
				if (event.action !== 'deleted') {
					const data = semestre.toOne(event.entityId);
					if (data === null) return;
					payload = data;
				}

				const entity: EntityChange = {
					...event,
					semesterId: event.entityId,
					payload
				};

				const result = await this._adapter.push(entity);
				if (result.accepted) {
					this._pushedSemesters.add(event.entityId);
					this._savePushedSemesters();
				} else if (result.conflict) {
					this._persistConflict(result.conflict);
				}
				return;
			}

			// Before pushing entity data, ensure parent semester is on server
			if (event.semesterId && !this._pushedSemesters.has(event.semesterId)) {
				const semesterData = semestre.toOne(event.semesterId);
				if (semesterData) {
					const semEntity: EntityChange = {
						semesterId: event.semesterId,
						feature: 'semesters',
						entityId: event.semesterId,
						action: 'created',
						payload: semesterData,
						deviceId: event.deviceId,
						origin: 'local',
						timestamp: Date.now()
					};
					const result = await this._adapter.push(semEntity);
					if (result.accepted) {
						this._pushedSemesters.add(event.semesterId);
						this._savePushedSemesters();
					}
				}
			}

			let payload: unknown = null;
			if (event.action !== 'deleted') {
				const manager = semestre.managerFor(event.feature) as EntityManager;
				const entityData = manager.toOne(event.entityId);
				if (entityData === null) return;
				payload = entityData;
			}

			const entity: EntityChange = {
				...event,
				semesterId: event.semesterId,
				payload
			};

			const result = await this._adapter.push(entity);
			if (!result.accepted && result.conflict) {
				this._persistConflict(result.conflict);
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

	private _handleRemoteEvents(events: EntityChange[]) {
		let hadSemesterEvents = false;

		for (const event of events) {
			if (event.origin !== 'remote' || event.payload === undefined) continue;

			if (event.feature === 'semesters') {
				hadSemesterEvents = true;

				if (event.payload === null) {
					if (event.entityId) {
						semestre.removeSilent(event.entityId);
						this._persistSemesterList();
						this._removeOrphanSemesters(new Set([event.entityId]), new Set());
					}
				} else {
					semestre.fromOne(event.entityId, event.payload as { name: string });
					this._persistSemesterList();
				}
			} else {
				const manager = semestre.managerFor(event.feature) as EntityManager;
				if (event.payload === null) {
					if (event.semesterId === semestre.activeId || !semestre.activeId) {
						manager.removeSilent(event.entityId);
					}
					this._persistDirect(event.feature, event.semesterId, event.entityId, null);
				} else {
					if (event.semesterId === semestre.activeId || !semestre.activeId) {
						manager.fromOne(event.entityId, event.payload);
					}
					this._persistDirect(event.feature, event.semesterId, event.entityId, event.payload);
				}
			}
		}

		if (hadSemesterEvents) {
			semestre.ensureActive();
			this._persistActiveSem();
		}
	}

	private _persistDirect(feature: FeatureId, semesterId: string, entityId: string, payload: unknown) {
		if (feature === 'preferences') return;
		const key = semesterId + '_' + KEYS[feature];
		const existing = local.get<[string, unknown][]>(key) ?? [];
		const idx = existing.findIndex(([id]) => id === entityId);
		if (payload === null) {
			if (idx >= 0) {
				existing.splice(idx, 1);
				local.save(key, existing);
			}
		} else {
			if (idx >= 0) {
				existing[idx] = [entityId, payload];
			} else {
				existing.push([entityId, payload]);
			}
			local.save(key, existing);
		}
	}

	private _persistFeature(feature: FeatureId) {
		if (feature === 'preferences') {
			local.save(KEYS.preferences, semestre.managerFor('preferences').toSerial());
		} else {
			const semId = semestre.activeId;
			local.save(semId + '_' + KEYS[feature], semestre.managerFor(feature).toSerial());
		}
	}

	private _persistSemesters(event: EntityChange) {
		this._persistActiveSem();
		this._persistSemesterList();

		if (event.action === 'deleted' && event.entityId) {
			this._removeOrphanSemesters(new Set([event.entityId]), new Set());
		}
	}

	private _removeOrphanSemesters(oldIds: Set<string>, newIds: Set<string>) {
		for (const id of oldIds) {
			if (!newIds.has(id)) {
				for (const key of ['RMS', 'SCH', 'ESC']) {
					local.remove(id + '_' + key);
				}
			}
		}
	}

	private _persistActiveSem() {
		local.save(KEYS.active, semestre.activeId);
	}

	private _persistSemesterList() {
		local.save(KEYS.semesters, Array.from(semestre.semestres.entries()));
	}

	private _persistConflict(conflict: ConflictEvent) {
		const queue = local.get<ConflictEvent[]>(CONFLICT_QUEUE_KEY) ?? [];
		queue.push(conflict);
		local.save(CONFLICT_QUEUE_KEY, queue);
	}

	private _loadPushedSemesters() {
		const saved = local.get<string[]>(KEYS.pushed);
		if (saved) this._pushedSemesters = new Set(saved);
	}

	private _savePushedSemesters() {
		local.save(KEYS.pushed, Array.from(this._pushedSemesters));
	}
}

export const syncRouter = new SyncRouter();
