<script lang="ts">
	import {
		CalendarDays,
		ChevronLeft,
		ChevronRight,
		FileText,
		MapPin,
		Pencil,
		Trash2,
		CheckCircle2,
		Circle
	} from '@lucide/svelte';
	// Eliminada la importación de AlertDialog de Shadcn
	import { db } from '$lib/state/index.svelte';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import { getNow } from '$lib/utils/date';

	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	const today = getNow();
	const todayKey = getNow().toISOString().slice(0, 10);
	let currentMonth = new SvelteDate(today.getFullYear(), today.getMonth(), 1);
	let selectedDate = new SvelteDate(today.getFullYear(), today.getMonth(), today.getDate());

	const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

	function matchesFilters(event: CalendarEvent) {
		if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) return false;
		if (selectedStatus === 'completed') return event.completed;
		if (selectedStatus === 'overdue') return !event.completed && event.dueDate < todayKey;
		if (selectedStatus === 'upcoming') return !event.completed && event.dueDate >= todayKey;
		return true;
	}

	const eventsByDate = $derived.by(() => {
		const map = new SvelteMap<string, CalendarEvent[]>();
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
		focusEventId?: string;
	}

	let { onEditEvent, selectedStatus = 'all', selectedRamo = 'all', focusEventId }: Props = $props();

	let deleteConfirmEvent = $state<CalendarEvent | null>(null);
	let highlightEventId = $state<string | null>(null);
	let handledFocusEvent = $state(false);

	function openDeleteConfirm(event: CalendarEvent) {
		deleteConfirmEvent = event;
	}

	function cancelDelete() {
		deleteConfirmEvent = null;
	}

	function confirmDelete() {
		if (!deleteConfirmEvent) return;
		db.removeEvent(deleteConfirmEvent.id);
		deleteConfirmEvent = null;
	}

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

	function keyToDate(key: string): SvelteDate {
		const [y, m, d] = key.split('-').map(Number);
		return new SvelteDate(y, m - 1, d);
	}

	const monthLabel = $derived.by(() => {
		const formatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
		const label = formatter.format(currentMonth);
		return label.charAt(0).toUpperCase() + label.slice(1);
	});

	const days = $derived.by(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new SvelteDate(year, month, 1);
		const startOffset = firstDay.getDay();
		const startDate = new SvelteDate(year, month, 1 - startOffset);

		const cells: SvelteDate[] = [];
		for (let i = 0; i < 42; i++) {
			const d = new SvelteDate(startDate);
			d.setDate(startDate.getDate() + i);
			cells.push(d);
		}
		return cells;
	});

	const selectedKey = $derived.by(() => dateToKey(selectedDate));
	const selectedEvents = $derived.by(() => eventsByDate.get(selectedKey) ?? []);

	$effect(() => {
		if (handledFocusEvent || !focusEventId) return;
		const event = db.events.get(focusEventId);
		if (!event) {
			handledFocusEvent = true;
			return;
		}
		const focusDate = keyToDate(event.dueDate);
		selectedDate.setFullYear(focusDate.getFullYear());
		selectedDate.setMonth(focusDate.getMonth());
		selectedDate.setDate(focusDate.getDate());
		currentMonth.setFullYear(focusDate.getFullYear());
		currentMonth.setMonth(focusDate.getMonth(), 1);
		currentMonth.setDate(1);
		highlightEventId = event.id;
		handledFocusEvent = true;
	});

	function isSameDay(a: Date, b: Date) {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	function isCurrentMonth(d: Date) {
		return (
			d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
		);
	}

	function goPrev() {
		currentMonth.setMonth(currentMonth.getMonth() - 1, 1);
		currentMonth.setDate(1);
	}

	function goNext() {
		currentMonth.setMonth(currentMonth.getMonth() + 1, 1);
		currentMonth.setDate(1);
	}

	function goToday() {
		currentMonth.setFullYear(today.getFullYear());
		currentMonth.setMonth(today.getMonth(), 1);
		currentMonth.setDate(1);
		selectedDate.setFullYear(today.getFullYear());
		selectedDate.setMonth(today.getMonth());
		selectedDate.setDate(today.getDate());
	}

	function selectDate(d: Date) {
		selectedDate.setFullYear(d.getFullYear());
		selectedDate.setMonth(d.getMonth());
		selectedDate.setDate(d.getDate());
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
				return 'bg-error-400 text-error-100 border border-error-300';
			case 'medium':
				return 'bg-warning-400 text-warning-100 border border-warning-300';
			case 'low':
			default:
				return 'bg-success-400 text-success-100 border border-success-300';
		}
	}
</script>

<div class="bg-base-100 rounded-2xl border border-base-400 shadow-sm sm:p-6 p-4 h-full relative">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h2 class="text-lg font-semibold text-content">{monthLabel}</h2>
			<button
				class="px-3 py-1.5 rounded-lg border border-base-400 text-sm text-content/70 hover:bg-base-200 hover:text-content cursor-pointer transition-colors"
				onclick={goToday}
			>
				Hoy
			</button>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="p-2 rounded-lg border border-base-400 text-content/70 hover:bg-base-200 hover:text-content cursor-pointer transition-colors"
				onclick={goPrev}
				aria-label="Mes anterior"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				class="p-2 rounded-lg border border-base-400 text-content/70 hover:bg-base-200 hover:text-content cursor-pointer transition-colors"
				onclick={goNext}
				aria-label="Mes siguiente"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>

	<div class="mt-6 flex flex-col lg:flex-row gap-4">
		<div class="flex-1">
			<div class="grid grid-cols-7 gap-2 text-xs font-semibold text-content/50">
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
						class={`relative text-left rounded-lg border p-1 sm:p-2 min-h-14 sm:min-h-[90px] transition-colors cursor-pointer ${
							isSameDay(day, selectedDate)
								? 'border-calendar-100 ring-1 ring-calendar-100/50'
								: 'border-base-400 hover:bg-base-200'
						} ${isSameDay(day, getNow()) ? 'bg-calendar-400' : ''} ${
							isCurrentMonth(day) ? 'text-content' : 'text-content/40'
						}`}
					>
						<div class="text-xs font-semibold">{day.getDate()}</div>

						<div class="mt-1 space-y-1">
							<div class="flex items-center gap-1 sm:hidden">
								{#if dayEvents.length === 0}
									<span class="text-[10px] text-content/30">·</span>
								{:else}
									{#each dayEvents.slice(0, 3) as ev (ev.id)}
										<span
											class={`h-1.5 w-1.5 rounded-full ${eventBadgeClasses(ev.priority)}`}
											title={ev.title}
										></span>
									{/each}
								{/if}
							</div>

							{#if dayEvents.length > 3}
								<span class="sm:hidden absolute top-1 right-1 text-[10px] text-content/50">
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
									<div class="text-[10px] text-content/50">+{dayEvents.length - 2} más</div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="lg:w-[320px] lg:border-l lg:border-base-400 lg:pl-4 mt-4 lg:mt-0">
			<div class="text-sm font-semibold text-content/90">
				Eventos - {formatDayTitle(selectedDate)}
			</div>

			{#if selectedEvents.length === 0}
				<div class="mt-6 flex flex-col items-center justify-center text-content/50 text-sm">
					<CalendarDays class="w-8 h-8 text-content/30 mb-2" />
					No hay eventos para este día
				</div>
			{:else}
				<ul class="mt-3 space-y-2">
					{#each selectedEvents as ev (ev.id)}
						<li
							class={`rounded-lg border border-base-400 bg-base-100 p-3 shadow-sm transition-all ${
								ev.id === highlightEventId ? 'shine-effect ring-2 ring-calendar-100/50' : ''
							}`}
						>
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<div class="font-semibold text-content truncate">{ev.title}</div>
									{#if ev.description}
										<div class="mt-1 flex items-center gap-2 text-xs text-content/60">
											<FileText class="w-3.5 h-3.5 text-content/40 shrink-0" />
											<span class="truncate min-w-0 flex-1">{ev.description}</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<button
										class="cursor-pointer text-success-100 hover:opacity-80 transition-opacity"
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
										class="cursor-pointer text-calendar-100 hover:opacity-80 transition-opacity"
										aria-label="Editar evento"
										onclick={() => onEditEvent?.(ev)}
									>
										<Pencil class="w-4 h-4" />
									</button>

									<button
										class="cursor-pointer text-error-100 hover:opacity-80 transition-opacity"
										aria-label="Borrar evento"
										onclick={() => openDeleteConfirm(ev)}
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
											? 'bg-success-400 text-success-100 border border-success-300'
											: ev.dueDate < getNow().toISOString().slice(0, 10)
												? 'bg-error-400 text-error-100 border border-error-300'
												: 'bg-base-300 text-content/70 border border-base-400'
									}`}
								>
									{ev.completed
										? 'Completado'
										: ev.dueDate < getNow().toISOString().slice(0, 10)
											? 'Vencido'
											: 'Pendiente'}
								</span>

								{#if ev.ramoId}
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-base-200 border border-base-400 text-content/70"
									>
										{getRamoName(ev.ramoId)}
									</span>
								{/if}
							</div>

							{#if ev.location}
								<div class="mt-2 flex items-center gap-2 text-xs text-content/60">
									<MapPin class="w-3.5 h-3.5 text-content/40 shrink-0" />
									<span class="truncate min-w-0 flex-1">{ev.location}</span>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	{#if deleteConfirmEvent !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<button
				class="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm cursor-pointer transition-all"
				aria-label="Cerrar"
				onclick={cancelDelete}
			></button>

			<div
				class="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
			>
				<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
				<p class="text-sm text-content/70 mb-6">
					Esta acción eliminará permanentemente el evento
					<strong
						class="font-semibold text-content inline-block max-w-[20ch] align-bottom truncate"
					>
						"{deleteConfirmEvent.title}"
					</strong>. Esta acción no se puede deshacer.
				</p>

				<div class="flex justify-end gap-3">
					<button
						onclick={cancelDelete}
						class="px-4 py-2 rounded-lg border border-base-400 text-content/70 text-sm font-semibold hover:bg-base-200 hover:text-content transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						onclick={confirmDelete}
						class="px-4 py-2 rounded-lg bg-error-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
					>
						Eliminar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
