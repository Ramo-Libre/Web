<script lang="ts">
	import { untrack } from 'svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		Clock,
		CheckCircle2,
		Coffee,
		CircleAlert,
		Ellipsis,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';
	import { CATEGORY_ICONS } from '$lib/features/schedule-categories';

	let { now }: { now: Date } = $props();

	const currentMin = $derived(now.getHours() * 60 + now.getMinutes());
	const currentSec = $derived(now.getSeconds());

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	const todayStr = $derived(
		`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
	);

	const todayEvents = $derived(
		semestre.schedule
			.getByDate(todayStr)
			.filter((e) => e.startTime)
			.sort((a, b) => {
				const aRec = a.daysOfWeek && a.daysOfWeek.length > 0 ? 0 : 1;
				const bRec = b.daysOfWeek && b.daysOfWeek.length > 0 ? 0 : 1;
				if (aRec !== bRec) return aRec - bRec;
				return (a.startTime ?? '').localeCompare(b.startTime ?? '');
			})
	);

	const currentClass = $derived(
		todayEvents.find((c) => {
			const s = toMinutes(c.startTime!);
			const e = toMinutes(c.endTime ?? c.startTime!);
			return currentMin >= s && currentMin < e;
		})
	);
	const nextClass = $derived(todayEvents.find((c) => toMinutes(c.startTime!) > currentMin));
	const isDayFinished = $derived(
		todayEvents.length > 0 &&
			!currentClass &&
			!nextClass &&
			currentMin >=
				toMinutes(
					todayEvents[todayEvents.length - 1].endTime ??
						todayEvents[todayEvents.length - 1].startTime!
				)
	);

	const anchor = $derived(currentClass ?? nextClass);

	const clusters = $derived.by(() => {
		const sorted = [...todayEvents].sort((a, b) =>
			(a.startTime ?? '').localeCompare(b.startTime ?? '')
		);
		const groups: ScheduleEvent[][] = [];
		for (const ev of sorted) {
			const s = toMinutes(ev.startTime!);
			const group = groups.find(
				(g) => s < Math.max(...g.map((c) => toMinutes(c.endTime ?? c.startTime!)))
			);
			if (group) group.push(ev);
			else groups.push([ev]);
		}
		for (const g of groups) {
			g.sort((a, b) => {
				const aRec = a.daysOfWeek && a.daysOfWeek.length > 0 ? 0 : 1;
				const bRec = b.daysOfWeek && b.daysOfWeek.length > 0 ? 0 : 1;
				if (aRec !== bRec) return aRec - bRec;
				return (a.startTime ?? '').localeCompare(b.startTime ?? '');
			});
		}
		return groups;
	});

	const anchorCluster = $derived(
		anchor ? (clusters.find((g) => g.some((e) => e.id === anchor.id)) ?? [anchor]) : []
	);

	let slotIdx = $state(0);
	let touchX = 0;

	$effect(() => {
		const id = anchor?.id;
		if (!id) return;
		const cluster = untrack(() => anchorCluster);
		const idx = cluster.findIndex((e) => e.id === id);
		if (idx >= 0 && untrack(() => slotIdx) !== idx) slotIdx = idx;
	});

	const shown = $derived(anchorCluster[Math.min(slotIdx, anchorCluster.length - 1)] ?? anchor);

	function prevConflict() {
		if (anchorCluster.length < 2) return;
		slotIdx = (slotIdx - 1 + anchorCluster.length) % anchorCluster.length;
	}

	function nextConflict() {
		if (anchorCluster.length < 2) return;
		slotIdx = (slotIdx + 1) % anchorCluster.length;
	}

	function onTouchStart(e: TouchEvent) {
		touchX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		if (anchorCluster.length < 2) return;
		const dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 40) {
			if (dx < 0) nextConflict();
			else prevConflict();
		}
	}

	function progressFor(ev: ScheduleEvent): number {
		const total = toMinutes(ev.endTime ?? ev.startTime!) - toMinutes(ev.startTime!);
		const elapsed = currentMin - toMinutes(ev.startTime!);
		return Math.min(100, Math.max(0, (elapsed / total) * 100));
	}

	function countdownFor(ev: ScheduleEvent, ongoing: boolean): string {
		const remainingMins = ongoing
			? toMinutes(ev.endTime ?? ev.startTime!) - currentMin - 1
			: toMinutes(ev.startTime!) - currentMin - 1;
		const hrs = Math.floor(remainingMins / 60);
		const mins = remainingMins % 60;
		const secs = 59 - currentSec;
		const pad = (n: number) => n.toString().padStart(2, '0');
		if (hrs > 0) return `${hrs}h ${pad(mins)}m`;
		if (mins > 0) return `${mins}m ${pad(secs)}s`;
		return `${secs}s`;
	}

	function ramoColor(ramoId?: string): string {
		if (!ramoId) return 'var(--color-primary-100)';
		return semestre.ramos.get(ramoId)?.color ?? 'var(--color-primary-100)';
	}

	function ramoName(ramoId?: string): string {
		if (!ramoId) return '';
		return semestre.ramos.get(ramoId)?.name ?? '';
	}
</script>

<div
	class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm relative lg:col-span-2 overflow-hidden"
	role="group"
	aria-label="Próxima clase"
	ontouchstart={onTouchStart}
	ontouchend={onTouchEnd}
>
	<div class="flex items-center justify-between gap-2 mb-3">
		<div class="flex items-center gap-1.5">
			<Clock class="h-4 w-4 text-schedule-100" />
			<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">
				{currentClass ? 'Ahora Mismo' : nextClass ? 'Próxima Clase' : 'Estado'}
			</h3>
			{#if anchorCluster.length > 1}
				<span
					class="hidden sm:inline-flex pointer-events-none select-none items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-md bg-primary-400 text-primary-100 border border-primary-300"
				>
					<CircleAlert class="h-3 w-3" />
					{anchorCluster.length} topan
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			{#if anchorCluster.length > 1}
				<button
					type="button"
					onclick={prevConflict}
					class="p-1 rounded-md text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Horario anterior"
				>
					<ChevronLeft class="h-3.5 w-3.5" />
				</button>
				<span class="text-xs font-bold tabular-nums text-content/60 min-w-[2.5rem] text-center">
					{slotIdx + 1}/{anchorCluster.length}
				</span>
				<button
					type="button"
					onclick={nextConflict}
					class="p-1 rounded-md text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Siguiente horario"
				>
					<ChevronRight class="h-3.5 w-3.5" />
				</button>
			{/if}
			<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md">
				{now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
			</span>
		</div>
	</div>

	<div class="min-h-[100px] flex flex-col justify-center">
		{#if currentClass}
			{@const c = shown!}
			{@const CatIcon = CATEGORY_ICONS[c.category] ?? Ellipsis}
			{@const color = ramoColor(c.ramoId)}
			<div class="flex gap-3 items-stretch">
				<div class="w-1 rounded-full shrink-0" style="background-color: {color}"></div>
				<div class="flex-1 min-w-0">
					<h2
						class="text-lg lg:text-xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-1.5"
					>
						<CatIcon class="h-4 w-4 lg:h-5 lg:w-5 shrink-0" style="color: {color}" />
						{c.title || ramoName(c.ramoId) || 'Clase'}
					</h2>
					{#if c.description}
						<p class="text-sm text-content/60 mb-2 leading-snug">{c.description}</p>
					{/if}
					<div class="flex items-center gap-2 text-sm text-content/70 font-medium mb-2">
						<span
							class="flex items-center gap-1 bg-base-200 border border-base-300 px-1.5 py-0.5 rounded"
						>
							<Clock class="h-3 w-3" />
							{c.startTime} – {c.endTime}
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-success-100 bg-success-400 border border-success-300 rounded uppercase tracking-wide"
						>
							<div class="w-1.5 h-1.5 bg-success-100 rounded-full animate-pulse"></div>
							En curso
						</span>
						<span class="text-xs lg:text-sm font-bold text-content/60"
							>Quedan {countdownFor(c, true)}</span
						>
					</div>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-1 bg-base-300 rounded-b-xl">
				<div
					class="h-full transition-all duration-1000 ease-linear"
					style="width: {progressFor(c)}%; background-color: {color};"
				></div>
			</div>
		{:else if nextClass}
			{@const c = shown!}
			{@const CatIcon = CATEGORY_ICONS[c.category] ?? Ellipsis}
			{@const color = ramoColor(c.ramoId)}
			<div class="flex gap-3 items-stretch">
				<div class="w-1 rounded-full shrink-0" style="background-color: {color}"></div>
				<div class="flex-1 min-w-0">
					<h2
						class="text-lg lg:text-xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-1.5"
					>
						<CatIcon class="h-4 w-4 lg:h-5 lg:w-5 shrink-0" style="color: {color}" />
						{c.title || ramoName(c.ramoId) || 'Clase'}
					</h2>
					{#if c.description}
						<p class="text-sm text-content/60 mb-2 leading-snug">{c.description}</p>
					{/if}
					<div class="flex items-center gap-2 text-sm text-content/70 font-medium mb-2">
						<span
							class="flex items-center gap-1 bg-base-200 border border-base-300 px-1.5 py-0.5 rounded"
						>
							<Clock class="h-3 w-3" />
							Empieza a las {c.startTime}
						</span>
					</div>
					<span
						class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-primary-100 bg-primary-400 border border-primary-300 rounded uppercase tracking-wide"
					>
						Empieza en {countdownFor(c, false)}
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
