<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { goto } from '$app/navigation';
	import { getNow } from '$lib/utils/date';
	import {
		Clock,
		MapPin,
		CheckCircle2,
		Coffee,
		FlaskConical,
		Users,
		Wrench,
		CalendarDays,
		CircleCheck,
		CircleX,
		HelpCircle,
		TrendingUp,
		GraduationCap,
		Presentation,
		CircleAlert,
		Book,
		Ellipsis,
		Award,
		Activity
	} from '@lucide/svelte';

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation,
		urgent: CircleAlert,
		book: Book,
		lab: FlaskConical,
		assist: Users,
		taller: Wrench,
		event: Clock,
		other: Ellipsis
	};

	const categoryLabels: Record<string, string> = {
		book: 'Clase',
		lab: 'Lab',
		assist: 'Ayudantía',
		taller: 'Taller',
		exam: 'Examen'
	};

	let now = $state(getNow());
	$effect(() => {
		const i = setInterval(() => now = getNow(), 1000);
		return () => clearInterval(i);
	});

	const currentDow = $derived(now.getDay() === 0 ? 7 : now.getDay());
	const currentMin = $derived(now.getHours() * 60 + now.getMinutes());
	const currentSec = $derived(now.getSeconds());
	const todayStr = $derived(now.toISOString().slice(0, 10));
	const weekEndStr = $derived(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	const todayEvents = $derived(
		semestre.schedule
			.getByDayOfWeek(currentDow)
			.filter((e) => e.startTime)
			.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
	);

	const currentClass = $derived(
		todayEvents.find((c) => {
			const s = toMinutes(c.startTime!);
			const e = toMinutes(c.endTime ?? c.startTime!);
			return currentMin >= s && currentMin < e;
		})
	);
	const nextClass = $derived(
		todayEvents.find((c) => toMinutes(c.startTime!) > currentMin)
	);
	const isDayFinished = $derived(
		todayEvents.length > 0 && !currentClass && !nextClass &&
			currentMin >= toMinutes(todayEvents[todayEvents.length - 1].endTime ?? todayEvents[todayEvents.length - 1].startTime!)
	);

	const progressPct = $derived.by(() => {
		if (currentClass) {
			const total = toMinutes(currentClass.endTime ?? currentClass.startTime!) - toMinutes(currentClass.startTime!);
			const elapsed = currentMin - toMinutes(currentClass.startTime!);
			return Math.min(100, Math.max(0, (elapsed / total) * 100));
		}
		return 0;
	});

	const countdownStr = $derived.by(() => {
		let remainingMins;
		if (currentClass) {
			remainingMins = toMinutes(currentClass.endTime ?? currentClass.startTime!) - currentMin - 1;
		} else if (nextClass) {
			remainingMins = toMinutes(nextClass.startTime!) - currentMin - 1;
		} else return '';
		const hrs = Math.floor(remainingMins / 60);
		const mins = remainingMins % 60;
		const secs = 59 - currentSec;
		const pad = (n: number) => n.toString().padStart(2, '0');
		if (hrs > 0) return `${hrs}h ${pad(mins)}m`;
		if (mins > 0) return `${mins}m ${pad(secs)}s`;
		return `${secs}s`;
	});

	function ramoColor(ramoId?: string): string {
		if (!ramoId) return 'var(--color-primary-100)';
		return semestre.ramos.get(ramoId)?.color ?? 'var(--color-primary-100)';
	}

	function ramoName(ramoId?: string): string {
		if (!ramoId) return '';
		return semestre.ramos.get(ramoId)?.name ?? '';
	}

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

	const upcomingEvents = $derived(
		semestre.schedule
			.getOneOff()
			.filter((e) => e.date && e.date >= todayStr && e.date <= weekEndStr)
			.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
	);

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
		new Date(now.getFullYear(), now.getMonth()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
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

<div class="space-y-4">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<!-- NextClass -->
		<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm relative overflow-hidden lg:col-span-2">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-1.5">
					<Clock class="h-4 w-4 text-schedule-100" />
					<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">
						{currentClass ? 'Ahora Mismo' : nextClass ? 'Próxima Clase' : 'Estado'}
					</h3>
				</div>
				<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md">
					{now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
				</span>
			</div>

			<div class="min-h-[100px] flex flex-col justify-center">
				{#if currentClass}
					{@const c = currentClass}
					{@const CatIcon = categoryIcons[c.category] ?? Ellipsis}
					{@const color = ramoColor(c.ramoId)}
					<div class="flex gap-3 items-stretch">
						<div class="w-1 rounded-full shrink-0" style="background-color: {color}"></div>
						<div class="flex-1 min-w-0">
							<h2 class="text-lg lg:text-xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-1.5">
								<CatIcon class="h-4 w-4 lg:h-5 lg:w-5 shrink-0" style="color: {color}" />
								{c.title || ramoName(c.ramoId) || 'Clase'}
							</h2>
							<div class="flex items-center gap-2 text-sm text-content/70 font-medium mb-2">
								<span class="flex items-center gap-1 bg-base-200 border border-base-300 px-1.5 py-0.5 rounded">
									<Clock class="h-3 w-3" />
									{c.startTime} – {c.endTime}
								</span>
								{#if c.location}
									<span class="flex items-center gap-1 truncate">
										<MapPin class="h-3 w-3" />
										<span class="truncate">{c.location}</span>
									</span>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-success-100 bg-success-400 border border-success-300 rounded uppercase tracking-wide">
									<div class="w-1.5 h-1.5 bg-success-100 rounded-full animate-pulse"></div>
									En curso
								</span>
								<span class="text-xs lg:text-sm font-bold text-content/60">Quedan {countdownStr}</span>
							</div>
						</div>
					</div>
					<div class="absolute bottom-0 left-0 right-0 h-1 bg-base-300">
						<div class="h-full transition-all duration-1000 ease-linear" style="width: {progressPct}%; background-color: {color};"></div>
					</div>
				{:else if nextClass}
					{@const c = nextClass}
					{@const CatIcon = categoryIcons[c.category] ?? Ellipsis}
					{@const color = ramoColor(c.ramoId)}
					<div class="flex gap-3 items-stretch">
						<div class="w-1 rounded-full shrink-0" style="background-color: {color}"></div>
						<div class="flex-1 min-w-0">
							<h2 class="text-lg lg:text-xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-1.5">
								<CatIcon class="h-4 w-4 lg:h-5 lg:w-5 shrink-0" style="color: {color}" />
								{c.title || ramoName(c.ramoId) || 'Clase'}
							</h2>
							<div class="flex items-center gap-2 text-sm text-content/70 font-medium mb-2">
								<span class="flex items-center gap-1 bg-base-200 border border-base-300 px-1.5 py-0.5 rounded">
									<Clock class="h-3 w-3" />
									Empieza a las {c.startTime}
								</span>
								{#if c.location}
									<span class="flex items-center gap-1 truncate">
										<MapPin class="h-3 w-3" />
										<span class="truncate">{c.location}</span>
									</span>
								{/if}
							</div>
							<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-primary-100 bg-primary-400 border border-primary-300 rounded uppercase tracking-wide">
								Empieza en {countdownStr}
							</span>
						</div>
					</div>
				{:else if isDayFinished}
					<div class="flex flex-col items-center justify-center text-center text-content/60">
						<CheckCircle2 class="h-8 w-8 text-success-100 mb-2" />
						<h3 class="text-base lg:text-lg font-bold text-content">Día completado</h3>
						<p class="text-sm lg:text-base">No tienes más clases por hoy.</p>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center text-center text-content/60">
						<Coffee class="h-8 w-8 text-content/30 mb-2" />
						<h3 class="text-base lg:text-lg font-bold text-content">Día libre</h3>
						<p class="text-sm lg:text-base">No hay clases programadas para hoy.</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Load chart -->
		<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm lg:col-span-2">
			<div class="flex items-center gap-1.5 mb-3">
				<Activity class="h-4 w-4 text-schedule-100" />
				<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Carga Mensual</h3>
				<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md ml-auto">{monthLabel}</span>
			</div>

			{#if monthDays.length > 0}
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

				<div class="flex gap-2">
					<!-- Y axis -->
				<div class="w-[10px] shrink-0 bg-base-100 relative z-10">
					{#each yValues as yv}
						{@const yPct = (chartB - (yv / maxY) * chartH) / svgH * 100}
						<span class="absolute right-1 text-[9px] text-content/40 leading-none" style="top: {yPct}%; transform: translateY(-50%)">{yv}</span>
					{/each}
				</div>

					<!-- Chart -->
					<div class="overflow-x-auto min-w-0 flex-1" bind:this={chartScroll}>
						<svg viewBox="0 0 {svgW} {svgH}" class="block min-w-[1000px] lg:min-w-0 lg:w-full" preserveAspectRatio="xMidYMid meet">
							<!-- grid lines -->
							{#each yValues as yv}
								{@const y = chartB - (yv / maxY) * chartH}
								<line x1={chartL} x2={chartR} y1={y} y2={y} stroke="currentColor" class="text-base-300" stroke-width="0.5" stroke-dasharray="4 4" />
							{/each}
							<!-- X axis line -->
							<line x1={chartL} x2={chartR} y1={chartB} y2={chartB} stroke="currentColor" class="text-base-300" stroke-width="1" />

							<!-- area fill -->
							<polygon
								points="{[chartL, chartB].concat(monthDays.map((d, i) => {
									const x = i === 0 ? chartL : chartL + (i / (n - 1)) * chartW;
									const y = chartB - (d.count / maxY) * chartH;
									return [x, y];
								}).flat()).concat([n > 0 ? chartL + chartW : chartL, chartB]).join(' ')}"
								fill="var(--color-schedule-100)" fill-opacity="0.1"
							/>

							<!-- line -->
							<polyline
								fill="none"
								stroke="var(--color-schedule-100)"
								stroke-width="2"
								stroke-linejoin="round"
								stroke-linecap="round"
								points={monthDays.map((d, i) => {
									const x = i === 0 ? chartL : chartL + (i / (n - 1)) * chartW;
									const y = chartB - (d.count / maxY) * chartH;
									return `${x},${y}`;
								}).join(' ')}
							/>

							<!-- dots -->
							{#each monthDays as d, i}
								{@const x = i === 0 ? chartL + 2 : i === n - 1 ? chartR - 2 : chartL + (i / (n - 1)) * chartW}
								{@const y = chartB - (d.count / maxY) * chartH}
								<circle cx={x} cy={y} r="2.5" fill="var(--color-schedule-100)" />
							{/each}

							<!-- X labels -->
							{#each monthDays as d, i}
								{@const x = chartL + (i / (n - 1)) * chartW}
								{@const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
								<text x={x} y={svgH - 4} text-anchor={anchor} fill="currentColor" class="text-content/40" font-size="8">{d.day}</text>
							{/each}

							<!-- today indicator -->
							<line x1={todayX} x2={todayX} y1={chartT} y2={chartB} stroke="var(--color-red-500)" stroke-width="1.5" stroke-dasharray="4 3" />
						</svg>
					</div>
				</div>
			{/if}
		</div>

		<!-- Combined: Ramos + Escenarios -->
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

		<!-- UpcomingEvents -->
		<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm lg:self-start">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-1.5">
					<CalendarDays class="h-4 w-4 text-calendar-100" />
					<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Próximos Eventos</h3>
				</div>
			</div>

			{#if upcomingEvents.length > 0}
				<div class="space-y-1">
					{#each upcomingEvents as ev (ev.id)}
							{@const CatIcon = categoryIcons[ev.category] ?? Ellipsis}
						{@const color = ramoColor(ev.ramoId)}
						<button
							onclick={() => goto('/new/calendario#' + ev.id)}
							class="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left hover:bg-base-200 transition-colors cursor-pointer"
						>
							<div class="flex flex-col items-center min-w-[36px]">
								<span class="text-xs lg:text-sm font-bold text-content/40 uppercase">
									{ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }) : ''}
								</span>
								<span class="text-lg lg:text-xl font-bold text-content leading-tight">
									{ev.date ? new Date(ev.date + 'T12:00:00').getDate() : ''}
								</span>
							</div>
							<CatIcon class="h-4 w-4 lg:h-6 lg:w-6 shrink-0" style="color: {color}" />
							<div class="min-w-0 flex-1">
								<div class="text-sm lg:text-base font-bold text-content truncate">{ev.title || categoryLabels[ev.category] || 'Sin título'}</div>
								{#if ev.ramoId}
									<div class="text-xs lg:text-sm text-content/50">{ramoName(ev.ramoId)}</div>
								{/if}
							</div>
							{#if ev.startTime}
								<span class="text-xs lg:text-sm font-mono text-content/40 shrink-0">{ev.startTime}</span>
							{/if}
						</button>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-4 text-content/40">
					<CalendarDays class="h-6 w-6 mb-1.5" />
					<p class="text-sm lg:text-base">No hay eventos próximos</p>
				</div>
			{/if}
		</div>
	</div>
</div>
