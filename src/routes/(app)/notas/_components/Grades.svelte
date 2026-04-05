<script lang="ts">
	import { db } from '$lib/state/index.svelte';

	export interface Props {
			selectedRamoId: string;
			predictedNotas?: Record<string, number> | null;
		}

	let { selectedRamoId = '', predictedNotas = null }: Props = $props();

	// Obtener las evaluaciones del ramo seleccionado
	const evaluaciones = $derived.by(() => {
		if (!selectedRamoId) {
			return [];
		}
		const data = db.notas.getEvaluacionesData(selectedRamoId);
		return data.list;
	});

	// Estado local para los valores de los inputs
	let localValues = $state<Record<string, string>>({});

	function updateGrade(evaluacionId: string, value: string) {
		if (!selectedRamoId) return;

		const evaluacionesAPI = db.notas.getEvaluaciones(selectedRamoId);
		const evaluacion = evaluacionesAPI.get(evaluacionId);

		if (evaluacion) {
			const num = parseFloat(value);
			const newValorActual = !isNaN(num) ? num : null;

			evaluacionesAPI.update(evaluacionId, {
				...evaluacion,
				valor_actual: newValorActual
			});
		}
	}

	function handleInput(evaluacionId: string, value: string) {
		// Solo actualizar el estado local mientras escribe
		localValues[evaluacionId] = value;
	}

	function handleSave(evaluacionId: string) {
		// Guardar cuando pierde foco o presiona Enter
		const value = localValues[evaluacionId] || '';
		updateGrade(evaluacionId, value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const target = event.target as HTMLInputElement;
			target.blur(); // Esto activará el blur que guardará
		}
	}

	// Inicializar valores locales cuando cambien las evaluaciones
	$effect(() => {
		const newLocalValues: Record<string, string> = {};
		evaluaciones.forEach(([id, evaluacion]) => {
			newLocalValues[id] = evaluacion.valor_actual?.toString() || '';
		});
		localValues = newLocalValues;
	});
</script>

{#if selectedRamoId}
	<div class="space-y-3">
		{#each evaluaciones as [id, evaluacion] (id)}
			<div
				class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
			>
				<div>
					<div class="font-medium text-slate-800">{evaluacion.id}</div>
					<div class="text-sm text-slate-500">{evaluacion.peso}%</div>
				</div>

				<input
					type="number"
					value={localValues[id] || ''}
					placeholder={evaluacion.valor_actual === null && predictedNotas?.[evaluacion.id] !== undefined
						? predictedNotas[evaluacion.id].toFixed(1)
						: '0.0'}
					oninput={(e) => {
						const target = e.target as HTMLInputElement;
						handleInput(id, target.value);
					}}
					onblur={() => handleSave(id)}
					onkeydown={(e) => handleKeydown(e)}
					class="w-16 h-10 text-center font-bold border rounded-md {evaluacion.valor_actual !== null
						? 'border-blue-500 bg-blue-50'
						: 'border-dashed border-slate-300'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
			</div>
		{:else}
			<div class="text-center py-8">
				<div class="text-gray-400 mb-4">
					<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						></path>
					</svg>
				</div>
				<p class="text-gray-500">No hay evaluaciones configuradas</p>
			</div>
		{/each}
	</div>
{:else}
	<div class="text-center py-8">
		<div class="text-gray-400 mb-4">
			<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				></path>
			</svg>
		</div>
		<p class="text-gray-500">Selecciona un ramo para ver sus notas</p>
	</div>
{/if}
