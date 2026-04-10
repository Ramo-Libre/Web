<script lang="ts">
	import { db } from '$lib';
	import { Clock, Calendar, RotateCcw } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let isEnabled = $state(db.dev?.timeTravelEnabled || false);

	// Separamos la fecha y la hora en dos estados de string
	let datePart = $state(db.dev?.timeTravelDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
	let timePart = $state(db.dev?.timeTravelDate?.split('T')[1]?.slice(0, 5) || new Date().toTimeString().slice(0, 5));

	// Derivamos la fecha completa combinando ambos
	let selectedDate = $derived(`${datePart}T${timePart}`);

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
		const now = new Date();
		isEnabled = false;
		datePart = now.toISOString().split('T')[0];
		timePart = now.toTimeString().slice(0, 5);
		toggleTimeTravel();
	}

	// Efecto para actualizar la DB cuando cambien los inputs si el viaje está activo
	$effect(() => {
		if (isEnabled && db.dev) {
			db.dev.timeTravelDate = selectedDate;
		}
	});
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
			<div class="grid grid-cols-5 gap-2">
				<div class="relative col-span-3">
					<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-content/30">
						<Calendar size={14} />
					</div>
					<input
						type="date"
						bind:value={datePart}
						class="w-full bg-base-200 border border-base-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
					/>
				</div>

				<div class="relative col-span-2">
					<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-content/30">
						<Clock size={14} />
					</div>
					<input
						type="time"
						bind:value={timePart}
						class="w-full bg-base-200 border border-base-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
					/>
				</div>
			</div>

			<button
				onclick={resetToNow}
				class="flex items-center justify-center gap-2 text-[11px] font-bold text-content/40 hover:text-content transition-colors py-1 uppercase tracking-wider cursor-pointer"
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
					<span class="text-[10px] font-bold text-primary-100 uppercase leading-none">
						Viaje Activo
					</span>
					<span class="text-[11px] text-content/70 font-mono mt-1">
						{new Date(selectedDate).toLocaleString()}
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Limpiar los iconos nativos en algunos navegadores para que no choquen con los de Lucide */
	input::-webkit-calendar-picker-indicator {
		background: transparent;
		bottom: 0;
		color: transparent;
		cursor: pointer;
		height: auto;
		left: 0;
		position: absolute;
		right: 0;
		top: 0;
		width: auto;
	}
</style>
