<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { Star } from '@lucide/svelte';

	const total = $derived(semestre.todos.map.size);
	const completed = $derived(semestre.todos.getByCompleted(true).length);
	const pending = $derived(total - completed);
	const pct = $derived(total > 0 ? Math.round((completed / total) * 100) : 0);

	const ramos = $derived(semestre.ramos.list);

	interface RamoRow {
		name: string;
		color: string;
		done: number;
		total: number;
	}

	const rows = $derived.by(() => {
		const result: RamoRow[] = [];
		for (const [id, ramo] of ramos) {
			const all = semestre.todos.getByRamo(id);
			const done = all.filter((t) => t.completed).length;
			if (all.length > 0) {
				result.push({ name: ramo.name, color: ramo.color, done, total: all.length });
			}
		}
		const noRamo = semestre.todos.list.filter(([, t]) => !t.ramoId);
		if (noRamo.length > 0) {
			const done = noRamo.filter(([, t]) => t.completed).length;
			result.push({ name: 'Otros', color: 'var(--color-content)', done, total: noRamo.length });
		}
		return result;
	});

	const circumference = 2 * Math.PI * 36;
	const dashOffset = $derived(
		total > 0 ? circumference - (pct / 100) * circumference : circumference
	);
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-1.5">
			<Star class="h-4 w-4 text-todos-100" />
			<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Pendientes</h3>
		</div>
		{#if total > 0}
			<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md">
				{completed}/{total}
			</span>
		{/if}
	</div>

	{#if total === 0}
		<p class="text-sm text-content/30 text-center py-4">Sin pendientes</p>
	{:else}
		<div class="flex items-center gap-6 mb-4">
			<div class="relative shrink-0">
				<svg width="80" height="80" viewBox="0 0 80 80">
					<circle
						cx="40"
						cy="40"
						r="36"
						fill="none"
						stroke="var(--color-base-300)"
						stroke-width="6"
					/>
					<circle
						cx="40"
						cy="40"
						r="36"
						fill="none"
						stroke="var(--color-todos-100)"
						stroke-width="6"
						stroke-linecap="round"
						stroke-dasharray={circumference}
						stroke-dashoffset={dashOffset}
						transform="rotate(-90 40 40)"
						class="transition-all duration-500"
					/>
				</svg>
				<span
					class="absolute inset-0 flex items-center justify-center text-sm font-bold text-content"
				>
					{pct}%
				</span>
			</div>

			<div class="flex flex-col gap-1.5 min-w-0 flex-1">
				{#each rows as row (row.name)}
					<div class="flex items-center gap-2 min-w-0">
						<span class="w-2 h-2 rounded-full shrink-0" style="background: {row.color}"></span>
						<span class="text-xs text-content/60 truncate flex-1">{row.name}</span>
						<div class="w-16 h-1.5 bg-base-300 rounded-full overflow-hidden shrink-0">
							<div
								class="h-full rounded-full transition-all duration-300"
								style="width: {row.total > 0
									? (row.done / row.total) * 100
									: 0}%; background: {row.color}"
							></div>
						</div>
						<span class="text-xs text-content/40 shrink-0 tabular-nums">{row.done}/{row.total}</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
