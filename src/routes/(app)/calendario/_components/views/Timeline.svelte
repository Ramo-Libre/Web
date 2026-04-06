<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import { CalendarDays, MapPin, FileText, Pencil, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

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
		anchorDate = new Date(`${event.dueDate}T00:00:00`);
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
		db.events.remove(deleteConfirmEvent.id);
		deleteConfirmEvent = null;
	}

	const today = new Date();
	const todayKey = today.toISOString().slice(0, 10);
	let rangeMode = $state<'week' | 'month'>('month');
	let anchorDate = $state(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

	function startOfWeek(date: Date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		d.setDate(d.getDate() + diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function endOfWeek(date: Date) {
		const start = startOfWeek(date);
		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);
		return end;
	}

	function getRangeBounds() {
		if (rangeMode === 'week') {
			return { start: startOfWeek(anchorDate), end: endOfWeek(anchorDate) };
		}
		const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
		const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}

	function isInRange(dateStr: string, start: Date, end: Date) {
		const d = new Date(`${dateStr}T00:00:00`);
		return d >= start && d <= end;
	}

	function setRangeMode(mode: 'week' | 'month') {
		rangeMode = mode;
		if (mode === 'month') {
			anchorDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
		}
	}

	function goPrev() {
		if (rangeMode === 'month') {
			anchorDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1);
			return;
		}
		const d = new Date(anchorDate);
		d.setDate(d.getDate() - 7);
		anchorDate = d;
	}

	function goNext() {
		if (rangeMode === 'month') {
			anchorDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1);
			return;
		}
		const d = new Date(anchorDate);
		d.setDate(d.getDate() + 7);
		anchorDate = d;
	}

	const rangeLabel = $derived.by(() => {
		if (rangeMode === 'month') {
			const formatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
			const label = formatter.format(anchorDate);
			return label.charAt(0).toUpperCase() + label.slice(1);
		}
		const start = startOfWeek(anchorDate);
		const formatter = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
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
				return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
			case 'overdue':
				return 'bg-red-50 text-red-700 border border-red-200';
			default:
				return 'bg-slate-50 text-slate-600 border border-slate-200';
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
				return 'bg-red-50 text-red-700 border border-red-200';
			case 'medium':
				return 'bg-amber-50 text-amber-700 border border-amber-200';
			case 'low':
			default:
				return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
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
			.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || a.title.localeCompare(b.title));

		const map = new Map<string, CalendarEvent[]>();
		for (const ev of list) {
			if (!map.has(ev.dueDate)) map.set(ev.dueDate, []);
			map.get(ev.dueDate)!.push(ev);
		}

		return Array.from(map.entries()).map(([date, events]) => ({ date, events }));
	});
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
	<div class="flex flex-wrap items-center justify-between gap-3 mb-2">
		<div class="text-sm font-semibold text-slate-700">Línea de tiempo</div>
		<div class="flex items-center gap-2">
			<button
				class="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border {rangeMode === 'month'
					? 'bg-blue-600 text-white border-blue-600'
					: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
				onclick={() => setRangeMode('month')}
			>
				Mes
			</button>
			<button
				class="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border {rangeMode === 'week'
					? 'bg-blue-600 text-white border-blue-600'
					: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
				onclick={() => setRangeMode('week')}
			>
				Semana
			</button>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="cursor-pointer p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
				onclick={goPrev}
				aria-label="Anterior"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				class="cursor-pointer p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
				onclick={goNext}
				aria-label="Siguiente"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>
	<div class="text-xs text-slate-500 mb-4">{rangeLabel}</div>

	{#if groups.length === 0}
		<div class="text-sm text-slate-500">No hay eventos registrados.</div>
	{:else}
		<div class="relative pl-6">
			<div class="absolute left-2 top-0 bottom-0 w-px bg-slate-200"></div>

			<div class="space-y-6">
				{#each groups as group (group.date)}
					<div class="relative">
						<div class="absolute -left-4 top-[5px] h-3 w-3 -translate-x-1/2 rounded-full bg-blue-500"></div>
						<div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
							<span>{formatDateLabel(group.date)}</span>
							{#if group.date === todayKey}
								<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
									Hoy
								</span>
							{/if}


						</div>

						<div class="mt-3 space-y-3">
							{#each group.events as ev (ev.id)}
								<div
									data-event-id={ev.id}
									class={`timeline-event rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
										ev.id === focusEventId ? 'shine-effect' : ''
									}`}
								>
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
												onclick={() => openDeleteConfirm(ev)}
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
									</div>

									<div class="mt-2 flex flex-wrap gap-2 text-xs">
										<span
											class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityClasses(
												ev.priority
											)}`}
										>
											{priorityLabel(ev.priority)}
										</span>
										<span
											class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusClasses(
												getStatus(ev)
											)}`}
										>
											{statusLabel(getStatus(ev))}
										</span>
										{#if ev.ramoId}
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-600">
												{getRamoName(ev.ramoId)}
											</span>
										{/if}
									</div>

									<div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
										<CalendarDays class="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span>{new Date(ev.dueDate).toLocaleDateString('es-CL')}</span>
									</div>
									{#if ev.location}
										<div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
											<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

	<AlertDialog.Root
		open={deleteConfirmEvent !== null}
		onOpenChange={(open) => !open && cancelDelete()}
	>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>¿Confirmar eliminación?</AlertDialog.Title>
				<AlertDialog.Description>
					{#if deleteConfirmEvent}
						Esta acción eliminará permanentemente el evento <strong>"{deleteConfirmEvent.title.length > 30 ? `${deleteConfirmEvent.title.slice(0, 30)}…` : deleteConfirmEvent.title}"</strong>.
						Esta acción no se puede deshacer.
					{/if}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={cancelDelete} class="cursor-pointer">
					Cancelar
				</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={confirmDelete}
					class="bg-red-600 hover:bg-red-700 cursor-pointer"
				>
					Eliminar
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
