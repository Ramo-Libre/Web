import type { ChangeEvent } from './changes.svelte';
import type { SyncAdapter } from './sync-adapter';

class NoopAdapter implements SyncAdapter {
	readonly id = 'noop' as const;
	private _connected = false;
	private _remoteHandler: ((events: ChangeEvent[]) => void) | null = null;

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

	async push(events: ChangeEvent[]) {
		console.log('[Sync:Noop] push', events);
	}

	async pull(sinceSequence: number) {
		console.log('[Sync:Noop] pull', { sinceSequence });
		return { changes: [], serverSequence: 0 };
	}

	onRemoteChanges(handler: (events: ChangeEvent[]) => void) {
		console.log('[Sync:Noop] onRemoteChanges');
		this._remoteHandler = handler;
		return () => {
			this._remoteHandler = null;
		};
	}

	async simulateReceiveEvents(events: ChangeEvent[]) {
		console.log('[Sync:Noop] simulateReceiveEvents', events);
		this._remoteHandler?.(events);
	}
}

export const noopAdapter = new NoopAdapter();
