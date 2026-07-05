<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { Activity } from '@lucide/svelte';

	let { now }: { now: Date } = $props();

	const monthDays = $derived.by(() => {
		const y = now.getFullYear();
		const m = now.getMonth() + 1;
		const total = new Date(y, m, 0).getDate();
		const days: { date: string; day: number; count: number }[] = [];
		for (let d = 1; d <= total; d++) {
			const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			days.push({ date: dateStr, day: d, count: semestre.schedule.getByDate(dateStr).length });
		}
		return days;
	});

	const maxLoad = $derived(Math.max(1, ...monthDays.map((d) => d.count)));

	const monthLabel = $derived(
		new Date(now.getFullYear(), now.getMonth()).toLocaleDateString('es-ES', {
			month: 'long',
			year: 'numeric'
		})
	);

	const todayIdx = $derived(now.getDate() - 1);
	const todayX = $derived.by(() => {
		const n = monthDays.length;
		if (n === 0) return 0;
		const chartL = 10;
		const chartR = 1000 - 5;
		const chartW = chartR - chartL;
		return todayIdx === 0 ? chartL : chartL + (todayIdx / (n - 1)) * chartW;
	});

	let chartScroll: HTMLDivElement | undefined = $state();
	let chartMonthKey = '';
	$effect(() => {
		const el = chartScroll;
		const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
		if (el && monthDays.length > 0 && monthKey !== chartMonthKey) {
			chartMonthKey = monthKey;
			requestAnimationFrame(() => {
				const target = todayX - el.clientWidth / 2;
				el.scrollLeft = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth));
			});
		}
	});
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm lg:col-span-2">
	<div class="flex items-center gap-1.5 mb-3">
		<Activity class="h-4 w-4 text-schedule-100" />
		<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Carga Mensual</h3>
		<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md ml-auto"
			>{monthLabel}</span
		>
	</div>

	{#if monthDays.length > 0}
		{@const gap = 2}
		{@const padL = 10}
		{@const padR = 5}
		{@const padT = 8}
		{@const padB = 22}
		{@const svgW = 1000}
		{@const svgH = 160}
		{@const chartL = padL}
		{@const chartR = svgW - padR}
		{@const chartT = padT}
		{@const chartB = svgH - padB}
		{@const chartW = chartR - chartL}
		{@const chartH = chartB - chartT}
		{@const n = monthDays.length}
		{@const maxY = maxLoad}
		{@const yValues = Array.from({ length: maxY + 1 }, (_, i) => i)}

		<div class="flex gap-{gap}">
			<div class="w-[10px] shrink-0 bg-base-100 relative z-10">
				{#each yValues as yv}
					{@const yPct = ((chartB - (yv / maxY) * chartH) / svgH) * 100}
					<span
						class="absolute right-1 text-[9px] text-content/40 leading-none"
						style="top: {yPct}%; transform: translateY(-50%)">{yv}</span
					>
				{/each}
			</div>

			<div class="overflow-x-auto min-w-0 flex-1" bind:this={chartScroll}>
				<svg
					viewBox="0 0 {svgW} {svgH}"
					class="block min-w-[1000px] lg:min-w-0 lg:w-full"
					preserveAspectRatio="xMidYMid meet"
				>
					{#each yValues as yv}
						{@const y = chartB - (yv / maxY) * chartH}
						<line
							x1={chartL}
							x2={chartR}
							y1={y}
							y2={y}
							stroke="currentColor"
							class="text-base-300"
							stroke-width="0.5"
							stroke-dasharray="4 4"
						/>
					{/each}
					<line
						x1={chartL}
						x2={chartR}
						y1={chartB}
						y2={chartB}
						stroke="currentColor"
						class="text-base-300"
						stroke-width="1"
					/>

					<polygon
						points={[chartL, chartB]
							.concat(
								monthDays
									.map((d, i) => {
										const x = i === 0 ? chartL : chartL + (i / (n - 1)) * chartW;
										const y = chartB - (d.count / maxY) * chartH;
										return [x, y];
									})
									.flat()
							)
							.concat([n > 0 ? chartL + chartW : chartL, chartB])
							.join(' ')}
						fill="var(--color-schedule-100)"
						fill-opacity="0.1"
					/>

					<polyline
						fill="none"
						stroke="var(--color-schedule-100)"
						stroke-width="2"
						stroke-linejoin="round"
						stroke-linecap="round"
						points={monthDays
							.map((d, i) => {
								const x = i === 0 ? chartL : chartL + (i / (n - 1)) * chartW;
								const y = chartB - (d.count / maxY) * chartH;
								return `${x},${y}`;
							})
							.join(' ')}
					/>

					{#each monthDays as d, i}
						{@const x =
							i === 0 ? chartL + 2 : i === n - 1 ? chartR - 2 : chartL + (i / (n - 1)) * chartW}
						{@const y = chartB - (d.count / maxY) * chartH}
						<circle cx={x} cy={y} r="2.5" fill="var(--color-schedule-100)" />
					{/each}

					{#each monthDays as d, i}
						{@const x = chartL + (i / (n - 1)) * chartW}
						{@const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
						<text
							{x}
							y={svgH - 4}
							text-anchor={anchor}
							fill="currentColor"
							class="text-content/40"
							font-size="8">{d.day}</text
						>
					{/each}

					<line
						x1={todayX}
						x2={todayX}
						y1={chartT}
						y2={chartB}
						stroke="var(--color-red-500)"
						stroke-width="1.5"
						stroke-dasharray="4 3"
					/>
				</svg>
			</div>
		</div>
	{/if}
</div>
