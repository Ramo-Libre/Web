<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import {
		CalendarDays,
		MapPin,
		FileText,
		Pencil,
		Trash2,
		CheckCircle2,
		Circle,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';
	import { getNow } from '$lib/utils/date';

	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	interface Props {
		onEditEvent?: (event: CalendarEvent) => void;
		selectedStatus?: StatusFilter;
		selectedRamo?: string;
		focusEventId?: string;
	}

	let { onEditEvent, selectedStatus = 'all', selectedRamo = 'all', focusEventId }: Props = $props();

	let deleteConfirmEvent = $state<CalendarEvent | null>(null);
	let handledFocusEvent = $state(false);
	let handledScroll = $state(false);
	let isDesktop = $state(false);

	onMount(() => {
		if (typeof window === 'undefined') return;
		const media = window.matchMedia('(min-width: 1024px)');
		const update = (e: MediaQueryListEvent) => {
			isDesktop = e.matches;
		};
		isDesktop = media.matches;
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});

	$effect(() => {
		if (handledFocusEvent || !focusEventId) return;
		const event = db.events.get(focusEventId);
		if (!event) {
			handledFocusEvent = true;
			return;
		}
		const focusDate = new SvelteDate(`${event.dueDate}T00:00:00`);
		anchorDate.setFullYear(focusDate.getFullYear());
		anchorDate.setMonth(focusDate.getMonth(), 1);
		anchorDate.setDate(focusDate.getDate());
		handledFocusEvent = true;
	});

	$effect(() => {
		if (!focusEventId || handledScroll) return;
		if (typeof document === 'undefined') return;
		tick().then(() => {
			const el = document.querySelector(`.timeline-event[data-event-id="${focusEventId}"]`);
			if (!el) return;
			el.scrollIntoView({ behavior: 'smooth', block: isDesktop ? 'center' : 'nearest' });
			handledScroll = true;
		});
	});

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

	const today = getNow();
	const todayKey = today.toISOString().slice(0, 10);
	let rangeMode = $state<'week' | 'month'>('month');
	let anchorDate = new SvelteDate(today.getFullYear(), today.getMonth(), today.getDate());

	function startOfWeek(date: Date) {
		const d = new SvelteDate(date);
		const day = d.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		d.setDate(d.getDate() + diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function endOfWeek(date: Date) {
		const start = startOfWeek(date);
		const end = new SvelteDate(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);
		return end;
	}

	function getRangeBounds() {
		if (rangeMode === 'week') {
			return { start: startOfWeek(anchorDate), end: endOfWeek(anchorDate) };
		}
		const start = new SvelteDate(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
		const end = new SvelteDate(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}

	function isInRange(dateStr: string, start: Date, end: Date) {
		const d = new SvelteDate(`${dateStr}T00:00:00`);
		return d >= start && d <= end;
	}

	function setRangeMode(mode: 'week' | 'month') {
		rangeMode = mode;
		if (mode === 'month') {
			anchorDate.setMonth(anchorDate.getMonth(), 1);
			anchorDate.setDate(1);
		}
	}

	function goPrev() {
		if (rangeMode === 'month') {
			anchorDate.setMonth(anchorDate.getMonth() - 1, 1);
			anchorDate.setDate(1);
			return;
		}
		anchorDate.setDate(anchorDate.getDate() - 7);
	}

	function goNext() {
		if (rangeMode === 'month') {
			anchorDate.setMonth(anchorDate.getMonth() + 1, 1);
			anchorDate.setDate(1);
			return;
		}
		anchorDate.setDate(anchorDate.getDate() + 7);
	}

	const rangeLabel = $derived.by(() => {
		if (rangeMode === 'month') {
			const formatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
			const label = formatter.format(anchorDate);
			return label.charAt(0).toUpperCase() + label.slice(1);
		}
		const start = startOfWeek(anchorDate);
		const formatter = new Intl.DateTimeFormat('es-CL', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		const label = formatter.format(start);
		return `Semana del ${label}`;
	});

	const ramosMap = $derived.by(() => new Map(db.ramos.list));

	function getRamoName(ramoId?: string) {
		if (!ramoId) return '—';
		const ramo = ramosMap.get(ramoId);
		return ramo?.nombre ?? '—';
	}

	function getStatus(event: CalendarEvent) {
		if (event.completed) return 'completed';
		return event.dueDate < todayKey ? 'overdue' : 'upcoming';
	}

	function statusLabel(status: string) {
		switch (status) {
			case 'completed':
				return 'Completado';
			case 'overdue':
				return 'Vencido';
			default:
				return 'Pendiente';
		}
	}

	function statusClasses(status: string) {
		switch (status) {
			case 'completed':
				return 'bg-success-400 text-success-100 border border-success-300';
			case 'overdue':
				return 'bg-error-400 text-error-100 border border-error-300';
			default:
				return 'bg-base-200 text-content/70 border border-base-400';
		}
	}

	function priorityLabel(priority: string) {
		switch (priority) {
			case 'high':
				return 'Alta';
			case 'medium':
				return 'Media';
			case 'low':
			default:
				return 'Baja';
		}
	}

	function priorityClasses(priority: string) {
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

	function formatDateLabel(dateStr: string) {
		const formatted = new Intl.DateTimeFormat('es-CL', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(`${dateStr}T00:00:00`));
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	}

	const groups = $derived.by(() => {
		const { start, end } = getRangeBounds();
		const list = db.events.list
			.map(([, event]) => event)
			.filter((event) => {
				if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) return false;
				const status = getStatus(event);
				if (selectedStatus === 'completed') return status === 'completed';
				if (selectedStatus === 'overdue') return status === 'overdue';
				if (selectedStatus === 'upcoming') return status === 'upcoming';
				if (!isInRange(event.dueDate, start, end)) return false;
				return true;
			})
			.sort(
				(a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || a.title.localeCompare(b.title)
			);

		const map = new SvelteMap<string, CalendarEvent[]>();
		for (const ev of list) {
			if (!map.has(ev.dueDate)) map.set(ev.dueDate, []);
			map.get(ev.dueDate)!.push(ev);
		}

		return Array.from(map.entries()).map(([date, events]) => ({ date, events }));
	});
</script>

<div class="bg-base-100 rounded-2xl border border-base-400 shadow-sm p-6">
	<div class="flex flex-wrap items-center justify-between gap-3 mb-2">
		<div class="text-sm font-semibold text-content/90">Línea de tiempo</div>
		<div class="flex items-center gap-2">
			<button
				class="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors {rangeMode ===
				'month'
					? 'bg-calendar-400 text-calendar-100 border-calendar-300'
					: 'border-base-400 text-content/60 hover:bg-base-200'}"
				onclick={() => setRangeMode('month')}
			>
				Mes
			</button>
			<button
				class="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors {rangeMode ===
				'week'
					? 'bg-calendar-400 text-calendar-100 border-calendar-300'
					: 'border-base-400 text-content/60 hover:bg-base-200'}"
				onclick={() => setRangeMode('week')}
			>
				Semana
			</button>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="cursor-pointer p-2 rounded-lg border border-base-400 text-content/60 hover:bg-base-200"
				onclick={goPrev}
				aria-label="Anterior"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				class="cursor-pointer p-2 rounded-lg border border-base-400 text-content/60 hover:bg-base-200"
				onclick={goNext}
				aria-label="Siguiente"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>
	<div class="text-xs text-content/50 mb-4">{rangeLabel}</div>

	{#if groups.length === 0}
		<div class="text-sm text-content/50 italic">No hay eventos registrados.</div>
	{:else}
		<div class="relative pl-6">
			<div class="absolute left-2 top-0 bottom-0 w-px bg-base-300"></div>

			<div class="space-y-6">
				{#each groups as group (group.date)}
					<div class="relative">
						<div
							class="absolute -left-4 top-[5px] h-3 w-3 -translate-x-1/2 rounded-full bg-calendar-100 shadow-[0_0_8px_var(--color-calendar-100)]"
						></div>

						<div class="flex items-center gap-2 text-sm font-semibold text-content/90">
							<span>{formatDateLabel(group.date)}</span>
							{#if group.date === todayKey}
								<span
									class="text-[10px] px-2 py-0.5 rounded-full bg-calendar-400 text-calendar-100 border border-calendar-300"
								>
									Hoy
								</span>
							{/if}
						</div>

						<div class="mt-3 space-y-3">
							{#each group.events as ev (ev.id)}
								<div
									data-event-id={ev.id}
									class={`timeline-event rounded-xl border border-base-400 bg-base-100 p-3 shadow-sm transition-all ${
										ev.id === focusEventId ? 'ring-2 ring-calendar-100/50 shine-effect' : ''
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
												aria-label={ev.completed ? 'Pendiente' : 'Completado'}
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
												aria-label="Editar"
												onclick={() => onEditEvent?.(ev)}
											>
												<Pencil class="w-4 h-4" />
											</button>
											<button
												class="cursor-pointer text-error-100 hover:opacity-80 transition-opacity"
												aria-label="Borrar"
												onclick={() => openDeleteConfirm(ev)}
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
									</div>

									<div class="mt-2 flex flex-wrap gap-2 text-xs">
										<span
											class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityClasses(ev.priority)}`}
										>
											{priorityLabel(ev.priority)}
										</span>
										<span
											class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusClasses(getStatus(ev))}`}
										>
											{statusLabel(getStatus(ev))}
										</span>
										{#if ev.ramoId}
											<span
												class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-base-400 bg-base-200 text-content/70"
											>
												{getRamoName(ev.ramoId)}
											</span>
										{/if}
									</div>

									<div class="mt-2 flex items-center gap-2 text-xs text-content/50">
										<CalendarDays class="w-3.5 h-3.5 opacity-70 shrink-0" />
										<span>{new Date(ev.dueDate).toLocaleDateString('es-CL')}</span>
									</div>
									{#if ev.location}
										<div class="mt-1 flex items-center gap-2 text-xs text-content/50">
											<MapPin class="w-3.5 h-3.5 opacity-70 shrink-0" />
											<span class="truncate min-w-0 flex-1">{ev.location}</span>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if deleteConfirmEvent !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<button
				class="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm cursor-pointer transition-all"
				onclick={cancelDelete}
				aria-label="Cerrar"
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
