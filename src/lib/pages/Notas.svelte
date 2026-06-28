<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { db } from '$lib/state/index.svelte';
	import solve, {
		type Estrategia,
		type SalidaCompleta,
		type Restriccion
	} from '@madmti/gradesolver';
	import RamosListReadOnly from './_components/notas/RamosListReadOnly.svelte';
	import StatusHeader from './_components/notas/StatusHeader.svelte';
	import Grades from './_components/notas/Grades.svelte';
	import Rules from './_components/notas/Rules.svelte';
	import EventModal from './_components/shared/EventModal.svelte';

	type Plan = {
		notas_objetivo?: Record<string, number>;
	};
	type PlanMap = Record<string, Plan>;
	type ProbReporte = {
		probabilidad_del_plan?: number;
	};
	type ProbMap = Record<string, ProbReporte>;
	type SolverOutput = SalidaCompleta & {
		planes?: PlanMap;
		reportes_probabilidad?: ProbMap;
	};

	type RamoEstado = 'possible' | 'impossible' | 'guaranteed';

	let selectedRamoId = $state('');

	let isEventModalOpen = $state(false);
	let eventPrefill = $state<{ title?: string; ramoId?: string } | null>(null);
	let lockRamo = $state(false);
	let pendingRelation = $state<{ ramoId: string; evaluacionId: string } | null>(null);

	function handleScheduleEvaluacion(payload: {
		ramoId: string;
		evaluacionId: string;
		evaluacionName: string;
		ramoName: string;
	}) {
		const { ramoId, evaluacionId, evaluacionName, ramoName } = payload;
		eventPrefill = {
			title: `${evaluacionName} - ${ramoName}`,
			ramoId
		};
		lockRamo = true;
		pendingRelation = { ramoId, evaluacionId };
		isEventModalOpen = true;
	}

	function handleEventCreated(eventId: string) {
		if (!pendingRelation) return;
		db.evaluacionEvents.link(pendingRelation.ramoId, pendingRelation.evaluacionId, eventId);
		pendingRelation = null;
	}

	function handleCloseEventModal() {
		isEventModalOpen = false;
		eventPrefill = null;
		lockRamo = false;
		pendingRelation = null;
	}

	$effect(() => {
		if (!browser) return;
		const fragment = page.url.hash.slice(1);
		if (fragment && db.ramos.has(fragment)) {
			selectedRamoId = fragment;
		}
	});

	function handleSelectRamo(id: string) {
		selectedRamoId = id;
		if (browser) {
			window.location.hash = id;
		}
	}

	let prediction = $state<SolverOutput | null>(null);
	let predictionError = $state<string | null>(null);
	let isSolving = $state(false);
	let selectedStrategy = $state<Estrategia | null>(null);
	let strategyTouched = $state(false);
	let solveRequestId = 0;

	const evaluacionesList = $derived(
		selectedRamoId ? db.notas.getEvaluacionesData(selectedRamoId).list : []
	);
	const restriccionesList = $derived(
		selectedRamoId ? db.notas.getRestriccionesData(selectedRamoId).list : []
	);
	const tagsList = $derived(selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []);
	const tagsMap = $derived(new Map(tagsList));
	const summaryStats = $derived.by(() => {
		let pendientes = 0;
		let buenas = 0;
		let malas = 0;
		let total = 0;

		for (const [ramoId] of db.ramos.list) {
			const { list } = db.notas.getEvaluacionesData(ramoId);
			const contextoRamo = db.notas.getContexto(ramoId);
			const notaAprobacion = contextoRamo?.nota_aprobacion ?? 0;

			for (const [, evaluacion] of list) {
				total += 1;
				const nota = evaluacion.valor_actual;
				if (nota === null || nota === undefined) {
					pendientes += 1;
				} else if (nota < notaAprobacion) {
					malas += 1;
				} else {
					buenas += 1;
				}
			}
		}

		return { pendientes, buenas, malas, total };
	});
	const globalStats = $derived.by(() => {
		let total = 0;
		let media = 0;
		let desviacion = 0;
		const notas: number[] = [];

		for (const [ramoId] of db.ramos.list) {
			const { list } = db.notas.getEvaluacionesData(ramoId);
			for (const [, evaluacion] of list) {
				const nota = evaluacion.valor_actual;
				if (nota !== null && nota !== undefined) {
					notas.push(nota);
				}
			}
		}

		if (notas.length > 0) {
			total = notas.length;
			media = notas.reduce((acc, value) => acc + value, 0) / total;
			desviacion = Math.sqrt(
				notas.reduce((acc, value) => acc + Math.pow(value - media, 2), 0) / total
			);
		}

		return { media, desviacion, total };
	});
	const contexto = $derived(selectedRamoId ? db.notas.getContexto(selectedRamoId) : null);
	const perfilConfig = $derived(selectedRamoId ? db.notas.getPerfil(selectedRamoId) : null);
	const perfilFingerprint = $derived(
		perfilConfig
			? `${perfilConfig.mode}-${perfilConfig.simulaciones}-${perfilConfig.media_historica}-${perfilConfig.desviacion_estandar}`
			: ''
	);

	const computeAutoPerfil = (contexto: { nota_aprobacion: number; nota_maxima: number } | null) => {
		if (
			!contexto ||
			typeof contexto.nota_aprobacion !== 'number' ||
			typeof contexto.nota_maxima !== 'number'
		) {
			return {
				simulaciones: 1000,
				media_historica: 65,
				desviacion_estandar: 10
			};
		}
		const base = contexto.nota_aprobacion;
		const media = Math.min(base * 1.1, contexto.nota_maxima);
		const desviacion = base * 0.2;
		return {
			simulaciones: 1000,
			media_historica: media,
			desviacion_estandar: desviacion
		};
	};

	let strategies = $state<Estrategia[]>([]);
	let probabilities = $state<Record<string, number>>({});
	let predictedNotas = $state<Record<string, number> | null>(null);
	let isPossible = $state<boolean | null>(null);
	let impossibleReasons = $state<string[]>([]);
	let approvalStatus = $state<'NO_POSIBLE' | 'POSIBLE' | 'GARANTIZADO' | null>(null);
	let ramoProbabilities = $state<Record<string, number | null>>({});
	let ramoStatuses = $state<Record<string, RamoEstado>>({});
	let summarySolveRequestId = 0;

	const extractPlans = (result: SolverOutput): PlanMap => result.maquina_d ?? result.planes ?? {};
	const extractProbSource = (result: SolverOutput): ProbMap =>
		result.maquina_p ?? result.reportes_probabilidad ?? {};

	const selectedProbGeneral = $derived.by(() => {
		if (!prediction) return null;
		const source = extractProbSource(prediction);
		const values = Object.values(source)
			.map((value) => value?.probabilidad_del_plan)
			.filter((value) => typeof value === 'number') as number[];
		return values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : null;
	});

	const computeRamoEstado = (
		resolved: SolverOutput,
		contextoRamo: { nota_minima: number },
		evaluaciones: { id: string; valor_actual: number | null | undefined }[]
	): RamoEstado => {
		if (
			resolved &&
			typeof resolved === 'object' &&
			'status' in resolved &&
			resolved.status === 'error'
		) {
			return 'possible';
		}

		const possible = resolved?.maquina_s?.es_posible ?? true;
		if (!possible) return 'impossible';

		const plans = extractPlans(resolved);
		const keys = Object.keys(plans);
		if (keys.length === 0) return 'possible';

		const notaMinima = contextoRamo.nota_minima;
		const pendientes = evaluaciones
			.filter((e) => e.valor_actual === null || e.valor_actual === undefined)
			.map((e) => e.id);

		const allAbove = keys.every((strategy) =>
			pendientes.every((id) => {
				const value = plans[strategy]?.notas_objetivo?.[id];
				const rounded = value !== undefined && value !== null ? Number(value.toFixed(2)) : null;
				return rounded !== null && rounded > notaMinima;
			})
		);

		const allBelowEq = keys.every((strategy) =>
			pendientes.every((id) => {
				const value = plans[strategy]?.notas_objetivo?.[id];
				const rounded = value !== undefined && value !== null ? Number(value.toFixed(2)) : null;
				return rounded !== null && rounded <= notaMinima;
			})
		);

		if (pendientes.length === 0 || allBelowEq) return 'guaranteed';
		if (allAbove) return 'possible';
		return 'possible';
	};

	function pickBestStrategy(
		result: SolverOutput,
		plans: PlanMap,
		source: ProbMap
	): Estrategia | null {
		let best: Estrategia | null = null;
		let bestProb = -1;
		for (const [key, value] of Object.entries(source)) {
			const prob = value?.probabilidad_del_plan ?? -1;
			if (prob > bestProb) {
				bestProb = prob;
				best = key as Estrategia;
			}
		}
		if (best) return best;
		const fallback = Object.keys(plans)[0];
		return (fallback as Estrategia) ?? null;
	}

	function handleSelectStrategy(strategy: Estrategia) {
		selectedStrategy = strategy;
		strategyTouched = true;
	}

	function tagName(tagId: string) {
		return tagsMap.get(tagId)?.name || tagId;
	}

	function formatRestriccion(r: Restriccion): string {
		switch (r.tipo) {
			case 'PROMEDIO_SIMPLE_TAG':
				return `Promedio ${tagName(r.tag_objetivo)} ≥ ${r.valor_minimo}`;
			case 'NOTA_MINIMA_INDIVIDUAL_TAG':
				return `Cada ${tagName(r.tag_objetivo)} ≥ ${r.valor_minimo}`;
			default:
				return r.id;
		}
	}

	$effect(() => {
		if (!prediction) {
			strategies = [];
			probabilities = {};
			predictedNotas = null;
			isPossible = null;
			impossibleReasons = [];
			approvalStatus = null;
			return;
		}

		isPossible = prediction.maquina_s?.es_posible ?? null;

		const notaMinima = contexto?.nota_minima ?? null;
		const pendientes = evaluacionesList
			.map(([, evaluacion]) => evaluacion)
			.filter((e) => e.valor_actual === null || e.valor_actual === undefined)
			.map((e) => e.id);

		const restriccionesById = new Map(
			restriccionesList.map(([, restriccion]) => [restriccion.id, restriccion])
		);
		const rawReasons = prediction.maquina_s?.restricciones_incumplibles ?? [];
		impossibleReasons = rawReasons.map((id) => {
			const restriccion = restriccionesById.get(id);
			if (restriccion) return formatRestriccion(restriccion);
			if (id === 'GLOBAL_PASS_LIMIT') {
				return 'La nota de aprobación global no se puede cumplir.';
			}
			return `Restricción incumplible: ${id}`;
		});

		const plans = extractPlans(prediction);
		const source = extractProbSource(prediction);
		const keys = Object.keys(plans) as Estrategia[];

		if (isPossible === false) {
			approvalStatus = 'NO_POSIBLE';
		} else if (isPossible === true && notaMinima !== null) {
			const allAbove =
				keys.length > 0 &&
				keys.every((strategy) =>
					pendientes.every((id) => {
						const value = plans[strategy]?.notas_objetivo?.[id];
						const rounded = value !== undefined && value !== null ? Number(value.toFixed(2)) : null;
						return rounded !== null && rounded > notaMinima;
					})
				);

			const allBelowEq =
				keys.length > 0 &&
				keys.every((strategy) =>
					pendientes.every((id) => {
						const value = plans[strategy]?.notas_objetivo?.[id];
						const rounded = value !== undefined && value !== null ? Number(value.toFixed(2)) : null;
						return rounded !== null && rounded <= notaMinima;
					})
				);

			if (pendientes.length === 0 || allBelowEq) {
				approvalStatus = 'GARANTIZADO';
			} else if (allAbove) {
				approvalStatus = 'POSIBLE';
			} else {
				approvalStatus = 'POSIBLE';
			}
		} else {
			approvalStatus = null;
		}

		strategies = keys;

		const probs: Record<string, number> = {};
		for (const [key, value] of Object.entries(source)) {
			if (value?.probabilidad_del_plan !== undefined) {
				probs[key] = value.probabilidad_del_plan;
			}
		}
		probabilities = probs;

		if (!strategyTouched || !selectedStrategy || !keys.includes(selectedStrategy)) {
			const best = pickBestStrategy(prediction, plans, source);
			if (best) {
				selectedStrategy = best;
			}
		}
	});

	$effect(() => {
		if (!prediction || !selectedStrategy) {
			predictedNotas = null;
			return;
		}
		const plans = extractPlans(prediction);
		predictedNotas = plans[selectedStrategy]?.notas_objetivo ?? null;
	});

	$effect(() => {
		if (!selectedRamoId) {
			prediction = null;
			predictionError = null;
			selectedStrategy = null;
			strategyTouched = false;
		}
	});

	$effect(() => {
		if (!selectedRamoId || !contexto) {
			console.log('⚠️ Predicción omitida: falta ramo o contexto', { selectedRamoId, contexto });
			return;
		}

		const perfilKey = perfilFingerprint;
		console.log('🧮 Ejecutando solve()', {
			selectedRamoId,
			contexto,
			perfilKey,
			evaluacionesCount: evaluacionesList.length,
			restriccionesCount: restriccionesList.length
		});

		const evaluaciones = evaluacionesList.map(([, evaluacion]) => {
			const peso = evaluacion.peso / 100;
			return { ...evaluacion, peso };
		});
		const restricciones = restriccionesList.map(([, restriccion]) => restriccion);

		const fallbackPerfil = {
			simulaciones: perfilConfig?.simulaciones ?? 1000,
			media_historica: perfilConfig?.media_historica ?? 65,
			desviacion_estandar: perfilConfig?.desviacion_estandar ?? 10
		};

		const resolvedPerfil =
			perfilConfig && 'mode' in perfilConfig && perfilConfig.mode === 'auto'
				? computeAutoPerfil(contexto)
				: fallbackPerfil;

		const input = {
			contexto,
			S: { evaluaciones, restricciones },
			P: {
				simulaciones: resolvedPerfil.simulaciones,
				media_historica: resolvedPerfil.media_historica,
				desviacion_estandar: resolvedPerfil.desviacion_estandar
			}
		};

		const requestId = ++solveRequestId;
		isSolving = true;
		predictionError = null;

		solve(input)
			.then((result) => {
				if (requestId !== solveRequestId) return;
				if (
					result &&
					typeof result === 'object' &&
					'status' in result &&
					result.status === 'error'
				) {
					console.error('❌ solve() error:', result);
					prediction = null;
					predictionError = result.message || 'Error desconocido';
					return;
				}
				const resolved = result as SolverOutput;
				console.log('✅ solve() ok:', resolved);
				console.log(
					'🧭 Estrategias disponibles:',
					Object.keys(resolved.maquina_d ?? resolved.planes ?? {})
				);
				prediction = resolved;
			})
			.catch((error) => {
				if (requestId !== solveRequestId) return;
				console.error('❌ solve() exception:', error);
				prediction = null;
				predictionError = error instanceof Error ? error.message : 'Error desconocido';
			})
			.finally(() => {
				if (requestId !== solveRequestId) return;
				isSolving = false;
			});
	});

	$effect(() => {
		const requestId = ++summarySolveRequestId;
		const next: Record<string, number | null> = {};
		const nextStatuses: Record<string, RamoEstado> = {};
		const ramos = db.ramos.list.map(([id]) => id);

		if (ramos.length === 0) {
			ramoProbabilities = {};
			ramoStatuses = {};
			return;
		}

		(async () => {
			for (const ramoId of ramos) {
				const contextoRamo = db.notas.getContexto(ramoId);
				const evaluacionesRamo = db.notas.getEvaluacionesData(ramoId).list;
				const restriccionesRamo = db.notas.getRestriccionesData(ramoId).list;
				const perfilRamo = db.notas.getPerfil(ramoId);

				const fallbackPerfil = {
					simulaciones: perfilRamo?.simulaciones ?? 1000,
					media_historica: perfilRamo?.media_historica ?? 65,
					desviacion_estandar: perfilRamo?.desviacion_estandar ?? 10
				};

				const resolvedPerfil =
					perfilRamo && 'mode' in perfilRamo && perfilRamo.mode === 'auto'
						? computeAutoPerfil(contextoRamo)
						: fallbackPerfil;

				const evaluaciones = evaluacionesRamo.map(([, evaluacion]) => {
					const peso = evaluacion.peso / 100;
					return { ...evaluacion, peso };
				});
				const restricciones = restriccionesRamo.map(([, restriccion]) => restriccion);

				if (!contextoRamo || evaluaciones.length === 0) {
					next[ramoId] = null;
					continue;
				}

				const input = {
					contexto: contextoRamo,
					S: { evaluaciones, restricciones },
					P: {
						simulaciones: resolvedPerfil.simulaciones,
						media_historica: resolvedPerfil.media_historica,
						desviacion_estandar: resolvedPerfil.desviacion_estandar
					}
				};

				try {
					const result = await solve(input);
					if (requestId !== summarySolveRequestId) return;
					if (
						result &&
						typeof result === 'object' &&
						'status' in result &&
						result.status === 'error'
					) {
						next[ramoId] = null;
						nextStatuses[ramoId] = 'possible';
						continue;
					}
					const resolved = result as SolverOutput;
					const source = extractProbSource(resolved);
					const values = Object.values(source)
						.map((value) => value?.probabilidad_del_plan)
						.filter((value) => typeof value === 'number') as number[];
					next[ramoId] = values.length
						? values.reduce((acc, value) => acc + value, 0) / values.length
						: null;
					nextStatuses[ramoId] = computeRamoEstado(resolved, contextoRamo, evaluaciones);
				} catch {
					next[ramoId] = null;
					nextStatuses[ramoId] = 'possible';
				}
			}

			if (requestId !== summarySolveRequestId) return;
			ramoProbabilities = next;
			ramoStatuses = nextStatuses;
		})();
	});
</script>

<div class="sm:h-full sm:overflow-hidden" in:fly={{ y: 10, duration: 300, delay: 100 }}>
	<div class="flex flex-col sm:grid grid-cols-1 lg:grid-cols-12 gap-6 sm:h-full">
		<div
			class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 sm:h-full sm:min-h-0 sm:overflow-hidden"
		>
			<div class="sm:flex-1 sm:overflow-y-auto sm:min-h-0">
				<RamosListReadOnly {selectedRamoId} onSelectRamo={handleSelectRamo} />
			</div>
		</div>

		<div class="lg:col-span-8 xl:col-span-9 sm:h-full sm:min-h-0 sm:overflow-y-auto">
			<div class="flex flex-col gap-6 pb-6">
				<div class="sm:flex-none">
					<StatusHeader
						{selectedRamoId}
						{summaryStats}
						{globalStats}
						{selectedProbGeneral}
						{strategies}
						{selectedStrategy}
						{probabilities}
						{isSolving}
						{isPossible}
						{impossibleReasons}
						{approvalStatus}
						error={predictionError}
						onSelectStrategy={handleSelectStrategy}
					/>
				</div>

				<div class="sm:flex-none">
					<Grades
						{selectedRamoId}
						{predictedNotas}
						{ramoProbabilities}
						{ramoStatuses}
						onScheduleEvaluacion={handleScheduleEvaluacion}
					/>
				</div>

				<div class="sm:flex-none">
					<Rules />
				</div>
			</div>

			<EventModal
				open={isEventModalOpen}
				onClose={handleCloseEventModal}
				prefill={eventPrefill}
				{lockRamo}
				onCreated={handleEventCreated}
			/>
		</div>
	</div>
</div>
