<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import type { ScheduleEvent, ScheduleCategory } from '$lib/features/schedule.svelte';
	import {
		Presentation, CircleAlert, Book, FlaskConical, Users, Wrench, Clock, Ellipsis,
		ChevronLeft, ChevronRight
	} from '@lucide/svelte';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import { getNow } from '$lib/utils/date';
	import HorarioBar from './HorarioBar.svelte';
	import RecurrenceModal from './RecurrenceModal.svelte';
	import EventModal from '../../calendario/_components/EventModal.svelte';

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation, urgent: CircleAlert, book: Book, lab: FlaskConical,
		assist: Users, taller: Wrench, event: Clock, other: Ellipsis
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

	const rangeHours: [number, number] = [7, 22];
	const PX_PER_MINUTE = 2;
	const TIME_GUTTER_PX = 60;
	const BOTTOM_PADDING_PX = 80;
	const boardHeight = (rangeHours[1] - rangeHours[0]) * 60 * PX_PER_MINUTE + BOTTOM_PADDING_PX;

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

	// --- NOW ---
	let now = $state(getNow());
	$effect(() => {
		const interval = setInterval(() => (now = getNow()), 60000);
		return () => clearInterval(interval);
	});

	const nowStr = $derived(now.toTimeString().slice(0, 5));
	const currentDowNum = $derived(now.getDay() === 0 ? 7 : now.getDay());
	const isWorkDay = $derived(currentDowNum >= 1 && currentDowNum <= 7);

	// Mobile navigation
	let selectedDayIdx = $state(currentDowNum - 1);
	const selectedDay = $derived(weekDays[selectedDayIdx]);

	const todayStr = $derived.by(() => {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	});

	const days = $derived.by(() => {
		const d = new Date(weekStart + 'T12:00:00');
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(d);
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
					h, m: mn,
					top: (h * 60 + mn - rangeHours[0] * 60) * PX_PER_MINUTE
				});
			}
		}
		return slots;
	});

	// --- EVENTS ---
	const recurringEvents = $derived(semestre.schedule.getRecurring());

	const oneOffInWeek = $derived.by(() => {
		if (!showCalendarEvents) return [];
		const weekDates = new Set(days.map(d => d.dateStr));
		return semestre.schedule.getOneOff().filter(ev => ev.date && weekDates.has(ev.date) && ev.startTime);
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
			const color = ev.ramoId ? semestre.ramos.get(ev.ramoId)?.color ?? '#64748b' : '#64748b';
			const ramoName = ev.ramoId ? semestre.ramos.get(ev.ramoId)?.name ?? 'Sin Ramo' : 'Sin Ramo';
			for (const dow of ev.daysOfWeek) {
				out[dow].push({
					id: ev.id + '-' + dow,
					startMin: toMinutes(ev.startTime),
					endMin: ev.endTime ? toMinutes(ev.endTime) : toMinutes(ev.startTime) + 60,
					color, ramoName,
					lane: 0, maxLanes: 1,
					event: ev,
					category: ev.category,
					title: ev.title,
					startTime: ev.startTime,
					endTime: ev.endTime
				});
			}
		}

		for (const ev of oneOffInWeek) {
			const day = days.find(d => d.dateStr === ev.date);
			if (!day || !ev.startTime) continue;
			const color = ev.ramoId ? semestre.ramos.get(ev.ramoId)?.color ?? '#64748b' : '#64748b';
			const ramoName = ev.ramoId ? semestre.ramos.get(ev.ramoId)?.name ?? 'Sin Ramo' : 'Sin Ramo';
			out[day.dow].push({
				id: ev.id,
				startMin: toMinutes(ev.startTime),
				endMin: ev.endTime ? toMinutes(ev.endTime) : toMinutes(ev.startTime) + 60,
				color, ramoName,
				lane: 0, maxLanes: 1,
				event: ev,
				category: ev.category,
				title: ev.title,
				startTime: ev.startTime,
				endTime: ev.endTime
			});
		}

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

	const currentTimeY = $derived((toMinutes(nowStr) - rangeHours[0] * 60) * PX_PER_MINUTE);

	function getEventStyle(ev: LaidEvent) {
		const top = (ev.startMin - rangeHours[0] * 60) * PX_PER_MINUTE;
		const height = (ev.endMin - ev.startMin) * PX_PER_MINUTE;
		const width = 100 / ev.maxLanes;
		const left = ev.lane * width;
		return `top: ${top}px; height: ${height}px; left: ${left}%; width: ${width}%;`;
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
		id?: string; title?: string; description?: string;
		category: ScheduleCategory; ramoId?: string;
		daysOfWeek: number[]; startTime: string; endTime: string;
		recurrenceStart?: string; recurrenceEnd?: string;
	}) {
		if (data.id) {
			const existing = semestre.schedule.get(data.id);
			if (existing) {
				semestre.schedule.update(data.id, { ...existing, ...data });
			}
		} else {
			semestre.schedule.add({
				category: data.category, title: data.title, description: data.description,
				ramoId: data.ramoId, daysOfWeek: data.daysOfWeek,
				startTime: data.startTime, endTime: data.endTime,
				recurrenceStart: data.recurrenceStart, recurrenceEnd: data.recurrenceEnd
			});
		}
		showModal = false;
	}

	function handleDelete(id: string) {
		semestre.schedule.remove(id);
		showModal = false;
	}

	function handleEventSave(data: {
		id?: string; title?: string; description?: string;
		category: ScheduleCategory; ramoId?: string;
		date?: string; startTime?: string; endTime?: string;
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

<div class="flex flex-col gap-4">
	<HorarioBar
		{weekStart}
		{showCalendarEvents}
		onToggleCalendar={() => (showCalendarEvents = !showCalendarEvents)}
		onPrevWeek={prevWeek}
		onNextWeek={nextWeek}
		onAddClass={() => openCreate()}
	/>

	<div class="flex flex-col bg-base-100 rounded-2xl border border-base-400 shadow-sm overflow-hidden">
		<!-- Mobile day nav -->
		<div class="lg:hidden flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
			<button
				class="p-2 hover:bg-base-300 rounded-full transition-colors cursor-pointer"
				onclick={() => (selectedDayIdx = (selectedDayIdx - 1 + 7) % 7)}
			>
				<ChevronLeft class="w-5 h-5 text-content/70" />
			</button>
			<div class="text-center">
				<span class="block font-bold text-content">{selectedDay.name} {days[selectedDayIdx]?.num}</span>
				<div class="flex gap-1.5 mt-1.5 justify-center">
					{#each weekDays as day, i (day.id)}
						<div
							class="w-1.5 h-1.5 rounded-full {i === selectedDayIdx
								? 'bg-schedule-100'
								: 'bg-base-400'}"
						></div>
					{/each}
				</div>
			</div>
			<button
				class="p-2 hover:bg-base-300 rounded-full transition-colors cursor-pointer"
				onclick={() => (selectedDayIdx = (selectedDayIdx + 1) % 7)}
			>
				<ChevronRight class="w-5 h-5 text-content/70" />
			</button>
		</div>

		<!-- Desktop header -->
		<div
			class="hidden lg:grid border-b border-base-300 bg-base-200"
			style="grid-template-columns: {TIME_GUTTER_PX}px 1fr;"
		>
			<div class="border-r border-base-300"></div>
			<div class="grid grid-cols-7">
				{#each weekDays as day, i (i)}
					{@const d = days[i]}
					<div
						class="h-10 flex flex-col items-center justify-center text-[10px] font-bold text-content/50 border-r border-base-300 last:border-r-0 leading-tight {d.dateStr ===
						todayStr
							? 'bg-schedule-400'
							: ''}"
					>
						<span class="uppercase tracking-widest">{day.short}</span>
						<span>{d.num}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Grid body -->
		<div class="flex-1 relative">
			<div class="grid" style="grid-template-columns: {TIME_GUTTER_PX}px 1fr;">
				<!-- Time gutter -->
				<div class="relative border-r border-base-300 bg-base-100" style="height: {boardHeight}px;">
					{#each timeSlots as slot (slot.label)}
						<div
							class="absolute right-2 -translate-y-1/2 text-[10px] font-bold {slot.m === 0
								? 'text-content/60'
								: 'text-content/30'}"
							style="top: {slot.top}px;"
						>
							{slot.label}
						</div>
					{/each}
				</div>

				<!-- Columns -->
				<div class="relative" style="height: {boardHeight}px;">
					<!-- Horizontal lines -->
					{#each timeSlots as slot (slot.label)}
						<div
							class="absolute w-full border-t {slot.m === 0
								? 'border-base-300'
								: 'border-base-200 border-dashed'}"
							style="top: {slot.top}px;"
						></div>
					{/each}

					<!-- Current time line -->
					{#if isWorkDay && currentTimeY > 0 && currentTimeY < boardHeight}
						<div
							class="absolute w-full border-t-2 border-error-300 z-20 pointer-events-none flex items-center"
							style="top: {currentTimeY}px;"
						>
							<div class="w-2 h-2 bg-error-100 rounded-full -ml-1 -translate-y-1/2 shadow-sm"></div>
						</div>
					{/if}

					<!-- Column backgrounds + event layers -->
					<div class="grid h-full grid-cols-1 lg:grid-cols-7">
						{#each weekDays as day, i (i)}
							<div
								class="relative border-r border-base-300 h-full transition-colors {i !==
								selectedDayIdx
									? 'hidden lg:block'
									: 'block'} {days[i].dateStr === todayStr ? 'bg-schedule-400' : ''}"
							>
								{#each laidByDay[day.dow] as ev (ev.id)}
									{@const Icon = categoryIcons[ev.category] ?? Ellipsis}
									<button
										onclick={() => openEdit(ev.event)}
										class="absolute p-2 rounded-lg border-l-4 shadow-sm overflow-hidden group transition-all hover:z-30 hover:shadow-md cursor-pointer"
										style="{getEventStyle(
											ev
										)} background-color: {ev.color}15; border-color: {ev.color};"
									>
										<div class="w-full h-full flex flex-col items-start gap-1 min-w-0 space-y-0.5">
											<div class="flex items-center gap-1.5 w-full min-w-0">
												<Icon class="w-3.5 h-3.5 shrink-0" style="color: {ev.color}" />
												<span class="text-[11px] font-bold leading-tight truncate text-content">
													{ev.title || ev.ramoName}
												</span>
											</div>
											<div class="flex items-center gap-1 text-[9px] text-content/50 leading-tight w-full">
												<span>{ev.startTime}{#if ev.endTime}–{ev.endTime}{/if}</span>
											</div>
											{#if ev.event.description}
												<div class="text-[10px] text-content/60 leading-tight font-semibold truncate">{ev.event.description}</div>
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
