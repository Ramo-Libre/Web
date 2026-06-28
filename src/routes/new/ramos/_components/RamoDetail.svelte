<script lang="ts">
	import { BookOpen } from '@lucide/svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ColorUtils } from '$lib/utils/colors';

	interface Props {
		selectedRamoId: string;
	}

	let { selectedRamoId = '' }: Props = $props();

	const selectedRamo = $derived(selectedRamoId ? semestre.ramos.get(selectedRamoId) : null);

	function handleNameChange(e: Event) {
		if (!selectedRamoId || !selectedRamo) return;
		const newName = (e.currentTarget as HTMLInputElement).value.trim();
		if (newName) semestre.ramos.update(selectedRamoId, { ...selectedRamo, name: newName });
	}

	function handleColorChange(color: string) {
		if (!selectedRamoId || !selectedRamo) return;
		semestre.ramos.update(selectedRamoId, { ...selectedRamo, color });
	}
</script>

{#if selectedRamo}
	<div class="bg-base-100 border border-base-400 rounded-xl h-full flex flex-col transition-colors">
		<div class="p-6">
			<div class="flex items-center gap-4 mb-6">
				<div
					class="w-14 h-14 rounded-xl text-base-100 shadow-md flex items-center justify-center font-bold text-lg shrink-0"
					style="background-color: {selectedRamo.color};"
				>
					{selectedRamo.name.substring(0, 2).toUpperCase()}
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 text-content/50 mb-1">
						<span class="text-xs font-semibold uppercase tracking-wider">Nombre del Ramo</span>
					</div>
					<input
						type="text"
						value={selectedRamo.name}
						onchange={handleNameChange}
						onkeydown={(e) => {
							if (e.key === 'Enter') e.currentTarget.blur();
						}}
						class="w-full bg-transparent border-none outline-none text-2xl font-bold text-content focus:ring-0 p-0"
					/>
				</div>
			</div>

			<div class="border-t border-base-300 pt-4">
				<h3 class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">Color</h3>
				<div class="flex flex-wrap gap-2">
					{#each ColorUtils.COLORS as color (color)}
						<button
							class="w-7 h-7 rounded-lg border border-base-100/20 shadow-sm transition-all hover:scale-110 cursor-pointer {selectedRamo.color ===
							color
								? 'ring-2 ring-content/80 scale-110'
								: ''}"
							style="background-color: {color}"
							title={color}
							onclick={() => handleColorChange(color)}
							aria-label="Elegir color {color}"
						></button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="bg-base-200 border border-base-400 shadow-inner rounded-xl p-6 h-full transition-colors flex items-center justify-center"
	>
		<div class="text-center text-content/40">
			<BookOpen class="w-12 h-12 mx-auto mb-4 text-content/20" />
			<p class="text-lg font-medium text-content/60">Detalle del Ramo</p>
			<p class="text-sm mt-2">Selecciona un ramo para ver y editar sus propiedades</p>
		</div>
	</div>
{/if}
