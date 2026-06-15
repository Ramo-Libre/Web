<script lang="ts">
	import { CalendarClock, BookOpen, CircleCheck, CircleX, Circle } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { db } from '$lib/state/index.svelte.js';
	import solve from '@madmti/gradesolver';

	type RamoEstado = 'possible' | 'impossible' | 'guaranteed';
	type Plan = { notas_objetivo?: Record<string, number> };
	type PlanMap = Record<string, Plan>;
	type SolverOutput = {
		maquina_s?: { es_posible?: boolean; restricciones_incumplibles?: string[] };
		maquina_d?: PlanMap;
		planes?: PlanMap;
		status?: 'error';
		message?: string;
	};

	// Obtener el semestre activo actual
	const currentSemestreIndex = $derived(db.semestres.active);
	const currentSemestreName = $derived(
		currentSemestreIndex !== null ? db.semestres.list[currentSemestreIndex] : null
	);

	let statusByRamo = $state<Record<string, RamoEstado>>({});
	let solveRunId = 0;

	const computeAutoPerfil = (contexto: { nota_aprobacion: number; nota_maxima: number } | null) => {
		if (!contexto) {
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

	const getRamoEstado = async (ramoId: string): Promise<RamoEstado> => {
		try {
			const contexto = db.notas.getContexto(ramoId);
			const evaluaciones = db.notas
				.getEvaluacionesData(ramoId)
				.list.map(([, e]) => ({ ...e, peso: e.peso / 100 }));
			const restricciones = db.notas.getRestriccionesData(ramoId).list.map(([, r]) => r);

			if (!contexto || evaluaciones.length === 0) {
				return 'possible';
			}

			const perfilConfig = db.notas.getPerfil(ramoId);
			const resolvedPerfil =
				perfilConfig && perfilConfig.mode === 'auto'
					? computeAutoPerfil(contexto)
					: {
							simulaciones: perfilConfig?.simulaciones ?? 1000,
							media_historica: perfilConfig?.media_historica ?? 65,
							desviacion_estandar: perfilConfig?.desviacion_estandar ?? 10
						};

			const input = {
				contexto,
				S: { evaluaciones, restricciones },
				P: resolvedPerfil
			};

			const result = (await solve(input)) as SolverOutput;
			if (result?.status === 'error') return 'possible';

			const possible = result?.maquina_s?.es_posible ?? true;
			if (!possible) return 'impossible';

			const plans: PlanMap = result?.maquina_d ?? result?.planes ?? {};
			const keys = Object.keys(plans);
			if (keys.length === 0) return 'possible';

			const notaMinima = contexto.nota_minima;
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
		} catch {
			return 'possible';
		}
	};

	$effect(() => {
		if (!currentSemestreName) {
			statusByRamo = {};
			return;
		}

		const runId = ++solveRunId;
		const ramosIds = db.ramos.list.map(([id]) => id);

		(async () => {
			const results = await Promise.all(
				ramosIds.map(async (id) => ({ id, estado: await getRamoEstado(id) }))
			);
			if (runId !== solveRunId) return;

			const next: Record<string, RamoEstado> = {};
			for (const r of results) next[r.id] = r.estado;
			statusByRamo = next;
		})();
	});

	const semesterRamos = $derived(() => {
		if (!currentSemestreName) return [];

		return db.ramos.list.map(([id, ramo]) => ({
			id,
			name: ramo.nombre,
			color: ramo.color,
			estado: statusByRamo[id] ?? 'possible'
		}));
	});

	const semesterData = $derived(() => {
		if (!currentSemestreName) {
			return {
				progress: 0,
				semesterName: 'Sin semestre',
				ramosCompletados: 0,
				totalRamos: 0
			};
		}

		const ramosActuales = ramos;
		const totalRamos = ramosActuales.length;
		const ramosCompletados = ramosActuales.filter((r) => r.estado === 'guaranteed').length;
		const progress = totalRamos > 0 ? Math.round((ramosCompletados / totalRamos) * 100) : 0;

		return {
			progress,
			semesterName: currentSemestreName,
			ramosCompletados,
			totalRamos
		};
	});

	const data = $derived(semesterData());
	const ramos = $derived(semesterRamos());

	function getBadgeStyle(estado: 'possible' | 'impossible' | 'guaranteed') {
		const baseStyle = `border-2 transition-all duration-200`;

		switch (estado) {
			case 'guaranteed':
				return `${baseStyle} bg-success-400 border-success-100`;
			case 'impossible':
				return `${baseStyle} bg-error-400 border-error-100`;
			case 'possible':
			default:
				// Reemplazo del gray-50 y gray-300
				return `${baseStyle} bg-base-200 border-base-400`;
		}
	}

	function getStatusIcon(estado: 'possible' | 'impossible' | 'guaranteed') {
		switch (estado) {
			case 'guaranteed':
				return CircleCheck;
			case 'impossible':
				return CircleX;
			case 'possible':
			default:
				return Circle;
		}
	}

	function getIconColor(estado: 'possible' | 'impossible' | 'guaranteed') {
		switch (estado) {
			case 'guaranteed':
				return 'text-success-100';
			case 'impossible':
				return 'text-error-100';
			case 'possible':
			default:
				// Reemplazo del gray-500
				return 'text-content/60';
		}
	}

	function getTextColor(estado: 'possible' | 'impossible' | 'guaranteed') {
		switch (estado) {
			case 'guaranteed':
				return 'text-success-100';
			case 'impossible':
				return 'text-error-100';
			case 'possible':
			default:
				// Reemplazo del gray-700
				return 'text-content/80';
		}
	}

	function adjustColorOpacity(color: string, opacity: number = 0.1) {
		if (color.startsWith('#')) {
			const r = parseInt(color.slice(1, 3), 16);
			const g = parseInt(color.slice(3, 5), 16);
			const b = parseInt(color.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}
		return color;
	}
</script>

<div class="bg-base-100 rounded-2xl p-5 border border-base-400 shadow-sm h-full">
	<div class="flex justify-between items-start mb-4">
		<div class="flex items-center gap-2">
			<CalendarClock size={18} class="text-indigo-500" />
			<h3 class="text-sm font-bold text-content/50 uppercase tracking-widest">
				Progreso Semestral
			</h3>
		</div>
		<span class="text-xs font-medium px-2 py-1 bg-base-200 rounded-md text-content/70">
			{data.semesterName}
		</span>
	</div>

	<div class="mb-4">
		<div class="flex justify-between items-center text-xs text-content/60 mb-1">
			<span>Progreso del semestre</span>
			<span>{data.progress}% ({data.ramosCompletados}/{data.totalRamos} ramos)</span>
		</div>
	</div>

	<div class="relative h-4 bg-base-300 rounded-full overflow-hidden mb-6">
		<div
			class="absolute top-0 left-0 h-full bg-linear-to-r from-primary-100 to-calendar-100 rounded-full transition-all duration-700 ease-out"
			style="width: {data.progress}%"
		></div>
		<div class="absolute top-0 bottom-0 w-0.5 bg-base-100 mix-blend-overlay right-0"></div>
	</div>

	{#if ramos.length > 0}
		<div class="flex flex-wrap gap-2 justify-center">
			{#each ramos as ramo (ramo.id)}
				{@const StatusIcon = getStatusIcon(ramo.estado)}
				<a
					href={resolve('/notas/') + '#' + ramo.id}
					class="flex items-center gap-2 px-2 py-1.5 rounded-lg {getBadgeStyle(
						ramo.estado
					)} hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer"
				>
					<div
						class="w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center shadow-sm"
						style="background-color: {ramo.color}; box-shadow: 0 0 0 1px {adjustColorOpacity(
							ramo.color,
							0.3
						)}"
					>
						{ramo.name.substring(0, 2).toUpperCase()}
					</div>

					<span class="text-xs font-medium {getTextColor(ramo.estado)}">
						{ramo.name}
					</span>

					<StatusIcon size={14} class={getIconColor(ramo.estado)} />
				</a>
			{/each}
		</div>

		<div class="mt-4 pt-3 border-t border-base-200">
			<div class="flex items-center justify-center gap-4 text-xs">
				<div class="flex items-center gap-1">
					<CircleCheck size={12} class="text-green-600" />
					<span class="text-content/70">Garantizado</span>
				</div>
				<div class="flex items-center gap-1">
					<Circle size={12} class="text-content/60" />
					<span class="text-content/70">Posible</span>
				</div>
				<div class="flex items-center gap-1">
					<CircleX size={12} class="text-red-600" />
					<span class="text-content/70">Imposible</span>
				</div>
			</div>
		</div>
	{:else}
		<div class="text-center py-4">
			<BookOpen size={20} class="text-content/30 mx-auto mb-2" />
			<p class="text-sm text-content/60">No hay ramos registrados</p>
		</div>
	{/if}
</div>
