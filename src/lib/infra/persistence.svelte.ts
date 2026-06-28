export interface LocalPersistenceAdapter {
    save(key: string, data: unknown): void;
    get<T>(key: string): T | null;
};


class LocalStorageManager implements LocalPersistenceAdapter {
    private _prefix = "RAMOLIBRE_V2_";

    save(id_key: string, data: unknown): void {
        const key = this._prefix + id_key;
        const strData = JSON.stringify(data)
        localStorage.setItem(key, strData);
    }

    get<T>(id_key: string): T | null {
        const key = this._prefix + id_key;
        const strData = localStorage.getItem(key);
        if (!strData) return null;
        const objectData = JSON.parse(strData);
        return objectData;
    }
};


export const local = new LocalStorageManager();
