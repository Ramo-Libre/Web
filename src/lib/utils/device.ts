import { browser } from '$app/environment';
import { generateUUID } from './crypto';

const STORAGE_KEY = 'RAMOLIBRE_V2_DEVICE_ID';

function loadOrCreate(): string {
	if (!browser) return 'server';
	const existing = localStorage.getItem(STORAGE_KEY);
	if (existing) return existing;
	const id = generateUUID();
	localStorage.setItem(STORAGE_KEY, id);
	return id;
}

export const deviceId = loadOrCreate();
