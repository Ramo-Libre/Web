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
		// Retornamos el color del tag o un gris base si no existe
		return tag ? ColorUtils.tailwindToHex(tag.color) : 'var(--color-content)';
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
	<div class="bg-grid-pattern rounded-xl p-8 border border-base-400 bg-base-200 w-full relative overflow-hidden transition-colors">
		{#if rules.length > 0}
			<div class="absolute top-4 left-4 flex items-center gap-2 text-content/50">
				<Shield class="w-5 h-5" />
				<span class="font-medium text-xs uppercase tracking-wider">Reglas de Aprobación</span>
			</div>

			<div class="text-center space-y-4">
				<div class="flex items-center justify-center gap-2 flex-wrap p-6 mt-4">
					{#each rules as rule, index (index)}
						{@const tagColor = rule.tag_objetivo ? getTagColor(rule.tag_objetivo) : null}

						<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-400 bg-base-100 shadow-sm transition-colors">
							{#if rule.tag_objetivo}
								<div class="w-2 h-2 rounded-full shadow-xs" style="background-color: {tagColor}"></div>
							{/if}

							<span class="font-medium text-sm text-content/90">
								{formatRule(rule)}
							</span>
						</div>

						{#if index < rules.length - 1}
							<div class="text-content/30 text-sm font-black mx-1">∧</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<div class="h-32 flex items-center justify-center text-content/40">
				<div class="absolute top-4 left-4 flex items-center gap-2 text-content/50">
					<Shield class="w-5 h-5 text-content/30" />
					<span class="font-medium text-xs uppercase tracking-wider">Reglas de Aprobación</span>
				</div>

				<div class="text-center">
					<Shield class="w-8 h-8 mx-auto mb-2 text-content/20" />
					<span class="text-sm font-medium">No hay reglas configuradas</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Grid pattern adaptativo usando variables de Tailwind v4 */
	.bg-grid-pattern {
		/* Usamos el color de borde base-400 para los puntos del grid */
		background-image: radial-gradient(circle, var(--color-base-400) 1.5px, transparent 1.5px);
		background-size: 24px 24px;
	}
</style>
