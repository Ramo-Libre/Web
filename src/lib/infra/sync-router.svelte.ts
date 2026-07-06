import { browser } from '$app/environment';
import { changeBus, type FeatureId, type EntityChange } from './changes.svelte';
import type { SyncAdapter, ConflictEvent } from './sync-adapter';
import { noopAdapter } from './sync-noop.svelte';
import { semestre } from './semestres.svelte';
import type { Serializable } from '$lib/types/state';
import { local } from './persistence.svelte';
import { SYNC_POLICIES, KEYS } from './sync-policies';
import type { RamosSerial } from '$lib/features/ramos.svelte';
import type { ScheduleSerial } from '$lib/features/schedule.svelte';
import type { EscenariosSerial } from '$lib/features/notas.svelte';
import { network } from './network.svelte';

type SyncStatus = 'offline' | 'disconnected' | 'connecting' | 'syncing' | 'idle' | 'error';

interface EntityManager extends Serializable<unknown> {
	toOne(id: string): unknown | null;
	fromOne(id: string, data: unknown): void;
	removeSilent(id: string): void;
}

const CONFLICT_QUEUE_KEY = 'RAMOLIBRE_V2_UNRESOLVED_CONFLICTS';
const ERROR_CLEAR_MS = 5000;

class SyncRouter {
	private _init = false;
	private _adapter: SyncAdapter = noopAdapter;
	private _unsubscribeRemote: (() => void) | null = null;
	private _pushedSemesters = new Set<string>();
	private _status = $state<SyncStatus>('disconnected');
	private _lastSyncAt = $state<number | null>(null);
	private _lastErrorMessage = $state<string | null>(null);
	private _syncingCount = 0;
	private _errorTimer: ReturnType<typeof setTimeout> | null = null;
	private _effectCleanup: (() => void) | null = null;

	get adapter() {
		return this._adapter;
	}

	get status() {
		return this._status;
	}

	get lastSyncAt() {
		return this._lastSyncAt;
	}

	get lastErrorMessage() {
		return this._lastErrorMessage;
	}

	private _setStatus(status: SyncStatus, errorMessage?: string) {
		this._status = status;
		if (status === 'error' && errorMessage) {
			this._lastErrorMessage = errorMessage;
			this._clearErrorTimer();
			this._errorTimer = setTimeout(() => {
				this._lastErrorMessage = null;
				if (this._status === 'error') {
					this._status = this._adapter.id === 'noop' ? 'disconnected' : 'idle';
				}
			}, ERROR_CLEAR_MS);
		}
		if (status !== 'error') {
			this._lastErrorMessage = null;
			if (this._errorTimer) {
				clearTimeout(this._errorTimer);
				this._errorTimer = null;
			}
		}
	}

	private _clearErrorTimer() {
		if (this._errorTimer) {
			clearTimeout(this._errorTimer);
			this._errorTimer = null;
		}
	}

	private async _trackedPush(entity: EntityChange) {
		this._syncingCount++;
		if (this._syncingCount === 1) this._status = 'syncing';
		try {
			const result = await this._adapter.push(entity);
			this._lastSyncAt = Date.now();
			return result;
		} finally {
			this._syncingCount--;
			if (this._syncingCount === 0) {
				this._status = this._lastErrorMessage ? 'error' : 'idle';
			}
		}
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

		if (adapter.id === 'noop') {
			this._setStatus('disconnected');
		} else {
			this._setStatus('connecting');
		}

		if (this._init) {
			this._unsubscribeRemote = this._adapter.onRemoteChanges((events) =>
				this._handleRemoteEvents(events)
			);
			try {
				await this._adapter.connect();
				await this._pushLocalState();
				this._setStatus(this._syncingCount > 0 ? 'syncing' : 'idle');
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				console.warn('[SyncRouter] setAdapter error', e);
				this._setStatus('error', msg);
			}
		}
	}

	init() {
		if (this._init || !browser) return;
		this._init = true;
		this._loadPushedSemesters();

		this._setStatus(network.online ? 'disconnected' : 'offline');

		this._effectCleanup = $effect.root(() => {
			$effect(() => {
				if (!network.online) {
					this._setStatus('offline');
				} else if (this._status === 'offline') {
					this._setStatus(this._adapter.id === 'noop' ? 'disconnected' : 'connecting');
					if (this._adapter.id !== 'noop') {
						this._adapter
							.connect()
							.then(() => {
								this._setStatus('idle');
							})
							.catch((e) => {
								this._setStatus('error', e instanceof Error ? e.message : String(e));
							});
					}
				}
			});
		});

		this._unsubscribeRemote = this._adapter.onRemoteChanges((events) =>
			this._handleRemoteEvents(events)
		);
		this._adapter.connect();

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
			if (
				event.feature === 'semesters' &&
				event.action === 'created' &&
				!this._semesterHasRealContent(event.entityId)
			) {
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

				const result = await this._trackedPush(entity);
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
					const result = await this._trackedPush(semEntity);
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

			const result = await this._trackedPush(entity);
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
			const activeWasNeverSynced = !this._pushedSemesters.has(semestre.activeId);
			const realSemestersArrived = semestre.semestres.size > 1;

			if (
				activeWasNeverSynced &&
				!this._semesterHasRealContent(semestre.activeId) &&
				realSemestersArrived
			) {
				const bootstrapId = semestre.activeId;
				semestre.removeSilent(bootstrapId);
				const firstReal = Array.from(semestre.semestres.entries()).sort(([, a], [, b]) =>
					a.name.localeCompare(b.name)
				)[0];
				if (firstReal) semestre.select(firstReal[0]);
			} else {
				semestre.ensureActive();
			}
			this._persistActiveSem();
		}

		semestre.loadCurrentSemester();
	}

	private _persistDirect(
		feature: FeatureId,
		semesterId: string,
		entityId: string,
		payload: unknown
	) {
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

	private async _pushLocalState() {
		this._syncingCount++;
		if (this._syncingCount === 1) this._status = 'syncing';

		const { deviceId } = await import('$lib/utils/device');

		try {
			for (const [id, data] of semestre.semestres) {
				const semResult = await this._trackedPush({
					feature: 'semesters',
					action: 'updated',
					entityId: id,
					semesterId: id,
					payload: data,
					deviceId,
					origin: 'local',
					timestamp: Date.now()
				});
				if (semResult.accepted) {
					this._pushedSemesters.add(id);
					this._savePushedSemesters();
				}

				const ramos = local.get<RamosSerial>(`${id}_${KEYS.ramos}`) || [];
				const schedule = local.get<ScheduleSerial>(`${id}_${KEYS.schedule}`) || [];
				const escenarios = local.get<EscenariosSerial>(`${id}_${KEYS.escenarios}`) || [];

				for (const [entId, entData] of ramos) {
					await this._pushEntity(id, 'ramos', entId, entData, deviceId);
				}
				for (const [evId, ev] of schedule) {
					await this._pushEntity(id, 'schedule', evId, ev, deviceId);
				}
				for (const [entId, entData] of escenarios) {
					await this._pushEntity(id, 'escenarios', entId, entData, deviceId);
				}
			}
		} finally {
			this._syncingCount--;
			if (this._syncingCount === 0) {
				this._status = this._lastErrorMessage ? 'error' : 'idle';
			}
		}
	}

	private async _pushEntity(
		semesterId: string,
		feature: FeatureId,
		entityId: string,
		payload: unknown,
		deviceId: string
	) {
		try {
			await this._trackedPush({
				feature,
				action: 'updated',
				entityId,
				semesterId,
				payload,
				deviceId,
				origin: 'local',
				timestamp: Date.now()
			});
		} catch (e) {
			console.warn(`[SyncRouter] push failed for ${feature}:${entityId}`, e);
		}
	}

	private _semesterHasRealContent(semesterId: string): boolean {
		const ramos = local.get<RamosSerial>(`${semesterId}_${KEYS.ramos}`) || [];
		const schedule = local.get<ScheduleSerial>(`${semesterId}_${KEYS.schedule}`) || [];
		const escenarios = local.get<EscenariosSerial>(`${semesterId}_${KEYS.escenarios}`) || [];
		return ramos.length > 0 || schedule.length > 0 || escenarios.length > 0;
	}
}

export const syncRouter = new SyncRouter();
