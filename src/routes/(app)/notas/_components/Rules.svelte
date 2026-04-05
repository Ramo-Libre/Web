<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Restriccion } from '@madmti/gradesolver';

	interface Props {
		selectedRamoId: string;
	}

	let { selectedRamoId = '' }: Props = $props();

	const restriccionesData = $derived(
		selectedRamoId ? db.notas.getRestriccionesData(selectedRamoId) : { list: [] }
	);
	const restricciones = $derived(restriccionesData.list.map(([, r]) => r));

	const tagsList = $derived(
		selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []
	);
	const tagsMap = $derived(new Map(tagsList));

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
				return 'Restricción desconocida';
		}
	}
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
	<h2 class="text-xl font-semibold text-gray-900 mb-4">Restricciones</h2>
	{#if selectedRamoId}
		{#if restricciones.length > 0}
			<ul class="space-y-2">
				{#each restricciones as r (r.id)}
					<li class="text-sm text-slate-700">{formatRestriccion(r)}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-500">No hay restricciones configuradas</p>
		{/if}
	{:else}
		<p class="text-gray-500">No hay ramo seleccionado</p>
	{/if}
</div>
