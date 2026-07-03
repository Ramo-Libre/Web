import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';
import { generateUUID } from '$lib/utils/crypto';

export type RenderType = 'assignment' | 'constraint' | 'domain';

export interface SolverResult {
	feasible: boolean;
	plan: Map<string, number>;
	probability: number;
	constraint_violations: string[];
	libertad: { label?: string; raw: string; slack: number; penalty: number }[];
}

export interface Escenario {
	id: string;
	ramoId?: string;
	name: string;
	scriptRaw: string;
	variableEntries: Record<string, number | null>;
	renderTypes: RenderType[];
	lastResult: SolverResult | null;
	lastStrategy: string;
	lastHash: string;
}

export type EscenariosSerial = [
	string,
	{
		ramoId?: string;
		name: string;
		scriptRaw: string;
		variableEntries: Record<string, number | null>;
		renderTypes: RenderType[];
		lastResult: {
			feasible: boolean;
			plan: [string, number][];
			probability: number;
			constraint_violations: string[];
			libertad: { label?: string; raw: string; slack: number; penalty: number }[];
		} | null;
		lastStrategy: string;
		lastHash: string;
	}
][];

export const DEFAULT_SCRIPT = `// Define tu sistema de evaluación
// Ejemplo:
// NF = C1 * 0.3 + C2 * 0.3 + Ex * 0.4
// NF >= 55
// C1 in [0, 100]
// C2 in [0, 100]
// Ex in [0, 100]`;

export function hashContext(fullScript: string, strategy: string): string {
	let hash = 0;
	const str = fullScript + '::strategy::' + strategy;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return hash.toString(36);
}

export class EscenariosManager implements Serializable<EscenariosSerial> {
	private _data = $state<SvelteMap<string, Escenario>>(new SvelteMap());

		fromSerial(serial: EscenariosSerial) {
		this._data = new SvelteMap(
			serial.map(([id, rest]) => [
				id,
				{
					id,
					ramoId: rest.ramoId,
					name: rest.name,
					scriptRaw: rest.scriptRaw,
					variableEntries: rest.variableEntries,
					renderTypes: rest.renderTypes,
					lastResult: rest.lastResult
						? {
								feasible: rest.lastResult.feasible,
								plan: new Map(rest.lastResult.plan),
								probability: rest.lastResult.probability,
								constraint_violations: rest.lastResult.constraint_violations,
								libertad: rest.lastResult.libertad
							}
						: null,
					lastStrategy: rest.lastStrategy ?? 'punto_medio',
					lastHash: rest.lastHash ?? ''
				}
			])
		);
	}

	toSerial(): EscenariosSerial {
		return Array.from(this._data.entries()).map(([id, e]) => [
			id,
			{
				ramoId: e.ramoId,
				name: e.name,
				scriptRaw: e.scriptRaw,
				variableEntries: e.variableEntries,
				renderTypes: e.renderTypes,
				lastResult: e.lastResult
					? {
							feasible: e.lastResult.feasible,
							plan: Array.from(e.lastResult.plan),
							probability: e.lastResult.probability,
							constraint_violations: e.lastResult.constraint_violations,
							libertad: e.lastResult.libertad
						}
					: null,
				lastStrategy: e.lastStrategy,
				lastHash: e.lastHash
			}
		]);
	}

	clear() {
		this._data.clear();
	}

	empty(): boolean {
		return this._data.size === 0;
	}

	create(ramoId: string | undefined, name: string, scriptRaw = ''): string {
		const id = generateUUID();
		this._data.set(id, {
			id,
			ramoId,
			name,
			scriptRaw,
			variableEntries: {},
			renderTypes: ['constraint'],
			lastResult: null,
			lastStrategy: 'punto_medio',
			lastHash: ''
		});
		return id;
	}

	get(id: string): Escenario | undefined {
		return this._data.get(id);
	}

	update(id: string, partial: Partial<Omit<Escenario, 'id'>>) {
		const e = this._data.get(id);
		if (!e) return;
		this._data.set(id, { ...e, ...partial });
	}

	setScript(id: string, scriptRaw: string) {
		const e = this._data.get(id);
		if (!e) return;
		const oldVars = Object.keys(e.variableEntries);
		this._data.set(id, {
			...e,
			scriptRaw,
			lastResult: scriptRaw.trim() ? e.lastResult : null,
			lastHash: scriptRaw.trim() ? e.lastHash : '',
			variableEntries: Object.fromEntries(oldVars.map((v) => [v, e.variableEntries[v] ?? null]))
		});
	}

	setVariableEntry(id: string, variable: string, value: number | null) {
		const e = this._data.get(id);
		if (!e) return;
		this._data.set(id, {
			...e,
			variableEntries: { ...e.variableEntries, [variable]: value }
		});
	}

	setRenderTypes(id: string, renderTypes: RenderType[]) {
		const e = this._data.get(id);
		if (!e) return;
		this._data.set(id, { ...e, renderTypes });
	}

	setLastResult(id: string, result: SolverResult | null) {
		const e = this._data.get(id);
		if (!e) return;
		this._data.set(id, { ...e, lastResult: result });
	}

	setLastHash(id: string, hash: string) {
		const e = this._data.get(id);
		if (!e) return;
		this._data.set(id, { ...e, lastHash: hash });
	}

	remove(id: string) {
		this._data.delete(id);
	}

	removeByRamo(ramoId: string) {
		for (const [id, e] of this._data) {
			if (e.ramoId === ramoId) this._data.delete(id);
		}
	}

	byRamo(ramoId: string): Escenario[] {
		return Array.from(this._data.values()).filter((e) => e.ramoId === ramoId);
	}

	standalone(): Escenario[] {
		return Array.from(this._data.values()).filter((e) => !e.ramoId);
	}

	all(): Escenario[] {
		return Array.from(this._data.values());
	}

	allEntries(): [string, Escenario][] {
		return Array.from(this._data.entries());
	}
}
