<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { db } from '$lib/state/index.svelte';
	import solve, { type Estrategia, type SalidaCompleta } from '@madmti/gradesolver';
	import RamosListReadOnly from './_components/RamosListReadOnly.svelte';
	import StatusHeader from './_components/StatusHeader.svelte';
	import Grades from './_components/Grades.svelte';
	import Rules from './_components/Rules.svelte';

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

	// Estado para el ramo seleccionado
	let selectedRamoId = $state('');

	// Sincronizar el ramo seleccionado con el fragmento de la URL
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
	const contexto = $derived(selectedRamoId ? db.notas.getContexto(selectedRamoId) : null);

	let strategies = $state<Estrategia[]>([]);
	let probabilities = $state<Record<string, number>>({});
	let predictedNotas = $state<Record<string, number> | null>(null);

	const extractPlans = (result: SolverOutput): PlanMap => result.maquina_d ?? result.planes ?? {};
	const extractProbSource = (result: SolverOutput): ProbMap =>
		result.maquina_p ?? result.reportes_probabilidad ?? {};

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

	$effect(() => {
		if (!prediction) {
			strategies = [];
			probabilities = {};
			predictedNotas = null;
			return;
		}

		const plans = extractPlans(prediction);
		const source = extractProbSource(prediction);
		const keys = Object.keys(plans) as Estrategia[];

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

		console.log('🧮 Ejecutando solve()', {
			selectedRamoId,
			contexto,
			evaluacionesCount: evaluacionesList.length,
			restriccionesCount: restriccionesList.length
		});

		const evaluaciones = evaluacionesList.map(([, evaluacion]) => {
			const peso = evaluacion.peso / 100;
			return { ...evaluacion, peso };
		});
		const restricciones = restriccionesList.map(([, restriccion]) => restriccion);

		const input = {
			contexto,
			S: { evaluaciones, restricciones },
			P: {
				simulaciones: 1000,
				media_historica: 65,
				desviacion_estandar: 10
			}
		};

		const requestId = ++solveRequestId;
		isSolving = true;
		predictionError = null;

		solve(input)
			.then((result) => {
				if (requestId !== solveRequestId) return;
				if (result && typeof result === 'object' && 'status' in result && result.status === 'error') {
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
</script>


	<div class="sm:h-full sm:overflow-hidden" in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<!-- Layout Grid Responsivo -->
		<div class="flex flex-col sm:grid grid-cols-1 lg:grid-cols-12 gap-6 sm:h-full">
			<!-- Panel de Lista de Ramos (Aside izquierda) -->
			<div
				class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 sm:h-full sm:min-h-0 sm:overflow-hidden"
			>
				<div class="sm:flex-1 sm:overflow-y-auto sm:min-h-0">
					<RamosListReadOnly {selectedRamoId} onSelectRamo={handleSelectRamo} />
				</div>
			</div>

			<!-- Panel Principal - 3 Componentes con scroll -->
			<div class="lg:col-span-8 xl:col-span-9 sm:h-full sm:min-h-0 sm:overflow-y-auto">
				<div class="flex flex-col gap-6 pb-6">
					<!-- Componente 1: Header de Estado -->
					<div class="sm:flex-none">
						<StatusHeader
							{selectedRamoId}
							{strategies}
							{selectedStrategy}
							{probabilities}
							{isSolving}
							error={predictionError}
							onSelectStrategy={handleSelectStrategy}
						/>
					</div>

					<!-- Componente 2: Calificaciones -->
					<div class="sm:flex-none">
						<Grades {selectedRamoId} {predictedNotas} />
					</div>

					<!-- Componente 3: Reglas de Evaluación -->
					<div class="sm:flex-none">
						<Rules {selectedRamoId} />
					</div>
				</div>
			</div>
		</div>
	</div>

