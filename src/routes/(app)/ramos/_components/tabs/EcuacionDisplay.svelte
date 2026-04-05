<script lang="ts">
	import { Sigma } from '@lucide/svelte';
	import { ColorUtils } from '$lib/utils/colors';

	interface Tag {
		name: string;
		color: string;
	}

	interface Evaluacion {
		id: string;
		peso: number;
		tags: string[];
	}

	interface Props {
		evaluaciones: [string, Evaluacion][];
		tags: [string, Tag][];
	}

	let { evaluaciones = [], tags = [] }: Props = $props();

	// Crear un mapa de tags para lookup rápido
	const tagsMap = $derived(new Map(tags));

	// Obtener el color del primer tag de una evaluación
	function getEvaluationColor(evaluacion: Evaluacion): string {
		if (evaluacion.tags.length === 0) return '#64748b';
		const firstTag = tagsMap.get(evaluacion.tags[0]);
		return firstTag ? ColorUtils.tailwindToHex(firstTag.color) : '#64748b';
	}
</script>

<div class="flex justify-center">
	<div class="bg-grid-pattern rounded-xl p-8 border border-slate-200 bg-slate-50 w-full relative">
		{#if evaluaciones.length > 0}
			<!-- Header con ícono -->
			<div class="absolute top-4 left-4 flex items-center gap-2 text-slate-500">
				<Sigma class="w-5 h-5" />
				<span class="font-medium">Ecuación de Nota</span>
			</div>

			<!-- Fórmula central -->
			<div class="text-center space-y-4">
				<div class="flex items-center justify-center gap-2 font-mono text-sm flex-wrap p-8 mt-4">
					{#each evaluaciones as [, evaluacion], index (evaluacion.id)}
						{@const evalColor = getEvaluationColor(evaluacion)}
						<div class="flex items-center gap-1">
							<span class="font-bold" style="color: {evalColor}">
								{evaluacion.id}
							</span>
							<span class="text-slate-400">×</span>
							<span class="text-orange-500 font-medium">
								{evaluacion.peso.toFixed(0)}%
							</span>
							{#if index < evaluaciones.length - 1}
								<span class="text-slate-400">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Estado vacío -->
			<div class="h-32 flex items-center justify-center text-slate-400">
				<div class="absolute top-4 left-4 flex items-center gap-2 text-slate-500">
					<Sigma class="w-5 h-5" />
					<span class="font-medium">Ecuación de Nota</span>
				</div>

				<div class="text-center">
					<span>No hay evaluaciones configuradas</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.bg-grid-pattern {
		background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
		background-size: 20px 20px;
		background-position:
			0 0,
			10px 10px;
	}
</style>
