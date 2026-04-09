import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';
import type {
	Evaluacion as SolverEvaluacion,
	Restriccion as SolverRestriccion,
	Contexto as SolverContexto
} from '@madmti/gradesolver';

interface Tag {
	name: string;
	color: string;
}
type TagKey = string;

type Evaluacion = SolverEvaluacion;
type EvaluacionKey = string;

type Restriccion = SolverRestriccion;
type RestriccionKey = string;
type Contexto = SolverContexto;
type Perfil = {
	mode: 'auto' | 'manual';
	simulaciones: number;
	media_historica: number;
	desviacion_estandar: number;
};
type RamoKey = string;

const DEFAULT_CONTEXTO: Contexto = {
	nota_minima: 0,
	nota_maxima: 100,
	nota_aprobacion: 55
};

const DEFAULT_PERFIL: Perfil = {
	mode: 'auto',
	simulaciones: 1000,
	media_historica: 65,
	desviacion_estandar: 10
};

interface RamoData {
	evaluaciones: SvelteMap<EvaluacionKey, Evaluacion>;
	tags: SvelteMap<TagKey, Tag>;
	restricciones: SvelteMap<RestriccionKey, Restriccion>;
	contexto?: Contexto;
	perfil?: Perfil;
}

type NotasSerial = {
	last_contexto?: Contexto;
	last_perfil?: Perfil;
	ramos: [
		RamoKey,
		{
			evaluaciones: [EvaluacionKey, Evaluacion][];
			tags: [TagKey, Tag][];
			restricciones: [RestriccionKey, Restriccion][];
			contexto?: Contexto;
			perfil?: Perfil;
		}
	][];
};

export class NotasManager implements Serializable<NotasSerial> {
	private _ramos = $state<SvelteMap<RamoKey, RamoData>>(new SvelteMap<RamoKey, RamoData>());
	private _lastContexto: Contexto | null = null;
	private _lastPerfil: Perfil | null = null;

	fromSerial(serial: NotasSerial) {
		// console.log('NotasManager.fromSerial called with:', serial);
		const ramosMap = new SvelteMap<RamoKey, RamoData>();
		this._lastContexto = serial?.last_contexto ?? null;
		this._lastPerfil = serial?.last_perfil ?? null;

		// Validar que serial y serial.ramos existan
		if (serial && serial.ramos && Array.isArray(serial.ramos)) {
			// console.log('Processing ramos:', serial.ramos.length);
			serial.ramos.forEach(([ramoId, ramoSerial]) => {
				ramosMap.set(ramoId, {
					evaluaciones: new SvelteMap<EvaluacionKey, Evaluacion>(ramoSerial.evaluaciones || []),
					tags: new SvelteMap<TagKey, Tag>(ramoSerial.tags || []),
					restricciones: new SvelteMap<RestriccionKey, Restriccion>(ramoSerial.restricciones || []),
					contexto: ramoSerial.contexto,
					perfil: ramoSerial.perfil
				});
			});
		} else {
			// console.log('No valid ramos data found, using empty structure');
		}

		this._ramos = ramosMap;
	}

	toSerial(): NotasSerial {
		return {
			last_contexto: this._lastContexto ?? undefined,
			last_perfil: this._lastPerfil ?? undefined,
			ramos: Array.from(this._ramos.entries()).map(([ramoId, ramoData]) => [
				ramoId,
				{
					evaluaciones: Array.from(ramoData.evaluaciones.entries()),
					tags: Array.from(ramoData.tags.entries()),
					restricciones: Array.from(ramoData.restricciones.entries()),
					contexto: ramoData.contexto,
					perfil: ramoData.perfil
				}
			])
		};
	}

	clear(): void {
		this._ramos.clear();
		this._lastContexto = null;
		this._lastPerfil = null;
	}

	empty(): boolean {
		return this._ramos.size === 0;
	}

	// Asegurar que existe la estructura de datos para un ramo
	private ensureRamoData(ramoId: RamoKey): RamoData {
		if (!this._ramos.has(ramoId)) {
			this._ramos.set(ramoId, {
				evaluaciones: new SvelteMap<EvaluacionKey, Evaluacion>(),
				tags: new SvelteMap<TagKey, Tag>(),
				restricciones: new SvelteMap<RestriccionKey, Restriccion>(),
				contexto: undefined,
				perfil: undefined
			});
		}
		return this._ramos.get(ramoId)!;
	}

	// Obtener contexto recomendado para nuevos ramos
	getContextoRecomendado(): Contexto {
		return this._lastContexto ?? DEFAULT_CONTEXTO;
	}

	// Obtener contexto de un ramo (auto-inicializa con recomendado si no existe)
	getContexto(ramoId: RamoKey): Contexto {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData || !ramoData.contexto) {
			return { ...this.getContextoRecomendado() };
		}
		return ramoData.contexto;
	}


	// Guardar contexto de un ramo y actualizar recomendación global
	setContexto(ramoId: RamoKey, contexto: Contexto): void {
		const ramoData = this.ensureRamoData(ramoId);
		const nextContexto = { ...contexto };
		ramoData.contexto = nextContexto;
		this._lastContexto = nextContexto;
	}

	// Aplicar contexto a todos los ramos y actualizar recomendación global
	setContextoForAll(contexto: Contexto): void {
		const nextContexto = { ...contexto };
		for (const ramoId of this._ramos.keys()) {
			const ramoData = this.ensureRamoData(ramoId);
			ramoData.contexto = { ...nextContexto };
		}
		this._lastContexto = { ...nextContexto };
	}

	// Obtener perfil recomendado para nuevos ramos
	getPerfilRecomendado(): Perfil {
		return this._lastPerfil ?? DEFAULT_PERFIL;
	}

	// Obtener perfil de un ramo (auto-inicializa con recomendado si no existe)
	getPerfil(ramoId: RamoKey): Perfil {
		const ramoData = this.ensureRamoData(ramoId);
		if (!ramoData.perfil) {
			const nextPerfil = { ...this.getPerfilRecomendado() };
			const updated = { ...ramoData, perfil: nextPerfil };
			this._ramos.set(ramoId, updated);
			return nextPerfil;
		}
		return ramoData.perfil;
	}

	// Guardar perfil de un ramo y actualizar recomendación global
	setPerfil(ramoId: RamoKey, perfil: Perfil): void {
		const ramoData = this.ensureRamoData(ramoId);
		const nextPerfil = { ...perfil };
		const updated = { ...ramoData, perfil: nextPerfil };
		this._ramos.set(ramoId, updated);
		this._lastPerfil = nextPerfil;
	}

	// Aplicar perfil a todos los ramos y actualizar recomendación global
	setPerfilForAll(perfil: Perfil): void {
		const nextPerfil = { ...perfil };
		for (const ramoId of this._ramos.keys()) {
			const ramoData = this.ensureRamoData(ramoId);
			const updated = { ...ramoData, perfil: { ...nextPerfil } };
			this._ramos.set(ramoId, updated);
		}
		this._lastPerfil = { ...nextPerfil };
	}

	// Obtener datos de evaluaciones para un ramo específico (solo lectura para derivados)
	getEvaluacionesData(ramoId: RamoKey) {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) {
			return {
				list: [],
				map: new SvelteMap<EvaluacionKey, Evaluacion>()
			};
		}
		return {
			list: Array.from(ramoData.evaluaciones.entries()),
			map: ramoData.evaluaciones
		};
	}

	// Obtener datos de tags para un ramo específico (solo lectura para derivados)
	getTagsData(ramoId: RamoKey) {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) {
			return {
				list: [],
				map: new SvelteMap<TagKey, Tag>()
			};
		}
		return {
			list: Array.from(ramoData.tags.entries()),
			map: ramoData.tags
		};
	}

	// Obtener datos de restricciones para un ramo específico (solo lectura para derivados)
	getRestriccionesData(ramoId: RamoKey) {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) {
			return {
				list: [],
				map: new SvelteMap<RestriccionKey, Restriccion>()
			};
		}
		return {
			list: Array.from(ramoData.restricciones.entries()),
			map: ramoData.restricciones
		};
	}

	// Obtener API de evaluaciones para un ramo específico
	getEvaluaciones(ramoId: RamoKey) {
		const ramoData = this.ensureRamoData(ramoId);
		return {
			list: Array.from(ramoData.evaluaciones.entries()),
			map: ramoData.evaluaciones,
			add: (evaluacion: Evaluacion) => {
				const id = crypto.randomUUID
					? crypto.randomUUID()
					: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							const r = (Math.random() * 16) | 0;
							const v = c === 'x' ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						});
				ramoData.evaluaciones.set(id, {
					...evaluacion,
					valor_actual: evaluacion.valor_actual ?? null
				});
				return id;
			},
			remove: (id: EvaluacionKey) => {
				ramoData.evaluaciones.delete(id);
			},
			get: (id: EvaluacionKey) => {
				return ramoData.evaluaciones.get(id);
			},
			has: (id: EvaluacionKey) => {
				return ramoData.evaluaciones.has(id);
			},
			update: (id: EvaluacionKey, evaluacion: Evaluacion) => {
				ramoData.evaluaciones.set(id, evaluacion);
			}
		};
	}

	// Obtener API de tags para un ramo específico
	getTags(ramoId: RamoKey) {
		const ramoData = this.ensureRamoData(ramoId);
		return {
			list: Array.from(ramoData.tags.entries()),
			map: ramoData.tags,
			add: (tag: Tag) => {
				const id = crypto.randomUUID
					? crypto.randomUUID()
					: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							const r = (Math.random() * 16) | 0;
							const v = c === 'x' ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						});
				ramoData.tags.set(id, tag);
				return id;
			},
			remove: (id: TagKey) => {
				ramoData.tags.delete(id);
			},
			get: (id: TagKey) => {
				return ramoData.tags.get(id);
			},
			has: (id: TagKey) => {
				return ramoData.tags.has(id);
			},
			update: (id: TagKey, tag: Tag) => {
				ramoData.tags.set(id, tag);
			}
		};
	}

	// Obtener API de restricciones para un ramo específico
	getRestricciones(ramoId: RamoKey) {
		const ramoData = this.ensureRamoData(ramoId);
		return {
			list: Array.from(ramoData.restricciones.entries()),
			map: ramoData.restricciones,
			add: (restriccion: Restriccion) => {
				const id = crypto.randomUUID
					? crypto.randomUUID()
					: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							const r = (Math.random() * 16) | 0;
							const v = c === 'x' ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						});
				ramoData.restricciones.set(id, restriccion);
				return id;
			},
			remove: (id: RestriccionKey) => {
				ramoData.restricciones.delete(id);
			},
			get: (id: RestriccionKey) => {
				return ramoData.restricciones.get(id);
			},
			has: (id: RestriccionKey) => {
				return ramoData.restricciones.has(id);
			},
			update: (id: RestriccionKey, restriccion: Restriccion) => {
				ramoData.restricciones.set(id, restriccion);
			}
		};
	}

	// Obtener tag específico para un ramo (solo lectura)
	getTag(ramoId: RamoKey, tagId: TagKey): Tag | undefined {
		const ramoData = this._ramos.get(ramoId);
		return ramoData?.tags.get(tagId);
	}

	// Pintar evaluación con tag (para un ramo específico)
	paint(ramoId: RamoKey, evaluacionId: EvaluacionKey, tagId: TagKey) {
		const ramoData = this.ensureRamoData(ramoId);
		const evaluacion = ramoData.evaluaciones.get(evaluacionId);
		if (!evaluacion || evaluacion.tags.includes(tagId)) return;

		const newEvaluacion = { ...evaluacion, tags: [...evaluacion.tags, tagId] };
		ramoData.evaluaciones.set(evaluacionId, newEvaluacion);
	}

	// Despintar evaluación (para un ramo específico)
	unpaint(ramoId: RamoKey, evaluacionId: EvaluacionKey, tagId: TagKey) {
		const ramoData = this.ensureRamoData(ramoId);
		const evaluacion = ramoData.evaluaciones.get(evaluacionId);
		if (!evaluacion || !evaluacion.tags.includes(tagId)) return;

		const newEvaluacion = {
			...evaluacion,
			tags: evaluacion.tags.filter((tid) => tid !== tagId)
		};
		ramoData.evaluaciones.set(evaluacionId, newEvaluacion);
	}

	// Toggle paint evaluación (para un ramo específico)
	togglePaint(ramoId: RamoKey, evaluacionId: EvaluacionKey, tagId: TagKey) {
		const ramoData = this.ensureRamoData(ramoId);
		const evaluacion = ramoData.evaluaciones.get(evaluacionId);

		if (!evaluacion) {
			return;
		}

		if (evaluacion.tags.includes(tagId)) {
			this.unpaint(ramoId, evaluacionId, tagId);
		} else {
			this.paint(ramoId, evaluacionId, tagId);
		}
	}

	// Obtener peso total de evaluaciones para un ramo específico
	getCurrentWeight(ramoId: RamoKey): number {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) return 0;

		return Array.from(ramoData.evaluaciones.values()).reduce(
			(acc, evaluacion) => acc + evaluacion.peso,
			0
		);
	}

	// Remover tag de todas las evaluaciones de un ramo específico
	removeTagFromAllEvaluaciones(ramoId: RamoKey, tagId: TagKey) {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) return;

		for (const [id, evaluacion] of ramoData.evaluaciones.entries()) {
			if (evaluacion.tags.includes(tagId)) {
				evaluacion.tags = evaluacion.tags.filter((tid) => tid !== tagId);
				ramoData.evaluaciones.set(id, evaluacion);
			}
		}
	}

	// Limpiar datos de un ramo específico
	clearRamo(ramoId: RamoKey): void {
		this._ramos.delete(ramoId);
	}

	// Verificar si un ramo tiene datos
	hasRamoData(ramoId: RamoKey): boolean {
		const ramoData = this._ramos.get(ramoId);
		if (!ramoData) return false;
		return (
			ramoData.evaluaciones.size > 0 || ramoData.tags.size > 0 || ramoData.restricciones.size > 0
		);
	}

	// Obtener lista de ramos con datos
	getRamosWithData(): RamoKey[] {
		return Array.from(this._ramos.keys()).filter((ramoId) => this.hasRamoData(ramoId));
	}
}
