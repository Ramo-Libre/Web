<script lang="ts">
	import { ClipboardCheck } from '@lucide/svelte';

	let draftValues = $state<Record<string, string>>({});
	let prevVars = $state('');

	interface Props {
		freeVariables: string[];
		domains: Record<string, { min: number; max: number }>;
		variableEntries: Record<string, number | null>;
		plan: Map<string, number> | Record<string, number> | null;
		onChange: (variable: string, value: number | null) => void;
	}

	let { freeVariables, domains, variableEntries, plan, onChange }: Props = $props();

	$effect(() => {
		const key = [...freeVariables].sort().join(',');
		if (key !== prevVars) {
			prevVars = key;
			draftValues = {};
			for (const v of freeVariables) {
				draftValues[v] = variableEntries[v] != null ? String(variableEntries[v]) : '';
			}
		}
	});

	function handleInput(variable: string, raw: string) {
		draftValues[variable] = raw;
	}

	function handleBlur(variable: string) {
		const raw = draftValues[variable];
		if (raw === '') {
			onChange(variable, null);
		} else {
			const val = parseFloat(raw);
			if (!isNaN(val)) {
				onChange(variable, val);
			}
		}
	}

	function planValue(variable: string): number | undefined {
		if (!plan) return;
		if (plan instanceof Map) return plan.get(variable);
		return (plan as Record<string, number>)[variable];
	}

	function getPlaceholder(variable: string): string {
		const pv = planValue(variable);
		if (pv !== undefined) return pv.toFixed(1);
		const d = domains[variable];
		if (d) return `${d.min}–${d.max}`;
		return '';
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4">
	<div class="flex items-center gap-2 mb-3">
		<ClipboardCheck class="w-4 h-4 text-content/50" />
		<h3 class="text-xs font-semibold text-content/50 uppercase tracking-wider">Notas</h3>
	</div>

	{#if freeVariables.length === 0}
		<p class="text-sm text-content/30 text-center py-4">No hay evaluaciones pendientes.</p>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
			{#each [...freeVariables].sort() as variable}
				{@const value = draftValues[variable] ?? ''}
				<div class="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
					<span class="text-sm font-medium text-content/60 shrink-0">{variable}</span>
					<input
						id="grade-{variable}"
						type="number"
						{value}
						oninput={(e) => handleInput(variable, (e.target as HTMLInputElement).value)}
						onblur={() => handleBlur(variable)}
						placeholder={getPlaceholder(variable)}
						step="any"
						class="w-0 min-w-0 flex-1 bg-transparent text-right text-sm font-bold text-content placeholder-content/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none tabular-nums"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
