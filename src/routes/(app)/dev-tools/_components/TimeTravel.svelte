<script lang="ts">
	import { db } from '$lib';
	import { Clock, Calendar, RotateCcw } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let isEnabled = $state(db.dev?.timeTravelEnabled || false);
	let selectedDate = $state(db.dev?.timeTravelDate || new Date().toISOString().slice(0, 16));

	function toggleTimeTravel() {
	    if (!db.dev) return;
		db.dev.timeTravelEnabled = isEnabled;
		if (isEnabled) {
			db.dev.timeTravelDate = selectedDate;
		} else {
			db.dev.timeTravelDate = null;
		}
	}

	function resetToNow() {
		isEnabled = false;
		selectedDate = new Date().toISOString().slice(0, 16);
		toggleTimeTravel();
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 text-config-100">
			<Clock size={20} />
			<h2 class="font-bold text-content">Time Traveler</h2>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-[10px] font-bold text-content/40 uppercase">Activar</span>
			<input
				type="checkbox"
				bind:checked={isEnabled}
				onchange={toggleTimeTravel}
				class="w-8 h-4 bg-base-300 rounded-full appearance-none checked:bg-primary-100 relative transition-colors cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-base-100 after:w-3 after:h-3 after:rounded-full after:transition-transform checked:after:translate-x-4"
			/>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<p class="text-xs text-content/50 leading-relaxed">
			Sobrescribe la fecha global del sistema para probar eventos futuros o pasados.
		</p>

		<div class="flex flex-col gap-2">
			<div class="relative">
				<div
					class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-content/30"
				>
					<Calendar size={14} />
				</div>
				<input
					type="datetime-local"
					bind:value={selectedDate}
					oninput={() => isEnabled && toggleTimeTravel()}
					class="w-full bg-base-200 border border-base-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
				/>
			</div>

			<button
				onclick={resetToNow}
				class="flex items-center justify-center gap-2 text-[11px] font-bold text-content/40 hover:text-content transition-colors py-1 uppercase tracking-wider"
			>
				<RotateCcw size={12} />
				Resetear a tiempo real
			</button>
		</div>

		{#if isEnabled}
			<div
				transition:slide
				class="p-3 bg-primary-400/10 border border-primary-100/30 rounded-xl flex items-center gap-3"
			>
				<div class="animate-pulse">
					<div class="w-2 h-2 bg-primary-100 rounded-full"></div>
				</div>
				<div class="flex flex-col">
					<span class="text-[10px] font-bold text-primary-100 uppercase leading-none"
						>Viaje Activo</span
					>
					<span class="text-[11px] text-content/70 font-mono mt-1">
						{new Date(selectedDate).toLocaleString()}
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>
