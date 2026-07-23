import { PUBLIC_TAURI_BUILD } from '$env/static/public';

const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in window;

export interface PersistenceAdapter {
	save(key: string, data: unknown): Promise<void>;
	get<T>(key: string): Promise<T | null>;
	remove(key: string): Promise<void>;
	clearAll(): Promise<void>;
}

class LocalStorageManager implements PersistenceAdapter {
	private _prefix = 'RAMOLIBRE_V2_';

	async save(id_key: string, data: unknown): Promise<void> {
		const key = this._prefix + id_key;
		localStorage.setItem(key, JSON.stringify(data));
	}

	async get<T>(id_key: string): Promise<T | null> {
		const key = this._prefix + id_key;
		const str = localStorage.getItem(key);
		return str ? (JSON.parse(str) as T) : null;
	}

	async remove(id_key: string): Promise<void> {
		localStorage.removeItem(this._prefix + id_key);
	}

	async clearAll(): Promise<void> {
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(this._prefix)) keys.push(key);
		}
		for (const key of keys) localStorage.removeItem(key);
	}
}

class TauriStoreManager implements PersistenceAdapter {
	private _store: import('@tauri-apps/plugin-store').LazyStore | null = null;
	private _ready: Promise<void> | null = null;

	private async _getStore(): Promise<import('@tauri-apps/plugin-store').LazyStore> {
		if (!this._store) {
			const { LazyStore } = await import('@tauri-apps/plugin-store');
			this._store = new LazyStore('ramolibre.json', { autoSave: 100 });
			this._ready = this._store.init();
		}
		if (this._ready) await this._ready;
		return this._store;
	}

	async save(key: string, data: unknown): Promise<void> {
		const store = await this._getStore();
		await store.set(key, data);
	}

	async get<T>(key: string): Promise<T | null> {
		const store = await this._getStore();
		const val = await store.get<T>(key);
		return val ?? null;
	}

	async remove(key: string): Promise<void> {
		const store = await this._getStore();
		await store.delete(key);
	}

	async clearAll(): Promise<void> {
		const store = await this._getStore();
		await store.clear();
	}
}

export const local: PersistenceAdapter = isTauri
	? new TauriStoreManager()
	: new LocalStorageManager();

export async function clearAllPersistence(): Promise<void> {
	await local.clearAll();
}
