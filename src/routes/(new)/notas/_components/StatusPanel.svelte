<script lang="ts">
	import { CircleCheck, CircleX, AlertTriangle, BarChart3, Award, LoaderCircle, HelpCircle } from '@lucide/svelte';

	interface Props {
		feasible: boolean | null;
		probability: number | null;
		constraintViolations: string[];
		libertad: { label?: string; raw: string; slack: number; penalty: number }[];
		isSolving: boolean;
	}

	let { feasible, probability, constraintViolations, libertad, isSolving }: Props = $props();

	const guaranteed = $derived(feasible === true && probability !== null && probability >= 0.9999);
</script>

<div class="bg-base-100 border border-base-400 rounded-xl overflow-hidden">
	<div
		class="relative p-5 text-base-100 min-h-[132px] {isSolving || feasible === null
			? 'bg-linear-to-r from-primary-100 to-primary-100/90'
			: guaranteed
				? 'bg-linear-to-r from-success-100 to-success-100/90'
				: feasible === false
					? 'bg-linear-to-r from-error-100 to-error-100/90'
					: 'bg-linear-to-r from-primary-100 to-primary-100/90'}"
	>
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2 opacity-80">
				<BarChart3 size={16} />
				<span class="text-xs font-bold uppercase tracking-widest">Estado</span>
			</div>
		</div>

		{#if isSolving}
			<div class="relative z-10 flex items-center gap-3">
				<LoaderCircle class="w-8 h-8 text-base-100/70 shrink-0 animate-spin" />
				<div>
					<div class="text-2xl font-bold text-base-100/70">Resolviendo…</div>
					<div class="text-sm text-base-100/60">Calculando predicción</div>
				</div>
			</div>
		{:else if feasible === null}
			<div class="relative z-10 flex items-center gap-3">
				<HelpCircle class="w-8 h-8 text-base-100/50 shrink-0" />
				<div>
					<div class="text-2xl font-bold italic text-base-100/50">Sin datos</div>
					<div class="text-sm text-base-100/50">Sin predicción disponible</div>
				</div>
			</div>
		{:else if guaranteed}
			<div class="relative z-10 flex items-center gap-3">
				<Award class="w-8 h-8 text-base-100 shrink-0" />
				<div>
					<div class="text-2xl font-bold">Garantizado</div>
					<div class="text-sm text-base-100/80">100% de aprobar</div>
				</div>
			</div>
		{:else}
			<div class="relative z-10 flex items-center gap-3">
				{#if feasible}
					<CircleCheck class="w-8 h-8 text-base-100 shrink-0" />
					<div>
						<div class="text-2xl font-bold">Factible</div>
						{#if probability !== null}
							<div class="text-sm text-base-100/80">{(probability * 100).toFixed(1)}% de aprobar</div>
						{/if}
					</div>
				{:else}
					<CircleX class="w-8 h-8 text-base-100 shrink-0" />
					<div>
						<div class="text-2xl font-bold">No factible</div>
						{#if probability !== null}
							<div class="text-sm text-base-100/80">{(probability * 100).toFixed(1)}% de aprobar</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<BarChart3
			class="absolute -right-4 -bottom-4 text-base-100/10 rotate-12 pointer-events-none"
			size={120}
		/>
	</div>

	<div class="p-4 {feasible !== null && (constraintViolations.length > 0 || libertad.length > 0) ? 'space-y-3' : 'space-y-3 invisible'}">
		{#if constraintViolations.length > 0}
			<div class="space-y-1">
				<div class="flex items-center gap-1.5 text-xs font-medium text-error-100">
					<AlertTriangle class="w-3.5 h-3.5" />
					Restricciones incumplibles
				</div>
				<ul class="space-y-0.5">
					{#each constraintViolations as violation}
						<li class="text-xs text-content/50 ml-4 list-disc list-inside">{violation}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if libertad.length > 0}
			<div>
				<p class="text-xs font-medium text-content/50 mb-2">Holgura por restricción</p>
				<div class="space-y-1">
					{#each libertad as item}
						<div class="flex items-center gap-3 text-xs">
							<span class="text-content/40 font-mono w-12 text-right shrink-0">{item.slack > 0 ? '+' : ''}{item.slack.toFixed(1)}</span>
							<span class="text-content/50 truncate">{item.label ?? item.raw}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
