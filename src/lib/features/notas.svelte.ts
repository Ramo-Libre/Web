import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';

export type RenderType = 'assignment' | 'constraint' | 'domain';

export interface RamoNotas {
	scriptRaw: string;
	variableEntries: Record<string, number | null>;
	renderTypes: RenderType[];
}

export type NotasSerial = [string, RamoNotas][];

export const DEFAULT_SCRIPT = `// Define tu sistema de evaluación
// Ejemplo:
// NF = C1 * 0.3 + C2 * 0.3 + Ex * 0.4
// NF >= 55
// C1 in [0, 100]
// C2 in [0, 100]
// Ex in [0, 100]`;

export class NotasManager implements Serializable<NotasSerial> {
	private _data = $state<SvelteMap<string, RamoNotas>>(new SvelteMap());

	fromSerial(serial: NotasSerial) {
		this._data = new SvelteMap(serial);
	}

	toSerial(): NotasSerial {
		return Array.from(this._data.entries());
	}

	clear() {
		this._data.clear();
	}

	empty(): boolean {
		return this._data.size === 0;
	}

	get(ramoId: string): RamoNotas | undefined {
		return this._data.get(ramoId);
	}

	ensure(ramoId: string): RamoNotas {
		let data = this._data.get(ramoId);
		if (!data) {
			data = { scriptRaw: '', variableEntries: {}, renderTypes: ['constraint'] };
			this._data.set(ramoId, data);
		}
		return data;
	}

	setScript(ramoId: string, scriptRaw: string) {
		const data = this.ensure(ramoId);
		const oldVars = Object.keys(data.variableEntries);
		data.scriptRaw = scriptRaw;
		data.variableEntries = Object.fromEntries(oldVars.map((v) => [v, data.variableEntries[v] ?? null]));
		this._data.set(ramoId, { ...data });
	}

	setVariableEntry(ramoId: string, variable: string, value: number | null) {
		const data = this.ensure(ramoId);
		data.variableEntries = { ...data.variableEntries, [variable]: value };
		this._data.set(ramoId, { ...data });
	}

	setRenderTypes(ramoId: string, renderTypes: RenderType[]) {
		const data = this.ensure(ramoId);
		data.renderTypes = renderTypes;
		this._data.set(ramoId, { ...data });
	}

	remove(ramoId: string) {
		this._data.delete(ramoId);
	}
}
