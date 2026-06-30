<script lang="ts">
	import { FunctionSquare } from '@lucide/svelte';

	interface Props {
		plan: Record<string, number> | Map<string, number> | null;
		assignedVarNames: string[];
	}

	let { plan, assignedVarNames }: Props = $props();

	function planValue(variable: string): number | undefined {
		if (!plan) return;
		if (plan instanceof Map) return plan.get(variable);
		return (plan as Record<string, number>)[variable];
	}

	let computed = $derived(
		assignedVarNames
			.map((v) => ({ name: v, value: planValue(v) }))
			.filter((v): v is { name: string; value: number } => v.value !== undefined)
	);
</script>

{#if computed.length > 0}
	<div class="bg-base-100 border border-base-400 rounded-xl p-4">
		<div class="flex items-center gap-2 mb-3">
			<FunctionSquare class="w-4 h-4 text-content/50" />
			<h3 class="text-xs font-semibold text-content/50 uppercase tracking-wider">Resultados</h3>
		</div>
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
			{#each computed as { name, value }}
				<div class="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
					<span class="text-sm font-medium text-content/60">{name}</span>
					<span class="text-sm font-bold text-content ml-auto tabular-nums">{value.toFixed(2)}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
