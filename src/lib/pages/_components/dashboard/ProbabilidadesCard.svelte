<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		CircleCheck,
		CircleX,
		HelpCircle,
		TrendingUp,
		GraduationCap,
		Award
	} from '@lucide/svelte';

	function escStatus(e: { lastResult?: { feasible: boolean; probability: number } | null }): {
		label: string; cls: string; Icon: typeof HelpCircle
	} {
		if (!e.lastResult) return { label: 'Sin datos', cls: 'text-content/40', Icon: HelpCircle };
		if (e.lastResult.feasible && e.lastResult.probability >= 0.9999) return { label: 'Garantizado', cls: 'text-success-100', Icon: Award };
		if (e.lastResult.feasible) return { label: 'Factible', cls: 'text-primary-100', Icon: CircleCheck };
		return { label: 'No factible', cls: 'text-error-100', Icon: CircleX };
	}

	const ramoEscenarios = $derived.by(() => {
		const result: Array<{
			id: string; name: string; color: string;
			escenarios: Array<{ id: string; label: string; cls: string; Icon: typeof HelpCircle; probability?: number }>
		}> = [];
		for (const [id, ramo] of semestre.ramos.list) {
			const escs = semestre.escenarios.byRamo(id);
			if (escs.length === 0) continue;
			result.push({
				id,
				name: ramo.name,
				color: ramo.color,
				escenarios: escs.map(e => ({
					id: e.id,
					probability: e.lastResult?.probability,
					...escStatus(e)
				}))
			});
		}
		return result;
	});

	const ramoProbBars = $derived.by(() => {
		return ramoEscenarios.map(ramo => {
			let best: { prob: number; label: string; barCls: string; pctText: string } =
				{ prob: 0, label: 'Sin datos', barCls: 'bg-base-300', pctText: '—' };

			for (const esc of ramo.escenarios) {
				const p = esc.probability ?? 0;
				if (esc.label === 'Garantizado') {
					best = { prob: 1, label: 'Garantizado', barCls: 'bg-success-100', pctText: '100%' };
					break;
				}
				if ((esc.label === 'Factible' || esc.label === 'No factible') && p >= best.prob) {
					best = {
						prob: p,
						label: esc.label,
						barCls: esc.label === 'Factible' ? 'bg-primary-100' : 'bg-error-100',
						pctText: (p * 100).toFixed(0) + '%'
					};
				}
			}

			return { id: ramo.id, name: ramo.name, color: ramo.color, ...best };
		}).sort((a, b) => b.prob - a.prob);
	});

	const escTotal = $derived(
		ramoEscenarios.reduce((sum, r) => sum + r.escenarios.length, 0)
	);
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm lg:self-start">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-1.5">
			<TrendingUp class="h-4 w-4 text-grades-100" />
			<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Probabilidades</h3>
		</div>
		<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md">{semestre.active}</span>
	</div>

	{#if escTotal > 0}
		<div class="space-y-1">
			{#each ramoProbBars as ramo (ramo.id)}
				<div class="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 hover:bg-base-200 transition-colors select-none!">
					<span class="w-3 h-3 rounded-full shrink-0" style="background-color: {ramo.color}"></span>
					<span class="text-xs lg:text-sm lg:w-20 font-bold text-content w-16 truncate shrink-0">{ramo.name}</span>
					<div class="flex-1 h-3 bg-base-300 rounded-full overflow-hidden">
						<div class="h-full {ramo.barCls} rounded-full transition-all" style="width: {Math.min(100, ramo.prob * 100)}%"></div>
					</div>
					<span class="text-xs font-bold tabular-nums {ramo.label === 'Sin datos' ? 'text-content/30' : 'text-content/60'} w-10 text-right">{ramo.pctText}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-6 text-content/40">
			<GraduationCap class="h-8 w-8 mb-2" />
			<p class="text-sm lg:text-base font-medium">Define tus ramos y crea escenarios</p>
			<p class="text-xs lg:text-sm mt-1">para ver el resumen aquí</p>
		</div>
	{/if}
</div>
