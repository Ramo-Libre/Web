import type { EntityChange, FeatureId } from './changes.svelte';

export type AdapterId = 'noop' | 'polling' | 'realtime';

export interface ConflictEvent {
	entityId: string;
	feature: string;
	semesterId: string;
	localPayload: unknown;
	serverPayload: unknown;
	lastKnownSequence: number;
	serverSequence: number;
}

export interface PushResult {
	accepted: boolean;
	serverSequence: number;
	conflict?: ConflictEvent;
}

export interface PullResult {
	changes: EntityChange[];
	watermark: number;
}

export interface SyncAdapter {
	readonly id: AdapterId;
	connect(): Promise<void>;
	disconnect(): void;
	push(entity: EntityChange): Promise<PushResult>;
	pull(sinceWatermark: number): Promise<PullResult>;
	onRemoteChanges(handler: (changes: EntityChange[]) => void): () => void;
	simulateReceiveEvents?(events: EntityChange[]): Promise<void>;
}
