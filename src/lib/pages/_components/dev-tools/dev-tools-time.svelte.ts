import { SvelteDate } from 'svelte/reactivity';

let _enabled = $state(false);
let _date = $state<string | null>(null);

export const timeTravel = {
	get enabled() {
		return _enabled;
	},
	get date() {
		return _date;
	},
	activate(dateStr: string) {
		_enabled = true;
		_date = dateStr;
	},
	deactivate() {
		_enabled = false;
		_date = null;
	},
	step(dir: -1 | 1, unit: 'minutos' | 'horas' | 'dias') {
		if (!_date) return;
		const d = new SvelteDate(_date);
		switch (unit) {
			case 'minutos':
				d.setMinutes(d.getMinutes() + dir * 15);
				break;
			case 'horas':
				d.setHours(d.getHours() + dir);
				break;
			case 'dias':
				d.setDate(d.getDate() + dir);
				break;
		}
		_date = d.toISOString();
		_enabled = true;
	},
	stepBig(dir: -1 | 1, unit: 'minutos' | 'horas' | 'dias') {
		if (!_date) return;
		const d = new SvelteDate(_date);
		switch (unit) {
			case 'minutos':
				d.setMinutes(d.getMinutes() + dir * 60);
				break;
			case 'horas':
				d.setHours(d.getHours() + dir * 6);
				break;
			case 'dias':
				d.setDate(d.getDate() + dir * 7);
				break;
		}
		_date = d.toISOString();
		_enabled = true;
	}
};
