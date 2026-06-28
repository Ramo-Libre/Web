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
		// Nota: ColorUtils.tailwindToHex debería manejar la lógica de fallback
		return firstTag ? ColorUtils.tailwindToHex(firstTag.color) : '#64748b';
	}
</script>

<div class="flex justify-center">
	<div class="bg-grid-pattern rounded-xl p-8 border border-base-400 bg-base-200 w-full relative">
		{#if evaluaciones.length > 0}
			<div class="absolute top-4 left-4 flex items-center gap-2 text-content/50">
				<Sigma class="w-5 h-5" />
				<span class="font-medium text-xs uppercase tracking-widest">Ecuación de Nota</span>
			</div>

			<div class="text-center space-y-4">
				<div class="flex items-center justify-center gap-2 font-mono text-sm flex-wrap p-8 mt-4">
					{#each evaluaciones as [, evaluacion], index (evaluacion.id)}
						{@const evalColor = getEvaluationColor(evaluacion)}
						<div class="flex items-center gap-1">
							<span class="font-bold" style="color: {evalColor}">
								{evaluacion.id}
							</span>
							<span class="text-content/30">×</span>
							<span class="text-classes-100 font-bold">
								{evaluacion.peso.toFixed(0)}%
							</span>
							{#if index < evaluaciones.length - 1}
								<span class="text-content/30">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="h-32 flex items-center justify-center text-content/40">
				<div class="absolute top-4 left-4 flex items-center gap-2 text-content/50">
					<Sigma class="w-5 h-5" />
					<span class="font-medium text-xs uppercase tracking-widest">Ecuación de Nota</span>
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
		/* Usamos una variable CSS para el punto que Tailwind v4 inyectará automáticamente */
		/* En modo claro será un gris suave, en oscuro será un blanco muy sutil */
		background-image: radial-gradient(circle, var(--color-base-400) 1.5px, transparent 1.5px);
		background-size: 24px 24px;
	}
</style>
