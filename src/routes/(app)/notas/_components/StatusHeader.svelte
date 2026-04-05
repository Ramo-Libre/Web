<script lang="ts">
	import type { Estrategia } from '@madmti/gradesolver';

	interface Props {
		selectedRamoId: string;
		strategies: Estrategia[];
		selectedStrategy: Estrategia | null;
		probabilities: Record<string, number>;
		onSelectStrategy: (strategy: Estrategia) => void;
		isSolving: boolean;
		error: string | null;
	}

	let {
		selectedRamoId = '',
		strategies = [],
		selectedStrategy = null,
		probabilities = {},
		onSelectStrategy,
		isSolving = false,
		error = null
	}: Props = $props();

	function labelFor(strategy: Estrategia) {
		switch (strategy) {
			case 'MINIMUM':
				return 'Mínimo';
			case 'BALANCED':
				return 'Balanceado';
			case 'MAX_WEIGHT_FIRST':
				return 'Peso Mayor';
			case 'MIN_WEIGHT_FIRST':
				return 'Peso Menor';
		}
	}

	function probLabel(strategy: Estrategia) {
		const value = probabilities[strategy];
		if (value === undefined) return '--';
		return `${(value * 100).toFixed(1)}%`;
	}
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900">Predicción</h2>
		{#if isSolving}
			<span class="text-xs text-blue-600 font-semibold">Calculando…</span>
		{/if}
	</div>

	{#if selectedRamoId}
		{#if strategies.length > 0}
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
				{#each strategies as strategy (strategy)}
					<button
						onclick={() => onSelectStrategy(strategy)}
						class="text-left px-3 py-3 rounded-lg border transition-all cursor-pointer
						{selectedStrategy === strategy
							? 'border-emerald-500 bg-emerald-50 shadow-sm'
							: 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'}"
					>
						<div class="text-xs text-gray-500">Estrategia</div>
						<div class="font-semibold text-slate-800">{labelFor(strategy)}</div>
						<div class="text-xs text-slate-500 mt-1">Éxito: {probLabel(strategy)}</div>
					</button>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 text-sm">No hay estrategias disponibles todavía.</p>
		{/if}

		{#if error}
			<div class="text-sm text-red-600 font-medium">{error}</div>
		{/if}
	{:else}
		<p class="text-gray-500">No hay ramo seleccionado</p>
	{/if}
</div>
