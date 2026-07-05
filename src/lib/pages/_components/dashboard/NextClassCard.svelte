<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		Clock,
		CheckCircle2,
		Coffee,
		FlaskConical,
		Users,
		Wrench,
		Presentation,
		CircleAlert,
		Book,
		Ellipsis
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

	let { now }: { now: Date } = $props();

	const currentDow = $derived(now.getDay() === 0 ? 7 : now.getDay());
	const currentMin = $derived(now.getHours() * 60 + now.getMinutes());
	const currentSec = $derived(now.getSeconds());

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

	const progressPct = $derived.by(() => {
		if (currentClass) {
			const total =
				toMinutes(currentClass.endTime ?? currentClass.startTime!) -
				toMinutes(currentClass.startTime!);
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
</script>

<div
	class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm relative overflow-hidden lg:col-span-2"
>
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
					<h2
						class="text-lg lg:text-xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-1.5"
					>
						<CatIcon class="h-4 w-4 lg:h-5 lg:w-5 shrink-0" style="color: {color}" />
						{c.title || ramoName(c.ramoId) || 'Clase'}
					</h2>
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
						<span class="text-xs lg:text-sm font-bold text-content/60">Quedan {countdownStr}</span>
					</div>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 h-1 bg-base-300">
				<div
					class="h-full transition-all duration-1000 ease-linear"
					style="width: {progressPct}%; background-color: {color};"
				></div>
			</div>
		{:else if nextClass}
			{@const c = nextClass}
			{@const CatIcon = categoryIcons[c.category] ?? Ellipsis}
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
