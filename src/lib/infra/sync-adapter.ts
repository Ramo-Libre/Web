import type { ChangeEvent } from './changes.svelte';

export type AdapterId = 'noop' | 'polling' | 'realtime';

export interface SyncAdapter {
	readonly id: AdapterId;
	connect(): Promise<void>;
	disconnect(): void;
	push(events: ChangeEvent[]): Promise<void>;
	pull(sinceSequence: number): Promise<{
		changes: ChangeEvent[];
		serverSequence: number;
	}>;
	onRemoteChanges(handler: (events: ChangeEvent[]) => void): () => void;
}
