import type { Serializable } from '$lib/types/state';

export type SemestresSerial = {
	active: number | null;
	list: string[];
};

export class SemestresManager implements Serializable<SemestresSerial> {
	private _active = $state<number | null>(null);
	private _list = $state<string[]>([]);

	get active() {
		return this._active;
	}

	get list() {
		return this._list;
	}

	fromSerial(serial: SemestresSerial) {
		this._active = serial.active;
		this._list = serial.list || [];
	}

	toSerial(): SemestresSerial {
		return {
			active: this._active,
			list: [...this._list]
		};
	}

	clear() {
		this._active = null;
		this._list = [];
	}

	empty(): boolean {
		return this._list.length === 0;
	}

	add(name: string) {
		if (!name.trim()) return;
		this._list.push(name);
		if (this._list.length === 1) this._active = 0;
	}

	remove(index: number) {
		this._list.splice(index, 1);
		if (this._active === index) this._active = null;
		else if (this._active !== null && this._active > index) this._active--;
	}

	update(index: number, name: string) {
		this._list[index] = name;
	}

	setActive(index: number) {
		this._active = index;
	}

	get activeName() {
		if (this._active === null) return 'default';
		return this._list[this._active];
	}
}
