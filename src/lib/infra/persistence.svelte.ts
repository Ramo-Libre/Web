export interface PersistenceAdapter {
	save(key: string, data: unknown): Promise<void>;
	get<T>(key: string): Promise<T | null>;
	remove(key: string): Promise<void>;
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
}

export const local: PersistenceAdapter = new LocalStorageManager();
