<script lang="ts">
	import { CalendarDays, ChevronLeft, ChevronRight, FileText, MapPin, Pencil, Trash2, CheckCircle2, Circle } from '@lucide/svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';

	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	const today = new Date();
	const todayKey = new Date().toISOString().slice(0, 10);
	let currentMonth = $state(new Date(today.getFullYear(), today.getMonth(), 1));
	let selectedDate = $state(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

	const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

	function matchesFilters(event: CalendarEvent) {
		if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) return false;
		if (selectedStatus === 'completed') return event.completed;
		if (selectedStatus === 'overdue') return !event.completed && event.dueDate < todayKey;
		if (selectedStatus === 'upcoming') return !event.completed && event.dueDate >= todayKey;
		return true;
	}

	const eventsByDate = $derived.by(() => {
		const map = new Map<string, CalendarEvent[]>();
		for (const [, event] of db.events.list) {
			if (!matchesFilters(event)) continue;
			const key = event.dueDate;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(event);
		}
		return map;
	});

	interface Props {
		onEditEvent?: (event: CalendarEvent) => void;
		selectedStatus?: StatusFilter;
		selectedRamo?: string;
	}

	let { onEditEvent, selectedStatus = 'all', selectedRamo = 'all' }: Props = $props();

	const ramosMap = $derived.by(() => new Map(db.ramos.list));

	function getRamoName(ramoId?: string) {
		if (!ramoId) return '—';
		const ramo = ramosMap.get(ramoId);
		return ramo?.nombre ?? '—';
	}

	function dateToKey(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	const monthLabel = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
		const label = formatter.format(currentMonth);
		return label.charAt(0).toUpperCase() + label.slice(1);
	});

	const days = $derived.by(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const startOffset = firstDay.getDay();
		const startDate = new Date(year, month, 1 - startOffset);

		const cells: Date[] = [];
		for (let i = 0; i < 42; i++) {
			const d = new Date(startDate);
			d.setDate(startDate.getDate() + i);
			cells.push(d);
		}
		return cells;
	});

	const selectedKey = $derived.by(() => dateToKey(selectedDate));
	const selectedEvents = $derived.by(() => eventsByDate.get(selectedKey) ?? []);

	function isSameDay(a: Date, b: Date) {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	function isCurrentMonth(d: Date) {
		return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
	}

	function goPrev() {
		const y = currentMonth.getFullYear();
		const m = currentMonth.getMonth();
		currentMonth = new Date(y, m - 1, 1);
	}

	function goNext() {
		const y = currentMonth.getFullYear();
		const m = currentMonth.getMonth();
		currentMonth = new Date(y, m + 1, 1);
	}

	function goToday() {
		currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	}

	function selectDate(d: Date) {
		selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	}

	function formatDayTitle(d: Date) {
		return new Intl.DateTimeFormat('es-CL', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(d);
	}

	function eventBadgeClasses(priority: CalendarEvent['priority']) {
		switch (priority) {
			case 'high':
				return 'bg-red-50 text-red-700 border border-red-200';
			case 'medium':
				return 'bg-amber-50 text-amber-700 border border-amber-200';
			case 'low':
			default:
				return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
		}
	}
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm sm:p-6 p-4 h-full">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h2 class="text-lg font-semibold text-slate-800">{monthLabel}</h2>
			<button
				class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
				onclick={goToday}
			>
				Hoy
			</button>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
				onclick={goPrev}
				aria-label="Mes anterior"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
				onclick={goNext}
				aria-label="Mes siguiente"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>

	<div class="mt-6 flex flex-col lg:flex-row gap-4">
		<div class="flex-1">
			<div class="grid grid-cols-7 gap-2 text-xs font-semibold text-slate-500">
				{#each weekDays as day (day)}
					<div class="text-center">{day}</div>
				{/each}
			</div>

			<div class="mt-2 grid grid-cols-7 gap-2">
				{#each days as day (dateToKey(day))}
					{@const dayKey = dateToKey(day)}
					{@const dayEvents = eventsByDate.get(dayKey) ?? []}
					<button
						onclick={() => selectDate(day)}
						class={`relative text-left rounded-lg border p-1 sm:p-2 min-h-[56px] sm:min-h-[90px] transition-colors cursor-pointer ${
							isSameDay(day, selectedDate)
								? 'border-blue-500'
								: 'border-slate-200 hover:bg-slate-50'
						} ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''} ${
							isCurrentMonth(day) ? 'text-slate-800' : 'text-slate-400'
						}`}
					>
						<div class="text-xs font-semibold">{day.getDate()}</div>
						<div class="mt-1 space-y-1">
							<div class="flex items-center gap-1 sm:hidden">
								{#if dayEvents.length === 0}
									<span class="text-[10px] text-slate-300">·</span>
								{:else}
									{#each dayEvents.slice(0, 3) as ev (ev.id)}
										<span
											class={`h-1.5 w-1.5 rounded-full ${eventBadgeClasses(ev.priority)} border`}
											title={ev.title}
										></span>
									{/each}
								{/if}
							</div>
							{#if dayEvents.length > 3}
								<span class="sm:hidden absolute top-1 right-1 text-[10px] text-slate-500">
									+{dayEvents.length - 3}
								</span>
							{/if}
							<div class="hidden sm:block space-y-1">
								{#each dayEvents.slice(0, 2) as ev (ev.id)}
									<div
										class={`truncate rounded-md px-2 py-1 text-[10px] font-semibold ${eventBadgeClasses(
											ev.priority
										)}`}
										title={ev.title}
									>
										{ev.title}
									</div>
								{/each}
								{#if dayEvents.length > 2}
									<div class="text-[10px] text-slate-500">+{dayEvents.length - 2} más</div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="lg:w-[320px] lg:border-l lg:border-slate-200 lg:pl-4 mt-4 lg:mt-0">
			<div class="text-sm font-semibold text-slate-700">
				Eventos - {formatDayTitle(selectedDate)}
			</div>
			{#if selectedEvents.length === 0}
				<div class="mt-6 flex flex-col items-center justify-center text-slate-500 text-sm">
					<CalendarDays class="w-8 h-8 text-slate-300 mb-2" />
					No hay eventos para este día
				</div>
			{:else}
				<ul class="mt-3 space-y-2">
					{#each selectedEvents as ev (ev.id)}
						<li class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<div class="font-semibold text-slate-800 truncate">{ev.title}</div>
									{#if ev.description}
										<div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
											<FileText class="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span class="truncate min-w-0 flex-1">{ev.description}</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<button
										class="cursor-pointer text-emerald-600 hover:text-emerald-700"
										aria-label={ev.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
										onclick={() => db.events.toggleCompleted(ev.id)}
									>
										{#if ev.completed}
											<CheckCircle2 class="w-4 h-4" />
										{:else}
											<Circle class="w-4 h-4" />
										{/if}
									</button>
									<button
										class="cursor-pointer text-blue-600 hover:text-blue-700"
										aria-label="Editar evento"
										onclick={() => onEditEvent?.(ev)}
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										class="cursor-pointer text-rose-600 hover:text-rose-700"
										aria-label="Borrar evento"
										onclick={() => db.events.remove(ev.id)}
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</div>

							<div class="mt-2 flex flex-wrap gap-2 text-xs">
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${eventBadgeClasses(
										ev.priority
									)}`}
								>
									{ev.priority === 'high' ? 'Alta' : ev.priority === 'medium' ? 'Media' : 'Baja'}
								</span>
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
										ev.completed
											? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
											: ev.dueDate < new Date().toISOString().slice(0, 10)
												? 'bg-red-50 text-red-700 border border-red-200'
												: 'bg-slate-50 text-slate-600 border border-slate-200'
									}`}
								>
									{ev.completed
										? 'Completado'
										: ev.dueDate < new Date().toISOString().slice(0, 10)
											? 'Vencido'
											: 'Pendiente'}
								</span>
								{#if ev.ramoId}
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-600">
										{getRamoName(ev.ramoId)}
									</span>
								{/if}
							</div>

							{#if ev.location}
								<div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
									<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
									<span class="truncate min-w-0 flex-1">{ev.location}</span>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>
