import type { SupportedStorage } from '@supabase/auth-js';
import { PUBLIC_TAURI_BUILD } from '$env/static/public';

const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in globalThis;

function createLocalStorageAdapter(): SupportedStorage {
	return {
		getItem: (key) => localStorage.getItem(key),
		setItem: (key, value) => {
			localStorage.setItem(key, value);
		},
		removeItem: (key) => {
			localStorage.removeItem(key);
		}
	};
}

function createTauriAdapter(): SupportedStorage {
	const cache = new Map<string, string>();
	let store: import('@tauri-apps/plugin-store').LazyStore | null = null;
	let initPromise: Promise<void> | null = null;

	async function ensureStore(): Promise<import('@tauri-apps/plugin-store').LazyStore> {
		if (!store) {
			const { LazyStore } = await import('@tauri-apps/plugin-store');
			store = new LazyStore('ramolibre-auth.json', { autoSave: 100 });
			const keys = await store.keys();
			for (const key of keys) {
				const val = await store.get<string>(key);
				if (val != null) cache.set(key, val);
			}
		}
		return store;
	}

	function ensureInit(): Promise<void> {
		if (!initPromise) initPromise = ensureStore().then(() => {});
		return initPromise;
	}

	return {
		getItem: async (key) => {
			if (cache.has(key)) return cache.get(key)!;
			await ensureInit();
			const val = await store!.get<string>(key);
			if (val != null) cache.set(key, val);
			return val ?? null;
		},
		setItem: async (key, value) => {
			cache.set(key, value);
			await ensureInit();
			await store!.set(key, value);
		},
		removeItem: async (key) => {
			cache.delete(key);
			await ensureInit();
			await store!.delete(key);
		}
	};
}

export function createAuthStorage(): SupportedStorage {
	if (isTauri) return createTauriAdapter();
	return createLocalStorageAdapter();
}
