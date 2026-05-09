<script lang="ts">
	import { Sparkles, Play, Map, Database, Lock } from '@lucide/svelte';
	import FeatureModal from './_components/FeatureModal.svelte';

	let isModalOpen = $state(false);

	function openQuickTour() {
		isModalOpen = true;
	}

	function startGuidedTour() {
		console.log('Iniciando Tour Guiado...');
	}

	function loadSampleData() {
		console.log('Cargando Datos de Prueba...');
	}
</script>

<div
	class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden h-full"
>
	<div class="flex flex-col divide-y divide-base-400 h-full">
		<!-- 1. ITEM: VISTA RÁPIDA (ACTIVO) -->
		<button
			onclick={openQuickTour}
			class="cursor-pointer flex-1 w-full p-5 flex items-center justify-between group hover:bg-primary-400/5 transition-colors text-left"
		>
			<div class="flex items-center gap-4">
				<div
					class="p-3 bg-primary-400/20 text-primary-100 rounded-xl group-hover:scale-110 transition-transform shrink-0"
				>
					<Sparkles class="w-6 h-6" />
				</div>
				<div>
					<h3 class="text-content font-bold text-lg leading-tight">Vista Rápida</h3>
					<p class="text-content/60 text-sm mt-0.5">Preview de la app.</p>
				</div>
			</div>
			<div
				class="p-2 bg-base-200 group-hover:bg-primary-100 group-hover:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent"
			>
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>

		<!-- 2. ITEM: TUTORIAL GUIADO (DESHABILITADO) -->
		<button
			onclick={startGuidedTour}
			disabled
			class="disabled-tour-item flex-1 w-full p-5 flex items-center justify-between text-left"
		>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-base-300 text-content/40 rounded-xl shrink-0">
					<Map class="w-6 h-6" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h3 class="text-content/50 font-bold text-lg leading-tight">Tutorial Guiado</h3>
						<Lock class="w-3.5 h-3.5 text-content/30" />
					</div>
					<p class="text-content/40 text-sm mt-0.5">Próximamente...</p>
				</div>
			</div>
			<div class="p-2 bg-base-200 text-content/20 rounded-lg border border-base-400/50">
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>

		<!-- 3. ITEM: DEMO DE EJEMPLO (DESHABILITADO) -->
		<button
			onclick={loadSampleData}
			disabled
			class="disabled-tour-item flex-1 w-full p-5 flex items-center justify-between text-left"
		>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-base-300 text-content/40 rounded-xl shrink-0">
					<Database class="w-6 h-6" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h3 class="text-content/50 font-bold text-lg leading-tight">Demo de Ejemplo</h3>
						<Lock class="w-3.5 h-3.5 text-content/30" />
					</div>
					<p class="text-content/40 text-sm mt-0.5">No disponible en esta versión.</p>
				</div>
			</div>
			<div class="p-2 bg-base-200 text-content/20 rounded-lg border border-base-400/50">
				<Play class="w-4 h-4 fill-current" />
			</div>
		</button>
	</div>
</div>

{#if isModalOpen}
	<FeatureModal open={isModalOpen} onClose={() => (isModalOpen = false)} />
{/if}

<style>
	.disabled-tour-item {
		cursor: not-allowed;
		filter: grayscale(1);
		opacity: 0.7;
		pointer-events: none; /* Evita que los eventos hover de Tailwind se disparen */
		background-color: transparent;
	}

	/* Opcional: animación de entrada que ya tenías */
	h3,
	p,
	div {
		animation: contentShift 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes contentShift {
		from {
			opacity: 0;
			transform: translateX(10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
