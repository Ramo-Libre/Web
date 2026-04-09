import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';

export type HorarioDay = 'L' | 'M' | 'X' | 'J' | 'V' | 'S';
export type HorarioType = 'book' | 'lab' | 'assist' | 'taller';

export interface Horario {
	id: string;
	ramoId?: string;
	day: HorarioDay;
	start: string; // HH:mm
	end: string; // HH:mm
	location?: string;
	type: HorarioType;
}

type HorarioKey = string;
type HorariosSerial = [HorarioKey, Horario][];
type Horarios = SvelteMap<HorarioKey, Horario>;

function generateUUID(): string {
	if (crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export class HorariosManager implements Serializable<HorariosSerial> {
	private _horarios = $state<Horarios>(new SvelteMap<HorarioKey, Horario>());

	fromSerial(serial: HorariosSerial) {
		this._horarios = new SvelteMap<HorarioKey, Horario>(serial ?? []);
	}

	toSerial(): HorariosSerial {
		return Array.from(this._horarios.entries());
	}

	clear(): void {
		this._horarios.clear();
	}

	empty(): boolean {
		return this._horarios.size === 0;
	}

	add(horario: Omit<Horario, 'id'> & { id?: string }) {
		const id = horario.id ?? generateUUID();
		const next: Horario = {
			id,
			ramoId: horario.ramoId,
			day: horario.day,
			start: horario.start,
			end: horario.end,
			location: horario.location,
			type: horario.type
		};
		this._horarios.set(id, next);
		return id;
	}

	remove(id: HorarioKey) {
		this._horarios.delete(id);
	}

	update(id: HorarioKey, horario: Horario) {
		this._horarios.set(id, horario);
	}

	get(id: HorarioKey): Horario | undefined {
		return this._horarios.get(id);
	}

	has(id: HorarioKey): boolean {
		return this._horarios.has(id);
	}

	removeByRamo(ramoId: string) {
		const toDelete: HorarioKey[] = [];
		for (const [id, horario] of this._horarios.entries()) {
			if (horario.ramoId === ramoId) toDelete.push(id);
		}
		for (const id of toDelete) this._horarios.delete(id);
	}

	get list() {
		return Array.from(this._horarios.entries());
	}

	get map() {
		return this._horarios;
	}
}
