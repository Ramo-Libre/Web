<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import RamosList from './_components/RamosList.svelte';
	import RamoContent from './_components/RamoContent.svelte';
	import ColorPicker from './_components/ColorPicker.svelte';
	import { db } from '$lib/state/index.svelte';

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
	}
</script>

<div class="sm:h-full sm:overflow-hidden" in:fly={{ y: 10, duration: 300, delay: 100 }}>
	<!-- Layout Grid Responsivo -->
	<div class="flex flex-col sm:grid grid-cols-1 lg:grid-cols-12 gap-6 sm:h-full">
		<!-- Panel de Lista de Ramos -->
		<div
			class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 sm:h-full sm:min-h-0 sm:overflow-hidden"
		>
			<div class="sm:flex-1 sm:overflow-y-auto sm:min-h-0">
				<RamosList {selectedRamoId} onSelectRamo={handleSelectRamo} />
			</div>
			<div class="sm:flex-none">
				<ColorPicker {selectedRamoId} />
			</div>
		</div>

		<!-- Panel Principal - Header y Contenido -->
		<div
			class="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 sm:h-full sm:min-h-0 sm:overflow-hidden"
		>
			<!-- Contenido del Ramo -->
			<div class="sm:flex-1 sm:overflow-y-auto sm:min-h-0">
				<RamoContent {selectedRamoId} />
			</div>
		</div>
	</div>
</div>
