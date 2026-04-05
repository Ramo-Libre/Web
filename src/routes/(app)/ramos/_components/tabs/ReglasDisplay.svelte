<script lang="ts">
	import { Shield } from '@lucide/svelte';
	import { ColorUtils } from '$lib/utils/colors';
	import type { Restriccion } from '@madmti/gradesolver';

	interface TagType {
		name: string;
		color: string;
	}



	interface Props {
		rules: Restriccion[];
		tags: [string, TagType][];
	}

	let { rules = [], tags = [] }: Props = $props();

	// Crear un mapa de tags para lookup rápido
	const tagsMap = $derived(new Map(tags));

	// Obtener el color de un tag
	function getTagColor(tagId: string): string {
		const tag = tagsMap.get(tagId);
		return tag ? ColorUtils.tailwindToHex(tag.color) : '#64748b';
	}

	// Formatear texto de la regla
	function formatRule(rule: Restriccion): string {
		switch (rule.tipo) {
			case 'PROMEDIO_SIMPLE_TAG': {
				const tagNameAvg = tagsMap.get(rule.tag_objetivo)?.name || rule.tag_objetivo;
				return `Promedio ${tagNameAvg} ≥ ${rule.valor_minimo}`;
			}
			case 'NOTA_MINIMA_INDIVIDUAL_TAG': {
				const tagNameMin = tagsMap.get(rule.tag_objetivo)?.name || rule.tag_objetivo;
				return `Cada ${tagNameMin} ≥ ${rule.valor_minimo}`;
			}
			default:
				return 'Regla desconocida';
		}
	}
</script>

<div class="flex justify-center">
	<div class="bg-grid-pattern rounded-xl p-8 border border-slate-200 bg-slate-50 w-full relative">
		{#if rules.length > 0}
			<!-- Header con ícono -->
			<div class="absolute top-4 left-4 flex items-center gap-2 text-slate-500">
				<Shield class="w-5 h-5" />
				<span class="font-medium">Reglas de Aprobación</span>
			</div>

			<!-- Reglas centrales -->
			<div class="text-center space-y-4">
				<div class="flex items-center justify-center gap-2 flex-wrap p-6 mt-4">
					{#each rules as rule, index (index)}
						{@const tagColor = rule.tag_objetivo ? getTagColor(rule.tag_objetivo) : null}

						<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white">
							{#if rule.tag_objetivo}
								<div class="w-2 h-2 rounded-full" style="background-color: {tagColor}"></div>
							{/if}

							<span class="font-medium text-sm text-slate-700">
								{formatRule(rule)}
							</span>
						</div>

						{#if index < rules.length - 1}
							<div class="text-slate-400 text-sm font-medium">∧</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<!-- Estado vacío -->
			<div class="h-32 flex items-center justify-center text-slate-400">
				<div class="absolute top-4 left-4 flex items-center gap-2 text-slate-500">
					<Shield class="w-5 h-5" />
					<span class="font-medium">Reglas de Aprobación</span>
				</div>

				<div class="text-center">
					<Shield class="w-8 h-8 mx-auto mb-2 text-slate-300" />
					<span>No hay reglas configuradas</span>
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
