<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { HorarioDay } from '$lib/state/horarios.svelte';
	import {
		Clock,
		MapPin,
		CheckCircle2,
		Coffee,
		BookOpen,
		FlaskConical,
		Users,
		Hammer
	} from '@lucide/svelte';
	import { getNow } from '$lib/utils/date';

	// --- MAPAS Y CONSTANTES ---
	const dayMap: Record<number, HorarioDay> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

	const typeIcons = {
		book: BookOpen,
		lab: FlaskConical,
		assist: Users,
		taller: Hammer
	};

	// --- ESTADO TEMPORAL ---
	let now = $state(getNow());
	$effect(() => {
		const interval = setInterval(() => (now = getNow()), 1000);
		return () => clearInterval(interval);
	});

	const currentDayId = $derived(dayMap[now.getDay()]);
	const currentMin = $derived(now.getHours() * 60 + now.getMinutes());
	const currentSec = $derived(now.getSeconds());

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	// --- PROCESAMIENTO DE CLASES ---
	const todayClasses = $derived.by(() => {
		const allHorarios = db.horarios.list.map(([, h]) => h);
		const ramosMap = db.ramos.map;

		return allHorarios
			.filter((h) => h.day === currentDayId)
			.map((h) => {
				const ramo = ramosMap.get(h.ramoId ?? '');
				return {
					...h,
					ramoNombre: ramo?.nombre ?? 'Sin Ramo',
					color: ramo?.color ?? '#cbd5e1', // Nota: Si este color viene duro de DB, mantén la variable de estilo en el HTML
					startMin: toMinutes(h.start),
					endMin: toMinutes(h.end)
				};
			})
			.sort((a, b) => a.startMin - b.startMin);
	});

	// Estados derivados
	const currentClass = $derived(
		todayClasses.find((c) => currentMin >= c.startMin && currentMin < c.endMin)
	);
	const nextClasses = $derived(todayClasses.filter((c) => c.startMin > currentMin));
	const nextClass = $derived(nextClasses.length > 0 ? nextClasses[0] : null);
	const isDayFinished = $derived(
		todayClasses.length > 0 &&
			!currentClass &&
			!nextClass &&
			currentMin >= todayClasses[todayClasses.length - 1].endMin
	);

	// Cálculos de progreso y tiempo
	const progressPct = $derived.by(() => {
		if (currentClass) {
			const totalMins = currentClass.endMin - currentClass.startMin;
			const elapsedMins = currentMin - currentClass.startMin;
			return Math.min(100, Math.max(0, (elapsedMins / totalMins) * 100));
		}
		return 0;
	});

	const countdownStr = $derived.by(() => {
		let remainingMins = 0;
		if (currentClass) {
			remainingMins = currentClass.endMin - currentMin - 1;
		} else if (nextClass) {
			remainingMins = nextClass.startMin - currentMin - 1;
		} else {
			return '';
		}

		const hrs = Math.floor(remainingMins / 60);
		const mins = remainingMins % 60;
		const secs = 59 - currentSec;

		const pad = (n: number) => n.toString().padStart(2, '0');

		if (hrs > 0) return `${hrs}h ${pad(mins)}m`;
		if (mins > 0) return `${mins}m ${pad(secs)}s`;
		return `${secs}s`;
	});
</script>

<div
	class="bg-base-100 rounded-2xl p-5 border border-base-400 shadow-sm relative overflow-hidden flex flex-col group"
>
	<div class="flex items-center justify-between mb-auto z-10">
		<div class="flex items-center gap-2">
			<Clock class="w-5 h-5 text-schedule-100" />
			<h3 class="text-sm font-bold text-content/50 uppercase tracking-widest">
				{currentClass ? 'Ahora Mismo' : nextClass ? 'Próxima Clase' : 'Estado'}
			</h3>
		</div>
		<div class="text-xs font-bold text-content/60 bg-base-300 px-2.5 py-1 rounded-lg">
			{now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
		</div>
	</div>

	<div class="flex-1 flex flex-col justify-center relative z-10 mt-4">
		{#if currentClass}
			{@const CurrentIcon = typeIcons[currentClass.type as keyof typeof typeIcons]}
			<div class="flex gap-4 items-stretch">
				<div
					class="w-1.5 rounded-full shrink-0"
					style="background-color: {currentClass.color}"
				></div>

				<div class="flex-1 min-w-0 flex flex-col justify-center">
					<h2
						class="text-2xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-2"
					>
						{#if CurrentIcon}
							<CurrentIcon class="w-5 h-5 shrink-0" style="color: {currentClass.color}" />
						{/if}
						{currentClass.ramoNombre}
					</h2>

					<div class="flex items-center gap-3 text-sm text-content/70 font-medium mb-3">
						<span
							class="flex items-center gap-1 bg-base-200 border border-base-300 px-2 py-0.5 rounded-md"
						>
							<Clock class="w-3.5 h-3.5" />
							{currentClass.start} - {currentClass.end}
						</span>
						{#if currentClass.location}
							<span class="flex items-center gap-1 truncate">
								<MapPin class="w-3.5 h-3.5" />
								<span class="truncate">{currentClass.location}</span>
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-success-100 bg-success-400 border border-success-300 rounded-lg uppercase tracking-wide"
						>
							<div class="w-1.5 h-1.5 bg-success-100 rounded-full animate-pulse"></div>
							En curso
						</span>
						<span class="text-xs font-bold text-content/60">
							Quedan {countdownStr}
						</span>
					</div>
				</div>
			</div>
		{:else if nextClass}
			{@const NextIcon = typeIcons[nextClass.type as keyof typeof typeIcons]}
			<div class="flex gap-4 items-stretch">
				<div class="w-1.5 rounded-full shrink-0" style="background-color: {nextClass.color}"></div>

				<div class="flex-1 min-w-0 flex flex-col justify-center">
					<h2
						class="text-2xl font-bold text-content leading-tight mb-1 truncate flex items-center gap-2"
					>
						{#if NextIcon}
							<NextIcon class="w-5 h-5 shrink-0" style="color: {nextClass.color}" />
						{/if}
						{nextClass.ramoNombre}
					</h2>

					<div class="flex items-center gap-3 text-sm text-content/70 font-medium mb-3">
						<span
							class="flex items-center gap-1 bg-base-200 border border-base-300 px-2 py-0.5 rounded-md"
						>
							<Clock class="w-3.5 h-3.5" />
							Empieza a las {nextClass.start}
						</span>
						{#if nextClass.location}
							<span class="flex items-center gap-1 truncate">
								<MapPin class="w-3.5 h-3.5" />
								<span class="truncate">{nextClass.location}</span>
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-primary-100 bg-primary-400 border border-primary-300 rounded-lg uppercase tracking-wide"
						>
							Empieza en {countdownStr}
						</span>
					</div>
				</div>
			</div>
		{:else if isDayFinished}
			<div class="flex flex-col items-center justify-center text-center text-content/60">
				<CheckCircle2 class="w-12 h-12 text-success-100 mb-3" />
				<h3 class="text-lg font-bold text-content">¡Día completado!</h3>
				<p class="text-sm">No tienes más clases por hoy.</p>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center text-center text-content/60">
				<Coffee class="w-12 h-12 text-content/30 mb-3" />
				<h3 class="text-lg font-bold text-content">Día libre</h3>
				<p class="text-sm">No hay clases programadas para hoy.</p>
			</div>
		{/if}
	</div>

	{#if currentClass}
		<div class="absolute bottom-0 left-0 right-0 h-1.5 bg-base-300">
			<div
				class="h-full transition-all duration-1000 ease-linear"
				style="width: {progressPct}%; background-color: {currentClass.color};"
			></div>
		</div>

		<div
			class="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.03] transition-colors duration-1000 blur-3xl"
			style="background-color: {currentClass.color};"
		></div>
	{/if}
</div>
