<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { HorarioDay, HorarioType } from '$lib/state/horarios.svelte';
	import { BookOpen, FlaskConical, Users, Hammer, MapPin, CalendarX2 } from '@lucide/svelte';

	// --- MAPAS Y CONSTANTES ---
	const dayMap: Record<number, HorarioDay> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
	const dayNames: Record<HorarioDay, string> = {
		L: 'Lunes',
		M: 'Martes',
		X: 'Miércoles',
		J: 'Jueves',
		V: 'Viernes',
		S: 'Sábado'
	};
	const dayOrder: HorarioDay[] = ['L', 'M', 'X', 'J', 'V', 'S'];

	const typeIcons = {
		book: BookOpen,
		lab: FlaskConical,
		assist: Users,
		taller: Hammer
	};

	// --- ESTADO TEMPORAL ---
	let now = $state(new Date());
	$effect(() => {
		const interval = setInterval(() => (now = new Date()), 60000);
		return () => clearInterval(interval);
	});

	const currentDayId = $derived(dayMap[now.getDay()]);
	const currentMinutes = $derived(now.getHours() * 60 + now.getMinutes());

	// --- LÓGICA DE PROCESAMIENTO ---
	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	// Estructuramos y calculamos todo de forma reactiva
	const scheduleByDay = $derived.by(() => {
		const allHorarios = db.horarios.list.map(([, h]) => h);
		const ramosMap = db.ramos.map;

		return dayOrder.map((dayId) => {
			const daySchedules = allHorarios
				.filter((h) => h.day === dayId)
				.map((h) => {
					const ramo = ramosMap.get(h.ramoId ?? '');
					const startMin = toMinutes(h.start);
					const endMin = toMinutes(h.end);
					const isToday = dayId === currentDayId;

					return {
						...h,
						ramoNombre: ramo?.nombre ?? ramo?.nombre ?? 'Sin Ramo',
						ramoColor: ramo?.color ?? '#cbd5e1',
						duration: Math.round(((endMin - startMin) / 60) * 10) / 10,
						inProgress: isToday && currentMinutes >= startMin && currentMinutes <= endMin,
						isPast: isToday && currentMinutes > endMin,
						isUpcoming: isToday && currentMinutes < startMin && startMin - currentMinutes <= 30
					};
				})
				.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

			return {
				id: dayId,
				name: dayNames[dayId],
				isToday: dayId === currentDayId,
				schedules: daySchedules
			};
		});
	});

	function traducirTipoEvento(type: HorarioType): string {
		switch (type) {
			case 'book':
				return 'Clase';
			case 'lab':
				return 'Laboratorio';
			case 'assist':
				return 'Ayudantia';
			case 'taller':
				return 'Taller';
			default:
				return type;
		}
	}
</script>

<div class="space-y-6">
	{#each scheduleByDay as day (day.id)}
		{#if day.schedules.length > 0}
			<div
				class="bg-white rounded-xl border overflow-hidden transition-all {day.isToday
					? 'border-2 border-blue-300 shadow-md'
					: 'border-slate-200 shadow-sm'}"
			>
				<div
					class="px-5 py-3 border-b flex items-center justify-between {day.isToday
						? 'bg-blue-50/80 border-blue-100'
						: 'bg-slate-50 border-slate-100'}"
				>
					<h3
						class="text-base sm:text-lg font-bold {day.isToday
							? 'text-blue-900'
							: 'text-slate-800'}"
					>
						{day.name}
						{#if day.isToday}
							<span
								class="ml-2 text-[10px] sm:text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wide"
								>Hoy</span
							>
						{/if}
					</h3>
					{#if day.isToday}
						<div class="text-xs sm:text-sm text-blue-700 font-semibold">
							{now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
						</div>
					{/if}
				</div>

				<div class="divide-y divide-slate-100">
					{#each day.schedules as ev (ev.id)}
						{@const Icon = typeIcons[ev.type as keyof typeof typeIcons]}
						<div
							class="p-4 transition-all duration-200 relative group
                                {ev.inProgress
								? 'bg-green-50 border-l-4 border-green-500'
								: ev.isPast
									? 'bg-slate-50/50 opacity-60 grayscale-[0.2]'
									: ev.isUpcoming
										? 'bg-orange-50 border-l-4 border-orange-400'
										: 'hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-200'}"
						>
							<div class="flex flex-col space-y-2 sm:hidden">
								<div class="flex items-center justify-between">
									<div
										class="flex items-center space-x-1.5 font-bold {ev.inProgress
											? 'text-green-800'
											: ev.isPast
												? 'text-slate-400'
												: 'text-slate-800'}"
									>
										<span class="text-sm">{ev.start}</span>
										<span class="text-xs opacity-60">- {ev.end}</span>
									</div>

									<div class="flex items-center gap-2">
										{#if ev.inProgress}
											<span
												class="inline-flex items-center px-2 py-1 text-[10px] font-bold text-green-800 bg-green-200/60 rounded-full"
											>
												<div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
												<span>En progreso</span>
											</span>
										{:else if ev.isUpcoming}
											<span
												class="inline-flex items-center px-2 py-1 text-[10px] font-bold text-orange-800 bg-orange-100 rounded-full"
											>
												<div class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></div>
												<span>Próxima</span>
											</span>
										{:else if ev.isPast}
											<span
												class="inline-flex items-center px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-200/60 rounded-full"
											>
												✓ Finalizada
											</span>
										{/if}

										<div
											class="text-xs font-medium {ev.inProgress
												? 'text-green-600'
												: ev.isPast
													? 'text-slate-400'
													: 'text-slate-500'}"
										>
											{ev.duration}h
										</div>
									</div>
								</div>

								<div class="flex items-center space-x-2">
									<div
										class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
										style="background-color: {ev.ramoColor}"
									></div>
									<h4
										class="font-bold text-sm truncate {ev.inProgress
											? 'text-green-900'
											: ev.isPast
												? 'text-slate-500'
												: 'text-slate-800'}"
									>
										{ev.ramoNombre}
									</h4>
								</div>

								<div
									class="flex flex-wrap items-center gap-2 text-xs {ev.inProgress
										? 'text-green-700'
										: ev.isPast
											? 'text-slate-400'
											: 'text-slate-600'}"
								>
									<span class="flex items-center space-x-1 font-medium">
										<Icon class="w-3.5 h-3.5" />
										<span class="capitalize">{traducirTipoEvento(ev.type)}</span>
									</span>
								</div>

								<div
									class="flex flex-wrap items-center gap-3 text-xs mt-1 {ev.inProgress
										? 'text-green-700'
										: ev.isPast
											? 'text-slate-400'
											: 'text-slate-500'}"
								>
									{#if ev.location}
										<span class="flex items-center space-x-1">
											<MapPin class="w-3.5 h-3.5" />
											<span class="truncate max-w-[140px] font-medium">{ev.location}</span>
										</span>
									{/if}
								</div>
							</div>

							<div class="hidden sm:flex sm:items-center sm:space-x-4">
								<div class="text-center min-w-[85px] pt-1">
									<div
										class="text-sm font-black {ev.inProgress
											? 'text-green-800'
											: ev.isPast
												? 'text-slate-400'
												: 'text-slate-800'}"
									>
										{ev.start}
									</div>
									<div
										class="text-xs font-semibold {ev.inProgress
											? 'text-green-600'
											: ev.isPast
												? 'text-slate-300'
												: 'text-slate-400'}"
									>
										{ev.end}
									</div>
								</div>

								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2 mb-1.5">
										<div
											class="w-2.5 h-2.5 rounded-full shadow-sm"
											style="background-color: {ev.ramoColor}"
										></div>
										<h4
											class="font-bold text-sm truncate {ev.inProgress
												? 'text-green-900'
												: ev.isPast
													? 'text-slate-500'
													: 'text-slate-900'}"
										>
											{ev.ramoNombre}
										</h4>
									</div>

									<div
										class="flex items-center space-x-4 text-[11px] font-medium {ev.inProgress
											? 'text-green-700'
											: ev.isPast
												? 'text-slate-400'
												: 'text-slate-500'}"
									>
										<span class="flex items-center space-x-1 uppercase tracking-wide">
											<Icon class="w-3.5 h-3.5" />
											<span>{traducirTipoEvento(ev.type)}</span>
										</span>
										{#if ev.location}
											<span class="flex items-center space-x-1">
												<MapPin class="w-3.5 h-3.5" />
												<span class="truncate max-w-[150px]">{ev.location}</span>
											</span>
										{/if}
									</div>
								</div>

								<div class="flex items-center gap-3 pr-2">
									{#if ev.inProgress}
										<span
											class="inline-flex items-center px-2 py-1 text-xs font-bold text-green-800 bg-green-200/60 rounded-full"
										>
											<div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
											<span>En progreso</span>
										</span>
									{:else if ev.isUpcoming}
										<span
											class="inline-flex items-center px-2 py-1 text-xs font-bold text-orange-800 bg-orange-100 rounded-full"
										>
											<div class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5"></div>
											<span>Próxima</span>
										</span>
									{:else if ev.isPast}
										<span
											class="inline-flex items-center px-2 py-1 text-xs font-bold text-slate-500 bg-slate-200/60 rounded-full"
										>
											✓ Finalizada
										</span>
									{/if}

									<div
										class="text-right text-xs font-bold {ev.inProgress
											? 'text-green-600'
											: ev.isPast
												? 'text-slate-300'
												: 'text-slate-400'}"
									>
										{ev.duration}h
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
	{#if db.horarios.list.length === 0}
		<div class="text-center py-20 text-slate-400">
			<CalendarX2 class="w-12 h-12 mx-auto mb-3 opacity-20" />
			<p>No hay horarios agregados todavía.</p>
		</div>
	{/if}
</div>
