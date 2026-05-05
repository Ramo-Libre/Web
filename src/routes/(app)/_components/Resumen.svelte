<script lang="ts">
	import { Sparkles, Play, Map, Database } from '@lucide/svelte';
	import FeatureModal from './_components/FeatureModal.svelte';

	let isModalOpen = $state(false);

	function openQuickTour() {
		isModalOpen = true;
	}

	function startGuidedTour() {
		console.log("Iniciando Tour Guiado...");
	}

	function loadSampleData() {
		console.log("Cargando Datos de Prueba...");
	}
</script>

<!-- Contenedor principal que ocupa todo el alto disponible -->
<div class="bg-base-100 border-2 border-dashed border-base-400 rounded-xl shadow-sm overflow-hidden h-full">
	<div class="flex flex-col divide-y-2 divide-dashed divide-base-400 h-full">

		<!-- 1. ITEM: TOUR RÁPIDO -->
		<button
			onclick={openQuickTour}
			class="cursor-pointer flex-1 w-full p-5 flex items-center justify-between group hover:bg-primary-400/5 transition-colors text-left"
		>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-primary-400/20 text-primary-100 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
					<Sparkles class="w-6 h-6" />
				</div>
				<div>
					<h3 class="text-content font-bold text-lg leading-tight">Vista Rápida</h3>
					<p class="text-content/60 text-sm mt-0.5">Preview de la app.</p>
				</div>
			</div>
			<div class="p-2 bg-base-200 group-hover:bg-primary-100 group-hover:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent">
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>

		<!-- 2. ITEM: TOUR GUIADO -->
		<button
			onclick={startGuidedTour}
			class="cursor-pointer flex-1 w-full p-5 flex items-center justify-between group hover:bg-schedule-400/5 transition-colors text-left"
		>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-schedule-400/20 text-schedule-100 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
					<Map class="w-6 h-6" />
				</div>
				<div>
					<h3 class="text-content font-bold text-lg leading-tight">Tutorial Guiado</h3>
					<p class="text-content/60 text-sm mt-0.5">Paso a paso.</p>
				</div>
			</div>
			<div class="p-2 bg-base-200 group-hover:bg-schedule-100 group-hover:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent">
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>

		<!-- 3. ITEM: DATOS DE PRUEBA -->
		<button
			onclick={loadSampleData}
			class="cursor-pointer flex-1 w-full p-5 flex items-center justify-between group hover:bg-grades-400/5 transition-colors text-left"
		>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-grades-400/20 text-grades-100 rounded-xl group-hover:scale-110 transition-transform shrink-0">
					<Database class="w-6 h-6" />
				</div>
				<div>
					<h3 class="text-content font-bold text-lg leading-tight">Demo de Ejemplo</h3>
					<p class="text-content/60 text-sm mt-0.5">Cargar datos de ejemplo.</p>
				</div>
			</div>
			<div class="p-2 bg-base-200 group-hover:bg-grades-100 group-hover:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent">
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>

	</div>
</div>

{#if isModalOpen}
	<FeatureModal
		open={isModalOpen}
		onClose={() => (isModalOpen = false)}
	/>
{/if}
