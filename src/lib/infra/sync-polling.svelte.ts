import { env } from '$env/dynamic/public';
import { deviceId } from '$lib/utils/device';
import type { EntityChange, FeatureId } from './changes.svelte';
import type { SyncAdapter, PushResult, PullResult, ConflictEvent } from './sync-adapter';
import { tryUpdate, insertEntity, fetchEntity, fetchWatermark, fetchChangesSince } from './sync-entities-store';
import { merge } from './conflict-resolver';
import { local } from './persistence.svelte';
import { supabase } from '$lib/supabase/client';

const POLL_INTERVAL = parseInt(env.PUBLIC_CLOUD_SYNC_POLL_INTERVAL ?? '') || 10000;

const LKS_SEQ_PREFIX = 'RAMOLIBRE_V2_LKS_SEQ_';
const LKS_PAYLOAD_PREFIX = 'RAMOLIBRE_V2_LKS_PAYLOAD_';
const CONFLICT_QUEUE_KEY = 'RAMOLIBRE_V2_UNRESOLVED_CONFLICTS';

function lksKey(prefix: string, semesterId: string, feature: string, entityId: string): string {
	return `${prefix}${semesterId}_${feature}_${entityId}`;
}

function getLastKnownSequence(semesterId: string, feature: string, entityId: string): number {
	return local.get<number>(lksKey(LKS_SEQ_PREFIX, semesterId, feature, entityId)) ?? 0;
}

function setLastKnownSequence(semesterId: string, feature: string, entityId: string, seq: number) {
	local.save(lksKey(LKS_SEQ_PREFIX, semesterId, feature, entityId), seq);
}

function getLastKnownPayload(semesterId: string, feature: string, entityId: string): unknown {
	return local.get<unknown>(lksKey(LKS_PAYLOAD_PREFIX, semesterId, feature, entityId));
}

function setLastKnownPayload(semesterId: string, feature: string, entityId: string, payload: unknown) {
	local.save(lksKey(LKS_PAYLOAD_PREFIX, semesterId, feature, entityId), payload);
}

function persistConflict(conflict: ConflictEvent) {
	const queue = local.get<ConflictEvent[]>(CONFLICT_QUEUE_KEY) ?? [];
	queue.push(conflict);
	local.save(CONFLICT_QUEUE_KEY, queue);
}

class PollingAdapter implements SyncAdapter {
	readonly id = 'polling' as const;
	private _connected = false;
	private _remoteHandler: ((changes: EntityChange[]) => void) | null = null;
	private _userId: string | null = null;
	private _timer: ReturnType<typeof setInterval> | null = null;
	private _deviceWatermark = 0;

	get connected() {
		return this._connected;
	}

	async connect() {
		if (this._connected) return;

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.warn('[Sync:Polling] connect: no authenticated user');
			return;
		}
		this._userId = user.id;
		this._connected = true;
		console.log('[Sync:Polling] connect', { userId: this._userId });

		await this._tick();

		this._timer = setInterval(() => this._tick(), POLL_INTERVAL);
	}

	disconnect() {
		console.log('[Sync:Polling] disconnect');
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
		this._connected = false;
		this._userId = null;
		this._deviceWatermark = 0;
	}

	private async _tick() {
		if (!this._userId || !this._connected) return;

		const result = await this.pull(this._deviceWatermark);

		if (result.changes.length > 0) {
			this._deviceWatermark = result.watermark;
			this._remoteHandler?.(result.changes);
		}
	}

	async push(entity: EntityChange): Promise<PushResult> {
		if (!this._userId) {
			console.warn('[Sync:Polling] push: not connected');
			return { accepted: false, serverSequence: 0 };
		}

		const { semesterId, feature, entityId, payload } = entity;
		const lastKnown = getLastKnownSequence(semesterId, feature, entityId);

		const result = await tryUpdate(
			this._userId, semesterId, feature, entityId,
			payload, lastKnown, deviceId
		);

		if (result) {
			setLastKnownSequence(semesterId, feature, entityId, result.sequence);
			setLastKnownPayload(semesterId, feature, entityId, payload);
			return { accepted: true, serverSequence: result.sequence };
		}

		if (lastKnown === 0) {
			const insertResult = await insertEntity(
				this._userId, semesterId, feature, entityId,
				payload, deviceId
			);

			if (insertResult) {
				setLastKnownSequence(semesterId, feature, entityId, insertResult.sequence);
				setLastKnownPayload(semesterId, feature, entityId, payload);
				return { accepted: true, serverSequence: insertResult.sequence };
			}

			return { accepted: false, serverSequence: 0 };
		}

		const current = await fetchEntity(this._userId, semesterId, feature, entityId);

		const lastKnownPayload = getLastKnownPayload(semesterId, feature, entityId);
		const serverPayload = current?.payload ?? null;
		const serverSequence = current?.sequence ?? 0;

		const { merged, userConflicts } = merge({
			feature,
			semesterId,
			entityId,
			base: lastKnownPayload as Record<string, unknown> | null,
			mine: payload as Record<string, unknown> | null,
			theirs: serverPayload as Record<string, unknown> | null
		});

		if (userConflicts.length > 0) {
			const conflict: ConflictEvent = {
				entityId,
				feature,
				semesterId,
				localPayload: payload,
				serverPayload,
				lastKnownSequence: lastKnown,
				serverSequence
			};
			persistConflict(conflict);
		}

		if (merged !== null) {
			const retry = await tryUpdate(
				this._userId, semesterId, feature, entityId,
				merged, serverSequence, deviceId
			);

			if (retry) {
				setLastKnownSequence(semesterId, feature, entityId, retry.sequence);
				setLastKnownPayload(semesterId, feature, entityId, merged);
				return { accepted: true, serverSequence: retry.sequence };
			}
		}

		return {
			accepted: false,
			serverSequence,
			conflict: {
				entityId,
				feature,
				semesterId,
				localPayload: payload,
				serverPayload,
				lastKnownSequence: lastKnown,
				serverSequence
			}
		};
	}

	async pull(sinceWatermark: number): Promise<PullResult> {
		if (!this._userId) {
			return { changes: [], watermark: sinceWatermark };
		}

		const currentWatermark = await fetchWatermark(this._userId);

		if (currentWatermark <= sinceWatermark) {
			return { changes: [], watermark: sinceWatermark };
		}

		const rows = await fetchChangesSince(this._userId, sinceWatermark);
		const changes: EntityChange[] = [];

		for (const row of rows) {
			if (row.payload === null) continue;

			changes.push({
				semesterId: row.semester_id,
				feature: row.feature as FeatureId,
				entityId: row.entity_id,
				action: 'updated',
				payload: row.payload,
				deviceId: row.device_id,
				origin: 'remote',
				timestamp: new Date(row.updated_at).getTime()
			});

			setLastKnownSequence(row.semester_id, row.feature, row.entity_id, row.sequence);
			setLastKnownPayload(row.semester_id, row.feature, row.entity_id, row.payload);
		}

		return { changes, watermark: currentWatermark };
	}

	onRemoteChanges(handler: (changes: EntityChange[]) => void) {
		this._remoteHandler = handler;
		return () => {
			this._remoteHandler = null;
		};
	}
}

export const pollingAdapter = new PollingAdapter();
