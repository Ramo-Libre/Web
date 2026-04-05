<script lang="ts">
	import { db } from '$lib/state/index.svelte.js';

	interface Props {
		selectedRamoId: string;
	}

	let { selectedRamoId = '' }: Props = $props();

	// Computed para el ramo seleccionado
	const selectedRamo = $derived(selectedRamoId ? db.ramos.get(selectedRamoId) : null);
</script>

{#if selectedRamo}
	<div class="bg-white border border-slate-200 rounded-xl p-6">
		<div class="flex items-center gap-4">
			<div
				class="min-h-12 min-w-12 rounded-xl text-white shadow-sm border border-white/20 flex items-center justify-center font-bold text-lg"
				style="background-color: {selectedRamo.color};"
			>
				{selectedRamo.nombre.substring(0, 2).toUpperCase()}
			</div>
			<div>
				<h2 class="text-2xl font-bold text-slate-800">{selectedRamo.nombre}</h2>
			</div>
		</div>
	</div>
{:else}
	<div class="bg-slate-100 border border-slate-200 rounded-xl p-6 text-center">
		<div class="text-slate-400">
			<h2 class="text-xl font-medium">Selecciona un ramo</h2>
			<p class="text-sm mt-1">Elige un ramo para ver su información</p>
		</div>
	</div>
{/if}
