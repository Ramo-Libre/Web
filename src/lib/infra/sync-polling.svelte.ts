import { env } from '$env/dynamic/public';
import { deviceId } from '$lib/utils/device';
import type { EntityChange, FeatureId } from './changes.svelte';
import type { SyncAdapter, PushResult, PullResult, ConflictEvent } from './sync-adapter';
import {
	tryUpdate,
	insertEntityOrNothing,
	fetchEntity,
	fetchWatermark,
	fetchChangesSince
} from './sync-entities-store';
import { merge } from './conflict-resolver';
import { local } from './persistence.svelte';
import { supabase } from '$lib/supabase/client';
import { network } from './network.svelte';
import { lksSeqKey } from './sync-policies';

const POLL_INTERVAL = parseInt(env.PUBLIC_CLOUD_SYNC_POLL_INTERVAL ?? '') || 10000;

const LKS_PAYLOAD_PREFIX = 'RAMOLIBRE_V2_LKS_PAYLOAD_';
const CONFLICT_QUEUE_KEY = 'RAMOLIBRE_V2_UNRESOLVED_CONFLICTS';
const WATERMARK_KEY_PREFIX = 'RAMOLIBRE_V2_WATERMARK_';

async function getLastKnownSequence(
	semesterId: string,
	feature: string,
	entityId: string
): Promise<number> {
	return (await local.get<number>(lksSeqKey(semesterId, feature, entityId))) ?? 0;
}

async function setLastKnownSequence(
	semesterId: string,
	feature: string,
	entityId: string,
	seq: number
) {
	await local.save(lksSeqKey(semesterId, feature, entityId), seq);
}

function lksPayloadKey(semesterId: string, feature: string, entityId: string): string {
	return `${LKS_PAYLOAD_PREFIX}${semesterId}_${feature}_${entityId}`;
}

async function getLastKnownPayload(
	semesterId: string,
	feature: string,
	entityId: string
): Promise<unknown> {
	return await local.get<unknown>(lksPayloadKey(semesterId, feature, entityId));
}

async function setLastKnownPayload(
	semesterId: string,
	feature: string,
	entityId: string,
	payload: unknown
) {
	await local.save(lksPayloadKey(semesterId, feature, entityId), payload);
}

async function persistConflict(conflict: ConflictEvent) {
	const queue = (await local.get<ConflictEvent[]>(CONFLICT_QUEUE_KEY)) ?? [];
	queue.push(conflict);
	await local.save(CONFLICT_QUEUE_KEY, queue);
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

		if (!network.online) {
			console.warn('[Sync:Polling] connect: offline, skipping');
			return;
		}

		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) {
			console.warn('[Sync:Polling] connect: no authenticated user');
			return;
		}
		this._userId = user.id;
		const saved = await local.get<number>(`${WATERMARK_KEY_PREFIX}${user.id}`);
		this._deviceWatermark = saved ?? 0;
		this._connected = true;
		console.log('[Sync:Polling] connect', {
			userId: this._userId,
			deviceWatermark: this._deviceWatermark
		});

		await this._tick();

		this._timer = setInterval(() => this._tick(), POLL_INTERVAL);
	}

	async disconnect() {
		console.log('[Sync:Polling] disconnect');
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
		if (this._deviceWatermark > 0 && this._userId) {
			await local.save(`${WATERMARK_KEY_PREFIX}${this._userId}`, this._deviceWatermark);
		}
		this._connected = false;
		this._userId = null;
		this._deviceWatermark = 0;
	}

	private async _tick() {
		if (!this._userId || !this._connected) return;

		try {
			const result = await this.pull(this._deviceWatermark);

			if (result.changes.length > 0) {
				this._remoteHandler?.(result.changes);
				this._deviceWatermark = result.watermark;
				await local.save(`${WATERMARK_KEY_PREFIX}${this._userId}`, this._deviceWatermark);
			}
		} catch (e) {
			console.warn('[Sync:Polling] _tick error', e);
		}
	}

	async push(entity: EntityChange): Promise<PushResult> {
		if (!this._userId) {
			console.warn('[Sync:Polling] push: not connected');
			return { accepted: false, serverSequence: 0 };
		}

		try {
			const { semesterId, feature, entityId, payload } = entity;
			const lastKnown = await getLastKnownSequence(semesterId, feature, entityId);

			const result = await tryUpdate(
				this._userId,
				semesterId,
				feature,
				entityId,
				payload,
				lastKnown,
				deviceId
			);

			if (result) {
				await setLastKnownSequence(semesterId, feature, entityId, result.sequence);
				await setLastKnownPayload(semesterId, feature, entityId, payload);
				return { accepted: true, serverSequence: result.sequence };
			}

			if (lastKnown === 0) {
				const insertResult = await insertEntityOrNothing(
					this._userId,
					semesterId,
					feature,
					entityId,
					payload,
					deviceId
				);

				if (insertResult) {
					await setLastKnownSequence(semesterId, feature, entityId, insertResult.sequence);
					await setLastKnownPayload(semesterId, feature, entityId, payload);
					return { accepted: true, serverSequence: insertResult.sequence };
				}
			}

			const current = await fetchEntity(this._userId, semesterId, feature, entityId);

			const lastKnownPayload = await getLastKnownPayload(semesterId, feature, entityId);
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
				await persistConflict(conflict);
			}

			if (merged !== null) {
				const retry = await tryUpdate(
					this._userId,
					semesterId,
					feature,
					entityId,
					merged,
					serverSequence,
					deviceId
				);

				if (retry) {
					await setLastKnownSequence(semesterId, feature, entityId, retry.sequence);
					await setLastKnownPayload(semesterId, feature, entityId, merged);
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
		} catch (e) {
			console.warn('[Sync:Polling] push error', e);
			return { accepted: false, serverSequence: 0 };
		}
	}

	async pull(sinceWatermark: number): Promise<PullResult> {
		if (!this._userId) {
			return { changes: [], watermark: sinceWatermark };
		}

		try {
			const currentWatermark = await fetchWatermark(this._userId);

			if (currentWatermark <= sinceWatermark) {
				return { changes: [], watermark: sinceWatermark };
			}

			const rows = await fetchChangesSince(this._userId, sinceWatermark);
			const changes: EntityChange[] = [];

			for (const row of rows) {
				if (row.device_id !== deviceId) {
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
				}

				await setLastKnownSequence(row.semester_id, row.feature, row.entity_id, row.sequence);
				await setLastKnownPayload(row.semester_id, row.feature, row.entity_id, row.payload);
			}

			return { changes, watermark: currentWatermark };
		} catch (e) {
			console.warn('[Sync:Polling] pull error', e);
			return { changes: [], watermark: sinceWatermark };
		}
	}

	onRemoteChanges(handler: (changes: EntityChange[]) => void) {
		this._remoteHandler = handler;
		return () => {
			this._remoteHandler = null;
		};
	}

	async simulateReceiveEvents(events: EntityChange[]) {
		if (!this._remoteHandler) return;

		for (const event of events) {
			if (event.payload !== undefined) {
				await setLastKnownSequence(event.semesterId, event.feature, event.entityId, 0);
				await setLastKnownPayload(event.semesterId, event.feature, event.entityId, event.payload);
			}
		}

		this._remoteHandler(events);
	}
}

export const pollingAdapter = new PollingAdapter();
