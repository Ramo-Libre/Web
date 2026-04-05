import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';

interface Ramo {
	nombre: string;
	color: string;
	estado?: 'possible' | 'impossible' | 'guaranteed';
}
type Key = string;
type RamosSerial = [Key, Ramo][];
type Ramos = SvelteMap<Key, Ramo>;

// Polyfill para crypto.randomUUID en navegadores móviles
function generateUUID(): string {
	if (crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback para navegadores que no soportan crypto.randomUUID
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export class RamosManager implements Serializable<RamosSerial> {
	private _ramos = $state<Ramos>(new SvelteMap<Key, Ramo>());

	fromSerial(serial: RamosSerial) {
		this._ramos = new SvelteMap<Key, Ramo>(serial);
	}

	toSerial(): RamosSerial {
		return Array.from(this._ramos.entries());
	}

	clear(): void {
		this._ramos.clear();
	}

	empty(): boolean {
		return this._ramos.size === 0;
	}

	add(ramo: Ramo) {
		const id = generateUUID();
		this._ramos.set(id, ramo);
		return id;
	}

	remove(id: string) {
		this._ramos.delete(id);
	}

	get(id: string): Ramo | undefined {
		return this._ramos.get(id);
	}

	has(id: string): boolean {
		return this._ramos.has(id);
	}

	update(id: string, ramo: Ramo) {
		this._ramos.set(id, ramo);
	}

	get list() {
		return Array.from(this._ramos.entries());
	}

	get map() {
		return this._ramos;
	}
}
