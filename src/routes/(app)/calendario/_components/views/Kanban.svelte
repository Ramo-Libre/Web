<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import {
		CalendarDays,
		MapPin,
		FileText,
		Pencil,
		Trash2,
		CheckCircle2,
		Circle
	} from '@lucide/svelte';

	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	interface Props {
		onEditEvent?: (event: CalendarEvent) => void;
		selectedStatus?: StatusFilter;
		selectedRamo?: string;
		focusEventId?: string;
	}

	let { onEditEvent, selectedStatus = 'all', selectedRamo = 'all', focusEventId }: Props = $props();
	let selectedColumn = $state('upcoming');

	let deleteConfirmEvent = $state<CalendarEvent | null>(null);
	let handledFocusEvent = $state(false);
	let handledScroll = $state(false);
	let isDesktop = $state(false);

	onMount(() => {
		if (typeof window === 'undefined') return;
		const media = window.matchMedia('(min-width: 640px)');
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
		selectedColumn = getStatus(event);
		handledFocusEvent = true;
	});

	$effect(() => {
		if (!focusEventId || handledScroll) return;
		if (typeof document === 'undefined') return;
		tick().then(() => {
			const selector = isDesktop
				? `.kanban-event--desktop[data-event-id="${focusEventId}"]`
				: `.kanban-event--mobile[data-event-id="${focusEventId}"]`;
			const el = document.querySelector(selector);
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

	const todayKey = new Date().toISOString().slice(0, 10);
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
				return 'bg-base-300 text-content/70 border border-base-400';
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

	const events = $derived.by(() => {
		const list = db.events.list
			.map(([, event]) => event)
			.filter((event) => {
				if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) return false;
				const status = getStatus(event);
				if (selectedStatus === 'completed') return status === 'completed';
				if (selectedStatus === 'overdue') return status === 'overdue';
				if (selectedStatus === 'upcoming') return status === 'upcoming';
				return true;
			})
			.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
		return list;
	});

	const columns = $derived.by(() => {
		const groups: Record<string, CalendarEvent[]> = {
			upcoming: [],
			overdue: [],
			completed: []
		};
		for (const ev of events) {
			const status = getStatus(ev);
			groups[status].push(ev);
		}
		return [
			{ key: 'upcoming', title: 'Próximos', items: groups.upcoming },
			{ key: 'overdue', title: 'Vencidos', items: groups.overdue },
			{ key: 'completed', title: 'Completados', items: groups.completed }
		];
	});
</script>

<div class="space-y-4 relative">
	<div class="flex gap-2 sm:hidden">
		{#each columns as col (col.key)}
			<button
				class="cursor-pointer transition duration-100 flex-1 px-3 py-2 rounded-lg text-sm font-semibold border {selectedColumn ===
				col.key
					? 'bg-calendar-400 text-calendar-100 border-calendar-300'
					: 'bg-base-200 border-base-400 text-content/60 hover:bg-base-300'}"
				onclick={() => (selectedColumn = col.key)}
			>
				{col.title}
			</button>
		{/each}
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
		{#each columns as column (column.key)}
			<div
				class="rounded-xl border border-base-400 bg-base-100 shadow-sm {isDesktop
					? 'block'
					: column.key === selectedColumn
						? 'block'
						: 'hidden'}"
			>
				<div
					class="px-4 py-3 border-b border-base-300 text-sm font-bold text-content/80 uppercase tracking-tight"
				>
					{column.title}
				</div>
				<div class="p-4 space-y-3">
					{#if column.items.length === 0}
						<div class="text-sm text-content/40 text-center py-4 italic">Sin eventos</div>
					{:else}
						{#each column.items as ev (ev.id)}
							<div
								data-event-id={ev.id}
								class={`kanban-event ${isDesktop ? 'kanban-event--desktop' : 'kanban-event--mobile'} rounded-xl border border-base-400 bg-base-100 p-3 shadow-sm transition-all ${
									ev.id === focusEventId ? 'shine-effect ring-2 ring-calendar-100/50' : ''
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
										class={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${priorityClasses(ev.priority)}`}
									>
										{priorityLabel(ev.priority)}
									</span>
									<span
										class={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClasses(getStatus(ev))}`}
									>
										{statusLabel(getStatus(ev))}
									</span>
									{#if ev.ramoId}
										<span
											class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-base-400 bg-base-200 text-content/60"
										>
											{getRamoName(ev.ramoId)}
										</span>
									{/if}
								</div>

								<div class="mt-3 flex items-center gap-2 text-xs text-content/50">
									<CalendarDays class="w-3.5 h-3.5 text-content/40 shrink-0" />
									<span>{new Date(ev.dueDate).toLocaleDateString('es-CL')}</span>
								</div>
								{#if ev.location}
									<div class="mt-1 flex items-center gap-2 text-xs text-content/50">
										<MapPin class="w-3.5 h-3.5 text-content/40 shrink-0" />
										<span class="truncate min-w-0 flex-1">{ev.location}</span>
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/each}
	</div>

	{#if deleteConfirmEvent !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<button
				class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer transition-all"
				aria-label="Cerrar"
				onclick={cancelDelete}
			></button>
			<div
				class="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
			>
				<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
				<p class="text-sm text-content/70 mb-6">
					Esta acción eliminará permanentemente el evento
					<strong class="font-semibold text-content inline-block max-w-[20ch] truncate align-bottom"
						>"{deleteConfirmEvent.title}"</strong
					>. Esta acción no se puede deshacer.
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
