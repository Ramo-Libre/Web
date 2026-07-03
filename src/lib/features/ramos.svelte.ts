import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteMap } from 'svelte/reactivity';

interface Ramo {
	name: string;
	color: string;
}
type Key = string;
type Ramos = SvelteMap<Key, Ramo>;

export type RamosSerial = [Key, Ramo][];
export const DEFAULT_RAMOS = [];

export type RamoRemoveHandler = (id: string) => void;

export class RamosManager implements Serializable<RamosSerial> {
	private _ramos = $state<Ramos>(new SvelteMap<Key, Ramo>(DEFAULT_RAMOS));
	private _onRemove: RamoRemoveHandler | null = null;

	constructor(onRemove?: RamoRemoveHandler) {
		this._onRemove = onRemove ?? null;
	}

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
		this._onRemove?.(id);
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
