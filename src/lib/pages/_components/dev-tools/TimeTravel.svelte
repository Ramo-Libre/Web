<script lang="ts">
	import { Clock } from '@lucide/svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { timeTravel } from './dev-tools-time.svelte';

	let datePart = $state(
		timeTravel.date?.split('T')[0] || new SvelteDate().toISOString().split('T')[0]
	);
	let timePart = $state(
		timeTravel.date?.split('T')[1]?.slice(0, 5) || new SvelteDate().toTimeString().slice(0, 5)
	);

	let selectedDate = $derived(`${datePart}T${timePart}`);

	let displayLabel = $derived(
		(() => {
			const d = new SvelteDate(selectedDate);
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = d.getFullYear();
			const hh = String(d.getHours()).padStart(2, '0');
			const mi = String(d.getMinutes()).padStart(2, '0');
			return `${dd}/${mm}/${yyyy} - ${hh}:${mi}`;
		})()
	);

	type Unit = 'minutos' | 'horas' | 'dias';
	let unit = $state<Unit>('horas');

	function activate() {
		timeTravel.activate(selectedDate);
	}

	function deactivate() {
		timeTravel.deactivate();
	}

	function step(dir: -1 | 1) {
		const d = new SvelteDate(selectedDate);
		switch (unit) {
			case 'minutos':
				d.setMinutes(d.getMinutes() + dir * 15);
				break;
			case 'horas':
				d.setHours(d.getHours() + dir);
				break;
			case 'dias':
				d.setDate(d.getDate() + dir);
				break;
		}
		datePart = d.toISOString().split('T')[0];
		timePart = d.toTimeString().slice(0, 5);
		if (!timeTravel.enabled) activate();
	}

	function stepBig(dir: -1 | 1) {
		const d = new SvelteDate(selectedDate);
		switch (unit) {
			case 'minutos':
				d.setMinutes(d.getMinutes() + dir * 60);
				break;
			case 'horas':
				d.setHours(d.getHours() + dir * 6);
				break;
			case 'dias':
				d.setDate(d.getDate() + dir * 7);
				break;
		}
		datePart = d.toISOString().split('T')[0];
		timePart = d.toTimeString().slice(0, 5);
		if (!timeTravel.enabled) activate();
	}
</script>

<div class="bg-base-200 border border-base-300 rounded-xl overflow-hidden shadow-sm">
	<div class="bg-base-100 px-3 py-2 border-b border-base-300 flex items-center justify-between">
		<div class="flex items-center gap-1.5">
			<Clock class="h-3.5 w-3.5 text-primary-100" />
			<span class="text-[10px] font-bold text-content/50 uppercase tracking-widest"
				>Viaje en el Tiempo</span
			>
		</div>
		<div class="flex items-center gap-1.5">
			<span
				class="text-[9px] font-bold uppercase tracking-wider {timeTravel.enabled
					? 'text-primary-100'
					: 'text-content/30'}"
			>
				{timeTravel.enabled ? 'Activo' : 'Off'}
			</span>
			<span
				class="w-1.5 h-1.5 rounded-full {timeTravel.enabled
					? 'bg-primary-100 animate-pulse'
					: 'bg-base-300'}"
			></span>
		</div>
	</div>

	<div class="p-3 space-y-2.5">
		<div
			class="bg-base-300/80 border border-base-300 rounded-lg px-4 py-2.5 flex items-center justify-center min-h-[40px]"
		>
			<span
				class="text-sm font-mono font-bold tracking-[0.1em] {timeTravel.enabled
					? 'text-primary-100'
					: 'text-content/40'}">{displayLabel}</span
			>
		</div>

		<div class="flex gap-1">
			<button
				onclick={() => (unit = 'minutos')}
				class="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-md border-2 cursor-pointer transition-all duration-75 select-none
					{unit === 'minutos'
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				Min
			</button>
			<button
				onclick={() => (unit = 'horas')}
				class="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-md border-2 cursor-pointer transition-all duration-75 select-none
					{unit === 'horas'
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				Hrs
			</button>
			<button
				onclick={() => (unit = 'dias')}
				class="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-md border-2 cursor-pointer transition-all duration-75 select-none
					{unit === 'dias'
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				Días
			</button>
		</div>

		<div class="grid grid-cols-4 gap-1">
			<button
				onclick={() => stepBig(-1)}
				class="h-10 text-lg font-bold rounded-md border-2 cursor-pointer transition-all duration-75 select-none flex items-center justify-center
					{timeTravel.enabled
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				◄◄
			</button>
			<button
				onclick={() => step(-1)}
				class="h-10 text-lg font-bold rounded-md border-2 cursor-pointer transition-all duration-75 select-none flex items-center justify-center
					{timeTravel.enabled
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				◄
			</button>
			<button
				onclick={() => step(1)}
				class="h-10 text-lg font-bold rounded-md border-2 cursor-pointer transition-all duration-75 select-none flex items-center justify-center
					{timeTravel.enabled
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				►
			</button>
			<button
				onclick={() => stepBig(1)}
				class="h-10 text-lg font-bold rounded-md border-2 cursor-pointer transition-all duration-75 select-none flex items-center justify-center
					{timeTravel.enabled
					? 'bg-primary-100/15 border-primary-200/30 shadow-inner text-primary-100'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				►►
			</button>
		</div>

		<div class="flex items-center justify-center gap-1 text-[10px] font-mono text-content/40">
			<span>—</span>
			<span class="px-1.5">
				{unit === 'minutos' ? '15 min' : unit === 'horas' ? '1 hr' : '1 día'}
			</span>
			<span class="text-content/20">|</span>
			<span class="px-1.5">
				{unit === 'minutos' ? '1 hr' : unit === 'horas' ? '6 hrs' : '7 días'}
			</span>
			<span>—</span>
		</div>

		<div class="flex gap-1">
			<button
				onclick={activate}
				class="flex-1 h-8 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border-2 cursor-pointer transition-all duration-75 select-none
					{timeTravel.enabled
					? 'bg-red-900/30 border-red-500/20 shadow-inner text-red-400'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				<span
					class="w-2 h-2 rounded-full {timeTravel.enabled
						? 'bg-red-400 animate-pulse'
						: 'bg-transparent'}"
				></span>
				Viajar
			</button>
			<button
				onclick={deactivate}
				class="flex-1 h-8 text-[10px] font-bold uppercase tracking-wider rounded-md border-2 cursor-pointer transition-all duration-75 select-none
					{!timeTravel.enabled
					? 'bg-base-300 border-base-400 shadow-inner text-content/50'
					: 'bg-base-100 border-base-300 shadow-sm text-content/40 hover:border-primary-200/20 hover:text-primary-100'}"
			>
				Detener
			</button>
		</div>
	</div>
</div>

<style>
	button:active {
		transform: scale(0.97);
	}
</style>
