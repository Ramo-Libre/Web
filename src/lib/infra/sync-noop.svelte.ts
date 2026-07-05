import type { EntityChange } from './changes.svelte';
import type { SyncAdapter, PushResult, PullResult } from './sync-adapter';

class NoopAdapter implements SyncAdapter {
	readonly id = 'noop' as const;
	private _connected = false;
	private _remoteHandler: ((events: EntityChange[]) => void) | null = null;

	get connected() {
		return this._connected;
	}

	async connect() {
		console.log('[Sync:Noop] connect');
		this._connected = true;
	}

	disconnect() {
		console.log('[Sync:Noop] disconnect');
		this._connected = false;
	}

	async push(entity: EntityChange): Promise<PushResult> {
		console.log('[Sync:Noop] push', entity);
		return { accepted: true, serverSequence: 0 };
	}

	async pull(sinceWatermark: number): Promise<PullResult> {
		console.log('[Sync:Noop] pull', { sinceWatermark });
		return { changes: [], watermark: sinceWatermark };
	}

	onRemoteChanges(handler: (events: EntityChange[]) => void) {
		console.log('[Sync:Noop] onRemoteChanges');
		this._remoteHandler = handler;
		return () => {
			this._remoteHandler = null;
		};
	}

	async simulateReceiveEvents(events: EntityChange[]) {
		console.log('[Sync:Noop] simulateReceiveEvents', events);
		this._remoteHandler?.(events);
	}
}

export const noopAdapter = new NoopAdapter();
