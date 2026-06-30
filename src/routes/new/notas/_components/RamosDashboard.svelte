<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { CircleCheck, CircleX, LoaderCircle, HelpCircle, Award } from '@lucide/svelte';

	interface Props {
		results: Map<string, { feasible: boolean; probability: number } | null>;
		onSelect: (id: string) => void;
	}

	let { results, onSelect }: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
	{#each semestre.ramos.list as [id, ramo]}
		{@const r = results.get(id)}
		{@const data = semestre.notas.get(id)}
		{@const hasScript = (data?.scriptRaw ?? '').trim().length > 0}
		<button
			onclick={() => onSelect(id)}
			class="bg-base-100 border border-base-400 rounded-xl p-5 text-left transition-all hover:border-primary-100 hover:shadow-md cursor-pointer group"
		>
			<div class="flex items-center gap-3 mb-3">
				<span class="w-4 h-4 rounded-full shrink-0" style="background: {ramo.color}"></span>
				<h3 class="text-lg font-bold text-content truncate">{ramo.name}</h3>
			</div>

			{#if !hasScript}
				<div class="flex items-center gap-2 text-sm text-content/30 italic">
					<HelpCircle class="w-4 h-4" />
					Sin reglas
				</div>
			{:else if r === undefined}
				<div class="flex items-center gap-2 text-sm text-content/30 italic">
					<LoaderCircle class="w-4 h-4 animate-spin" />
					Resolviendo…
				</div>
			{:else if r === null}
				<div class="flex items-center gap-2 text-sm text-content/40">
					<HelpCircle class="w-4 h-4" />
					Error al resolver
				</div>
			{:else}
				{@const feasible = r.feasible}
				{@const guaranteed = r.feasible && r.probability >= 0.9999}
				<div class="flex items-center gap-2">
					{#if guaranteed}
						<Award class="w-5 h-5 text-success-100 shrink-0" />
					{:else if feasible}
						<CircleCheck class="w-5 h-5 text-primary-100 shrink-0" />
					{:else}
						<CircleX class="w-5 h-5 text-error-100 shrink-0" />
					{/if}
					<span class="text-sm font-semibold {guaranteed ? 'text-success-100' : feasible ? 'text-primary-100' : 'text-error-100'}">
						{guaranteed ? 'Garantizado' : feasible ? 'Factible' : 'No factible'}
					</span>
					<span class="text-sm text-content/50 ml-auto tabular-nums">
						{(r.probability * 100).toFixed(0)}%
					</span>
				</div>
			{/if}
		</button>
	{/each}
</div>
