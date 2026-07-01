<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import type { ScheduleEvent, ScheduleCategory } from '$lib/features/schedule.svelte';
	import {
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Clock,
		Ellipsis
	} from '@lucide/svelte';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import { getNow } from '$lib/utils/date';
	import HorarioBar from './HorarioBar.svelte';
	import RecurrenceModal from './RecurrenceModal.svelte';
	import EventModal from '../../calendario/_components/EventModal.svelte';

	type Orientation = 'normal' | 'rotated';

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

	const weekDays: { id: string; name: string; short: string; dow: number }[] = [
		{ id: 'L', name: 'Lunes', short: 'Lun', dow: 1 },
		{ id: 'M', name: 'Martes', short: 'Mar', dow: 2 },
		{ id: 'X', name: 'Miércoles', short: 'Mié', dow: 3 },
		{ id: 'J', name: 'Jueves', short: 'Jue', dow: 4 },
		{ id: 'V', name: 'Viernes', short: 'Vie', dow: 5 },
		{ id: 'S', name: 'Sábado', short: 'Sáb', dow: 6 },
		{ id: 'D', name: 'Domingo', short: 'Dom', dow: 7 }
	];

	const rangeHours: [number, number] = [7, 23];
	const totalRangeMinutes = (rangeHours[1] - rangeHours[0]) * 60;

	// --- RESPONSIVIDAD ---
	let windowWidth = $state(1024); // Valor por defecto
	const isMobile = $derived(windowWidth < 768);

	// --- Vista normal (días en X, tiempo en Y) ---
	// Si es móvil, los minutos ocupan menos píxeles de alto
	const PX_PER_MINUTE = $derived(isMobile ? 1.5 : 2);
	const TIME_GUTTER_PX = 50;
	const DAY_HEADER_H = 40;
	const BOTTOM_PADDING_PX = 80;
	const TOP_PADDING_PX = 20;

	// Sumamos el TOP_PADDING_PX al alto total
	const boardHeight = $derived(
		TOP_PADDING_PX + totalRangeMinutes * PX_PER_MINUTE + BOTTOM_PADDING_PX
	);
	const minBoardWidth = $derived(TIME_GUTTER_PX + 630);

	// --- Vista rotada (días en Y, tiempo en X) ---
	const DAY_LABEL_PX = 56;
	const HOUR_HEADER_H = 32;
	const ROTATED_PX_PER_MINUTE = $derived(isMobile ? 1.2 : 1.5);
	const rotatedTimelineWidth = $derived(totalRangeMinutes * ROTATED_PX_PER_MINUTE);

	// --- CAMBIOS PARA OCUPAR MÁS ESPACIO VERTICAL ---
	const LANE_HEIGHT = $derived(isMobile ? 64 : 76); // Más alto en escritorio para ver más info
	const LANE_GAP = 14; // Más separación entre eventos paralelos
	const ROW_VPAD = 20; // Más aire arriba y abajo en cada fila de día
	const MIN_ROW_HEIGHT = $derived(isMobile ? 70 : 96); // Altura mínima generosa para días sin eventos o con pocos

	function getMonday(date: Date): string {
		const d = new SvelteDate(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		d.setDate(diff);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	// --- STATE ---
	let weekStart = $state(getMonday(new Date()));
	let editingEvent = $state<ScheduleEvent | null>(null);
	let showModal = $state(false);
	let modalDay = $state<number | undefined>(undefined);
	let showCalendarEvents = $state(false);
	let editingOneOff = $state<ScheduleEvent | null>(null);
	let showEventModal = $state(false);
	let orientation = $state<Orientation>('normal');

	// --- NOW ---
	let now = $state(getNow());
	$effect(() => {
		const interval = setInterval(() => (now = getNow()), 60000);
		return () => clearInterval(interval);
	});

	const nowStr = $derived(now.toTimeString().slice(0, 5));
	const currentDowNum = $derived(now.getDay() === 0 ? 7 : now.getDay());
	const isWorkDay = $derived(currentDowNum >= 1 && currentDowNum <= 7);

	const todayStr = $derived.by(() => {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	});

	const days = $derived.by(() => {
		const d = new Date(weekStart + 'T12:00:00');
		return Array.from({ length: 7 }, (_, i) => {
			const date = new SvelteDate(d);
			date.setDate(date.getDate() + i);
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return {
				dow: i + 1,
				dateStr: `${y}-${m}-${day}`,
				name: weekDays[i].name,
				short: weekDays[i].short,
				num: date.getDate()
			};
		});
	});

	const timeSlots = $derived.by(() => {
		const slots: { label: string; h: number; m: number; top: number }[] = [];
		for (let h = rangeHours[0]; h <= rangeHours[1]; h++) {
			for (let mn = 0; mn < 60; mn += 30) {
				if (h === rangeHours[1] && mn > 0) break;
				slots.push({
					label: `${String(h).padStart(2, '0')}:${String(mn).padStart(2, '0')}`,
					h,
					m: mn,
					// Sumamos el TOP_PADDING_PX a la posición
					top: TOP_PADDING_PX + (h * 60 + mn - rangeHours[0] * 60) * PX_PER_MINUTE
				});
			}
		}
		return slots;
	});

	// Marcas de hora para el header de la vista rotada (solo horas en punto)
	const hourMarks = $derived.by(() => {
		const marks: { label: string; left: number }[] = [];
		for (let h = rangeHours[0]; h <= rangeHours[1]; h++) {
			marks.push({
				label: `${String(h).padStart(2, '0')}:00`,
				left: (h * 60 - rangeHours[0] * 60) * ROTATED_PX_PER_MINUTE
			});
		}
		return marks;
	});

	// --- EVENTS ---
	const recurringEvents = $derived(semestre.schedule.getRecurring());

	const oneOffInWeek = $derived.by(() => {
		if (!showCalendarEvents) return [];
		const weekDates = new Set(days.map((d) => d.dateStr));
		return semestre.schedule
			.getOneOff()
			.filter((ev) => ev.date && weekDates.has(ev.date) && ev.startTime);
	});

	interface LaidEvent {
		id: string;
		startMin: number;
		endMin: number;
		color: string;
		ramoName: string;
		lane: number;
		maxLanes: number;
		event: ScheduleEvent;
		category: string;
		title?: string;
		startTime?: string;
		endTime?: string;
	}

	const laidByDay = $derived.by(() => {
		const out: Record<number, LaidEvent[]> = {};
		for (const day of weekDays) out[day.dow] = [];

		for (const ev of recurringEvents) {
			if (!ev.startTime || !ev.daysOfWeek) continue;
			const color = ev.ramoId ? (semestre.ramos.get(ev.ramoId)?.color ?? '#64748b') : '#64748b';
			const ramoName = ev.ramoId ? (semestre.ramos.get(ev.ramoId)?.name ?? 'Sin Ramo') : 'Sin Ramo';
			for (const dow of ev.daysOfWeek) {
				out[dow].push({
					id: ev.id + '-' + dow,
					startMin: toMinutes(ev.startTime),
					endMin: ev.endTime ? toMinutes(ev.endTime) : toMinutes(ev.startTime) + 60,
					color,
					ramoName,
					lane: 0,
					maxLanes: 1,
					event: ev,
					category: ev.category,
					title: ev.title,
					startTime: ev.startTime,
					endTime: ev.endTime
				});
			}
		}

		for (const ev of oneOffInWeek) {
			const day = days.find((d) => d.dateStr === ev.date);
			if (!day || !ev.startTime) continue;
			const color = ev.ramoId ? (semestre.ramos.get(ev.ramoId)?.color ?? '#64748b') : '#64748b';
			const ramoName = ev.ramoId ? (semestre.ramos.get(ev.ramoId)?.name ?? 'Sin Ramo') : 'Sin Ramo';
			out[day.dow].push({
				id: ev.id,
				startMin: toMinutes(ev.startTime),
				endMin: ev.endTime ? toMinutes(ev.endTime) : toMinutes(ev.startTime) + 60,
				color,
				ramoName,
				lane: 0,
				maxLanes: 1,
				event: ev,
				category: ev.category,
				title: ev.title,
				startTime: ev.startTime,
				endTime: ev.endTime
			});
		}

		// Algoritmo de carriles, agnóstico de orientación: vista normal -> posición horizontal,
		// vista rotada -> posición vertical dentro de la fila del día.
		for (const day of weekDays) {
			const events = out[day.dow];
			events.sort((a, b) => a.startMin - b.startMin);
			const laid: LaidEvent[] = [];
			const active = new SvelteMap<number, LaidEvent>();
			let group: LaidEvent[] = [];
			let maxLanes = 0;

			const flushGroup = () => {
				for (const e of group) e.maxLanes = Math.max(1, maxLanes);
				group = [];
				maxLanes = 0;
			};

			for (const ev of events) {
				for (const [lane, act] of active.entries()) {
					if (act.endMin <= ev.startMin) active.delete(lane);
				}
				if (active.size === 0 && group.length > 0) flushGroup();
				let lane = 0;
				while (active.has(lane)) lane++;
				ev.lane = lane;
				ev.maxLanes = 1;
				active.set(lane, ev);
				group.push(ev);
				maxLanes = Math.max(maxLanes, active.size);
				laid.push(ev);
			}
			if (group.length > 0) flushGroup();
			out[day.dow] = laid;
		}
		return out;
	});

	// Cantidad máxima de carriles superpuestos por día (define la altura de cada fila en vista rotada)
	const dayLaneCounts = $derived.by(() => {
		const out: Record<number, number> = {};
		for (const day of weekDays) {
			out[day.dow] = laidByDay[day.dow].reduce((max, ev) => Math.max(max, ev.maxLanes), 0);
		}
		return out;
	});

	function rotatedRowHeight(dow: number): number {
		const lanes = dayLaneCounts[dow];
		if (lanes === 0) return MIN_ROW_HEIGHT;
		return Math.max(MIN_ROW_HEIGHT, lanes * LANE_HEIGHT + (lanes - 1) * LANE_GAP + ROW_VPAD * 2);
	}

	// Actualizamos el currentTimeY y los eventos para que bajen esos 20px también
	const currentTimeY = $derived(
		TOP_PADDING_PX + (toMinutes(nowStr) - rangeHours[0] * 60) * PX_PER_MINUTE
	);

	const currentTimeX = $derived((toMinutes(nowStr) - rangeHours[0] * 60) * ROTATED_PX_PER_MINUTE);

	function getEventStyle(ev: LaidEvent) {
		const top = TOP_PADDING_PX + (ev.startMin - rangeHours[0] * 60) * PX_PER_MINUTE;
		const height = (ev.endMin - ev.startMin) * PX_PER_MINUTE;
		const width = 100 / ev.maxLanes;
		const left = ev.lane * width;
		return `top: ${top}px; height: ${height}px; left: ${left}%; width: ${width}%;`;
	}

	function getRotatedEventStyle(ev: LaidEvent) {
		const left = (ev.startMin - rangeHours[0] * 60) * ROTATED_PX_PER_MINUTE;
		const width = Math.max((ev.endMin - ev.startMin) * ROTATED_PX_PER_MINUTE, 30);
		const top = ROW_VPAD + ev.lane * (LANE_HEIGHT + LANE_GAP);
		return `left: ${left}px; width: ${width}px; top: ${top}px; height: ${LANE_HEIGHT}px;`;
	}

	function prevWeek() {
		const d = new SvelteDate(weekStart + 'T12:00:00');
		d.setDate(d.getDate() - 7);
		weekStart = getMonday(d);
	}

	function nextWeek() {
		const d = new SvelteDate(weekStart + 'T12:00:00');
		d.setDate(d.getDate() + 7);
		weekStart = getMonday(d);
	}

	function openCreate(dayOfWeek?: number) {
		editingEvent = null;
		modalDay = dayOfWeek;
		showModal = true;
	}

	function openEdit(event: ScheduleEvent) {
		if (event.daysOfWeek && event.daysOfWeek.length > 0) {
			editingEvent = event;
			modalDay = undefined;
			showModal = true;
		} else {
			editingOneOff = event;
			showEventModal = true;
		}
	}

	function handleSave(data: {
		id?: string;
		title?: string;
		description?: string;
		category: ScheduleCategory;
		ramoId?: string;
		daysOfWeek: number[];
		startTime: string;
		endTime: string;
		recurrenceStart?: string;
		recurrenceEnd?: string;
	}) {
		if (data.id) {
			const existing = semestre.schedule.get(data.id);
			if (existing) {
				semestre.schedule.update(data.id, { ...existing, ...data });
			}
		} else {
			semestre.schedule.add({
				category: data.category,
				title: data.title,
				description: data.description,
				ramoId: data.ramoId,
				daysOfWeek: data.daysOfWeek,
				startTime: data.startTime,
				endTime: data.endTime,
				recurrenceStart: data.recurrenceStart,
				recurrenceEnd: data.recurrenceEnd
			});
		}
		showModal = false;
	}

	function handleDelete(id: string) {
		semestre.schedule.remove(id);
		showModal = false;
	}

	function handleEventSave(data: {
		id?: string;
		title?: string;
		description?: string;
		category: ScheduleCategory;
		ramoId?: string;
		date?: string;
		startTime?: string;
		endTime?: string;
	}) {
		if (data.id) {
			const existing = semestre.schedule.get(data.id);
			if (existing) {
				semestre.schedule.update(data.id, { ...existing, ...data });
			}
		}
		showEventModal = false;
	}

	function handleEventDelete(id: string) {
		semestre.schedule.remove(id);
		showEventModal = false;
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="flex flex-col gap-4">
	<HorarioBar
		{weekStart}
		{showCalendarEvents}
		{orientation}
		onToggleCalendar={() => (showCalendarEvents = !showCalendarEvents)}
		onPrevWeek={prevWeek}
		onNextWeek={nextWeek}
		onAddClass={() => openCreate()}
		onToggleOrientation={() => (orientation = orientation === 'normal' ? 'rotated' : 'normal')}
	/>

	<div
		class="flex flex-col bg-base-100 rounded-2xl border border-base-400 shadow-sm overflow-hidden"
	>
		{#if orientation === 'normal'}
			<!-- VISTA NORMAL: días en X, tiempo en Y. Header de días y gutter de horas quedan fijos al escrollear. -->
			<div class="overflow-x-auto">
				<div class="w-full" style="min-width: {minBoardWidth}px;">
					<!-- Header sticky (días) -->
					<div class="sticky top-0 z-30 flex border-b border-base-300 bg-base-200">
						<div
							class="sticky left-0 z-40 shrink-0 border-r border-base-300 bg-base-200"
							style="width: {TIME_GUTTER_PX}px; height: {DAY_HEADER_H}px;"
						></div>
						<div class="flex flex-1">
							{#each weekDays as day, i (i)}
								{@const d = days[i]}
								<div
									class="flex-1 min-w-0 flex flex-col items-center justify-center text-[9px] lg:text-[10px] font-bold text-content/50 border-r border-base-300 last:border-r-0 leading-tight {d.dateStr ===
									todayStr
										? 'bg-schedule-400'
										: ''}"
									style="height: {DAY_HEADER_H}px;"
								>
									<span class="uppercase tracking-widest">{day.short}</span>
									<span>{d.num}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Body -->
					<div class="flex relative" style="height: {boardHeight}px;">
						<!-- Gutter de horas, sticky a la izquierda -->
						<div
							class="sticky left-0 z-20 shrink-0 relative border-r border-base-300 bg-base-100"
							style="width: {TIME_GUTTER_PX}px; height: {boardHeight}px;"
						>
							{#each timeSlots as slot (slot.label)}
								<div
									class="absolute right-2 -translate-y-1/2 text-[9px] lg:text-[10px] font-bold {slot.m ===
									0
										? 'text-content/60'
										: 'text-content/30'}"
									style="top: {slot.top}px;"
								>
									{slot.label}
								</div>
							{/each}
						</div>

						<div class="relative flex-1" style="height: {boardHeight}px;">
							{#each timeSlots as slot (slot.label)}
								<div
									class="absolute w-full border-t {slot.m === 0
										? 'border-base-300'
										: 'border-base-200 border-dashed'}"
									style="top: {slot.top}px;"
								></div>
							{/each}

							{#if isWorkDay && currentTimeY > 0 && currentTimeY < boardHeight}
								<div
									class="absolute w-full border-t-2 border-error-300 z-10 pointer-events-none flex items-center"
									style="top: {currentTimeY}px;"
								>
									<div
										class="w-2 h-2 bg-error-100 rounded-full -ml-1 -translate-y-1/2 shadow-sm"
									></div>
								</div>
							{/if}

							<div class="flex h-full">
								{#each weekDays as day, i (i)}
									<div
										class="relative border-r border-base-300 h-full flex-1 min-w-0 {days[i]
											.dateStr === todayStr
											? 'bg-schedule-400'
											: ''}"
									>
										{#each laidByDay[day.dow] as ev (ev.id)}
											{@const Icon = categoryIcons[ev.category] ?? Ellipsis}
											<button
												onclick={() => openEdit(ev.event)}
												class="absolute rounded-md border-l-4 shadow-sm overflow-hidden group transition-all hover:z-30 hover:shadow-md cursor-pointer p-1 lg:p-2"
												style="{getEventStyle(
													ev
												)} background-color: {ev.color}15; border-color: {ev.color};"
											>
												<div
													class="w-full h-full flex flex-col items-start gap-0.5 lg:gap-1 min-w-0"
												>
													<div class="flex items-center gap-1 lg:gap-1.5 w-full min-w-0">
														<Icon
															class="w-3 h-3 lg:w-3.5 lg:h-3.5 shrink-0"
															style="color: {ev.color}"
														/>
														<span class="text-[11px] font-bold leading-tight truncate text-content">
															{ev.title || ev.ramoName}
														</span>
													</div>
													<div
														class="flex items-center gap-1 text-[9px] text-content/50 leading-tight w-full truncate"
													>
														<span
															>{ev.startTime}{#if ev.endTime}–{ev.endTime}{/if}</span
														>
													</div>
													{#if ev.event.description}
														<div
															class="text-[9px] lg:text-[10px] text-content/60 leading-tight font-semibold break-words whitespace-normal line-clamp-2"
														>
															{ev.event.description}
														</div>
													{/if}
												</div>
											</button>
										{/each}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- VISTA ROTADA: días en Y (filas), tiempo en X sin comprimir -> scroll horizontal.
			     Columna de días sticky a la izquierda, header de horas sticky arriba.
			     Filas más altas para mostrar título + horario en las tarjetas de evento. -->
			<div class="overflow-auto">
				<div style="width: {DAY_LABEL_PX + rotatedTimelineWidth}px;">
					<!-- Header sticky (horas) -->
					<div class="sticky top-0 z-30 flex border-b border-base-300 bg-base-200">
						<div
							class="sticky left-0 z-40 shrink-0 border-r border-base-300 bg-base-200"
							style="width: {DAY_LABEL_PX}px; height: {HOUR_HEADER_H}px;"
						></div>
						<div
							class="relative shrink-0"
							style="width: {rotatedTimelineWidth}px; height: {HOUR_HEADER_H}px;"
						>
							{#each hourMarks as mark (mark.label)}
								<span
									class="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-content/50 first:translate-x-0 last:-translate-x-full"
									style="left: {mark.left}px;"
								>
									{mark.label}
								</span>
							{/each}
						</div>
					</div>

					<!-- Filas por día -->
					<div class="flex flex-col divide-y divide-base-300 relative">
						{#if isWorkDay && currentTimeX > 0 && currentTimeX < rotatedTimelineWidth}
							<div
								class="absolute top-0 bottom-0 border-l-2 border-error-300 z-30 pointer-events-none flex flex-col items-center"
								style="left: {DAY_LABEL_PX + currentTimeX}px;"
							>
								<div
									class="absolute w-2 h-2 bg-error-100 rounded-full -translate-x-[1px] -top-1 shadow-sm"
								></div>
							</div>
						{/if}

						{#each days as day, i (day.dateStr)}
							<div class="flex">
								<!-- Etiqueta del día, sticky a la izquierda -->
								<div class="bg-base-200 sticky left-0 z-20 shrink-0">
									<div
										class="flex flex-col items-center justify-center border-r border-base-300 text-[10px] font-bold leading-tight {day.dateStr ===
										todayStr
											? 'bg-schedule-400 text-content'
											: 'bg-base-100 text-content/60'}"
										style="width: {DAY_LABEL_PX}px; height: {rotatedRowHeight(weekDays[i].dow)}px;"
									>
										<span class="uppercase tracking-widest">{weekDays[i].short}</span>
										<span class="text-content/40 text-[9px]">{day.num}</span>
									</div>
								</div>

								<div
									class="relative shrink-0 {day.dateStr === todayStr ? 'bg-schedule-400/40' : ''}"
									style="width: {rotatedTimelineWidth}px; height: {rotatedRowHeight(
										weekDays[i].dow
									)}px;"
								>
									<!-- Líneas verticales por hora -->
									{#each hourMarks as mark (mark.label)}
										<div
											class="absolute h-full border-l border-base-200"
											style="left: {mark.left}px;"
										></div>
									{/each}

									<!-- Línea de hora actual -->
									{#if day.dateStr === todayStr && isWorkDay && currentTimeX > 0 && currentTimeX < rotatedTimelineWidth}
										<div
											class="absolute h-full border-l-2 border-error-300 z-10 pointer-events-none"
											style="left: {currentTimeX}px;"
										></div>
									{/if}

									<!-- Eventos: tarjeta con título + horario, aprovechando el alto de fila -->
									{#each laidByDay[weekDays[i].dow] as ev (ev.id)}
										{@const Icon = categoryIcons[ev.category] ?? Ellipsis}
										<button
											onclick={() => openEdit(ev.event)}
											class="absolute rounded-lg border-l-4 shadow-sm overflow-hidden transition-all hover:z-30 hover:shadow-md cursor-pointer px-2 py-1.5 flex flex-col items-start justify-center gap-0.5 text-left"
											style="{getRotatedEventStyle(
												ev
											)} background-color: {ev.color}15; border-color: {ev.color};"
										>
											<div class="flex items-center gap-1.5 w-full min-w-0">
												<Icon class="w-3.5 h-3.5 shrink-0" style="color: {ev.color}" />
												<span class="text-[10px] font-bold leading-tight truncate text-content">
													{ev.title || ev.ramoName}
												</span>
											</div>
											<span class="text-[9px] text-content/50 leading-tight">
												{ev.startTime}{#if ev.endTime}–{ev.endTime}{/if}
											</span>
											{#if ev.event.description}
												<div
													class="text-[9px] lg:text-[10px] text-content/60 leading-tight font-semibold break-words whitespace-normal line-clamp-2"
												>
													{ev.event.description}
												</div>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if showModal}
	<RecurrenceModal
		event={editingEvent}
		prefillDay={modalDay}
		onClose={() => (showModal = false)}
		onSave={handleSave}
		onDelete={handleDelete}
	/>
{/if}

{#if showEventModal}
	<EventModal
		event={editingOneOff}
		onClose={() => (showEventModal = false)}
		onSave={handleEventSave}
		onDelete={handleEventDelete}
	/>
{/if}
