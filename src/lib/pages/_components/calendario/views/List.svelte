<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { db } from '$lib/state/index.svelte';
	import {
		Pencil,
		Trash2,
		CheckCircle2,
		Circle,
		CalendarDays,
		MapPin,
		FileText
	} from '@lucide/svelte';
	// Eliminado AlertDialog de Shadcn
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
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
		if (!focusEventId || handledScroll) return;
		if (typeof document === 'undefined') return;
		tick().then(() => {
			const selector = isDesktop
				? `.event-row[data-event-id="${focusEventId}"]`
				: `.event-card[data-event-id="${focusEventId}"]`;
			const el = document.querySelector(selector);
			if (!el) return;
			el.scrollIntoView({ behavior: 'smooth', block: isDesktop ? 'center' : 'nearest' });
			handledScroll = true;
		});
	});

	function openDeleteConfirm(event: CalendarEvent) {
		deleteConfirmEvent = event;
	}

	function confirmDelete() {
		if (!deleteConfirmEvent) return;
		db.removeEvent(deleteConfirmEvent.id);
		deleteConfirmEvent = null;
	}

	function cancelDelete() {
		deleteConfirmEvent = null;
	}

	const events = $derived.by(() => {
		const today = getNow().toISOString().slice(0, 10);
		const list = db.events.list
			.map(([, event]) => event)
			.filter((event) => {
				if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) return false;
				if (selectedStatus === 'completed') return event.completed;
				if (selectedStatus === 'overdue') return !event.completed && event.dueDate < today;
				if (selectedStatus === 'upcoming') return !event.completed && event.dueDate >= today;
				return true;
			});

		return list.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
	});

	const ramosMap = $derived.by(() => new Map(db.ramos.list));

	function getRamoName(ramoId?: string) {
		if (!ramoId) return '—';
		const ramo = ramosMap.get(ramoId);
		return ramo?.nombre ?? '—';
	}

	function priorityLabel(priority: string) {
		switch (priority) {
			case 'high':
				return 'Alta';
			case 'medium':
				return 'Media';
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
			default:
				return 'bg-success-400 text-success-100 border border-success-300';
		}
	}
</script>

<div class="bg-base-100 rounded-2xl border border-base-400 shadow-sm overflow-hidden relative">
	<div class="px-4 py-3 border-b border-base-300 text-sm font-semibold text-content/80 bg-base-200">
		Eventos
	</div>

	{#if events.length === 0}
		<div class="p-6 text-sm text-content/50">No hay eventos registrados.</div>
	{:else}
		<div class="lg:hidden space-y-3 p-4">
			{#each events as event (event.id)}
				<div
					data-event-id={event.id}
					class={`event-card rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all ${event.id === focusEventId ? 'shine-effect ring-2 ring-calendar-100/50' : ''}`}
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<div class="font-semibold text-content truncate" title={event.title}>
								{event.title}
							</div>
							<div class="mt-1 flex items-center gap-2 text-xs text-content/60">
								<FileText class="w-3.5 h-3.5 text-content/40 shrink-0" />
								<span class="truncate min-w-0 flex-1">{event.description ?? '—'}</span>
							</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button
								class="cursor-pointer text-success-100 hover:opacity-80 transition-opacity"
								onclick={() => db.events.toggleCompleted(event.id)}
							>
								{#if event.completed}
									<CheckCircle2 class="w-4 h-4" />
								{:else}
									<Circle class="w-4 h-4" />
								{/if}
							</button>
							<button
								class="cursor-pointer text-calendar-100 hover:opacity-80 transition-opacity"
								onclick={() => onEditEvent?.(event)}
							>
								<Pencil class="w-4 h-4" />
							</button>
							<button
								class="cursor-pointer text-error-100 hover:opacity-80 transition-opacity"
								onclick={() => openDeleteConfirm(event)}
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>
					</div>

					<div class="mt-3 flex flex-wrap gap-2 text-xs">
						<span
							class={`inline-flex items-center px-2 py-1 rounded-full font-semibold ${priorityClasses(event.priority)}`}
						>
							{priorityLabel(event.priority)}
						</span>
						<span
							class={`inline-flex items-center px-2 py-1 rounded-full font-semibold ${
								event.completed
									? 'bg-success-400 text-success-100 border border-success-300'
									: event.dueDate < getNow().toISOString().slice(0, 10)
										? 'bg-error-400 text-error-100 border border-error-300'
										: 'bg-base-300 text-content/70 border border-base-400'
							}`}
						>
							{event.completed
								? 'Completado'
								: event.dueDate < getNow().toISOString().slice(0, 10)
									? 'Vencido'
									: 'Pendiente'}
						</span>
						<span
							class="inline-flex items-center px-2 py-1 rounded-full font-semibold border border-base-400 bg-base-200 text-content/70"
						>
							{getRamoName(event.ramoId)}
						</span>
					</div>

					<div class="mt-3 text-xs text-content/60 space-y-1">
						<div class="flex items-center gap-2">
							<CalendarDays class="w-3.5 h-3.5 text-content/40 shrink-0" />
							<span>{new Date(event.dueDate).toLocaleDateString('es-CL')}</span>
						</div>
						<div class="flex items-center gap-2">
							<MapPin class="w-3.5 h-3.5 text-content/40 shrink-0" />
							<span class="truncate min-w-0 flex-1">{event.location ?? '—'}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="hidden lg:block overflow-x-auto">
			<table class="min-w-full text-sm table-fixed border-collapse">
				<thead
					class="bg-base-200 text-xs uppercase tracking-wider text-content/50 border-b border-base-300"
				>
					<tr>
						<th class="px-4 py-3 text-left w-48 font-bold">Título</th>
						<th class="px-4 py-3 text-left w-64 font-bold">Descripción</th>
						<th class="px-4 py-3 text-left font-bold">Fecha</th>
						<th class="px-4 py-3 text-left font-bold">Lugar</th>
						<th class="px-4 py-3 text-left font-bold">Prioridad</th>
						<th class="px-4 py-3 text-left font-bold">Ramo</th>
						<th class="px-4 py-3 text-left font-bold">Estado</th>
						<th class="px-4 py-3 text-left font-bold">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-base-300 bg-base-100">
					{#each events as event (event.id)}
						{@const isFocused = event.id === focusEventId}
						<tr class="event-row hover:bg-base-200 transition-colors" data-event-id={event.id}>
							<td class={`px-4 py-3 font-medium text-content ${isFocused ? 'shine-effect' : ''}`}>
								<div class="max-w-[20ch] truncate" title={event.title}>{event.title}</div>
							</td>
							<td class={`px-4 py-3 text-content/70 ${isFocused ? 'shine-effect' : ''}`}>
								<div class="max-w-[20ch] truncate" title={event.description ?? '—'}>
									{event.description ?? '—'}
								</div>
							</td>
							<td class={`px-4 py-3 text-content/70 ${isFocused ? 'shine-effect' : ''}`}>
								{new Date(event.dueDate).toLocaleDateString('es-CL')}
							</td>
							<td class={`px-4 py-3 text-content/70 truncate ${isFocused ? 'shine-effect' : ''}`}>
								{event.location ?? '—'}
							</td>
							<td class={`px-4 py-3 ${isFocused ? 'shine-effect' : ''}`}>
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${priorityClasses(event.priority)}`}
								>
									{priorityLabel(event.priority)}
								</span>
							</td>
							<td class={`px-4 py-3 text-content/70 truncate ${isFocused ? 'shine-effect' : ''}`}>
								{getRamoName(event.ramoId)}
							</td>
							<td class={`px-4 py-3 ${isFocused ? 'shine-effect' : ''}`}>
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
										event.completed
											? 'bg-success-400 text-success-100 border border-success-300'
											: event.dueDate < getNow().toISOString().slice(0, 10)
												? 'bg-error-400 text-error-100 border border-error-300'
												: 'bg-base-300 text-content/70 border border-base-400'
									}`}
								>
									{event.completed
										? 'Completado'
										: event.dueDate < getNow().toISOString().slice(0, 10)
											? 'Vencido'
											: 'Pendiente'}
								</span>
							</td>
							<td class={`px-4 py-3 ${isFocused ? 'shine-effect' : ''}`}>
								<div class="flex items-center gap-2">
									<button
										class="cursor-pointer text-success-100 hover:opacity-70 transition-opacity"
										onclick={() => db.events.toggleCompleted(event.id)}
									>
										{#if event.completed}
											<CheckCircle2 class="w-4 h-4" />
										{:else}
											<Circle class="w-4 h-4" />
										{/if}
									</button>
									<button
										class="cursor-pointer text-calendar-100 hover:opacity-70 transition-opacity"
										onclick={() => onEditEvent?.(event)}
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										class="cursor-pointer text-error-100 hover:opacity-70 transition-opacity"
										onclick={() => openDeleteConfirm(event)}
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if deleteConfirmEvent !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<button
				class="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm cursor-pointer"
				aria-label="Cancelar eliminación de evento"
				onclick={cancelDelete}
			></button>
			<div
				class="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
			>
				<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
				<p class="text-sm text-content/70 mb-6">
					Esta acción eliminará permanentemente el evento
					<strong class="text-content font-semibold">"{deleteConfirmEvent.title}"</strong>. Esta
					acción no se puede deshacer.
				</p>
				<div class="flex justify-end gap-3">
					<button
						onclick={cancelDelete}
						class="px-4 py-2 rounded-lg border border-base-400 text-content/70 text-sm font-semibold hover:bg-base-200 transition-colors cursor-pointer"
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
