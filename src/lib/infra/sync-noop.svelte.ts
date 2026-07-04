import type { ChangeEvent } from './changes.svelte';
import type { SyncAdapter } from './sync-adapter';

class NoopAdapter implements SyncAdapter {
	readonly id = 'noop' as const;
	private _connected = false;

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

	onRemoteChanges(_handler: (events: ChangeEvent[]) => void) {
		console.log('[Sync:Noop] onRemoteChanges (no-op)', _handler);
		return () => {};
	}
}

export const noopAdapter = new NoopAdapter();
