<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import { CalendarDays, MapPin, FileText, Pencil, Trash2, CheckCircle2, Circle } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

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
		db.events.remove(deleteConfirmEvent.id);
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

<div class="space-y-4">
	<div class="flex gap-2 sm:hidden">
		<button
			class="cursor-pointer transition duration-100 flex-1 px-3 py-2 rounded-lg text-sm font-semibold border {selectedColumn === 'upcoming'
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-slate-200 border-slate-200 text-slate-600 hover:bg-slate-50'}"
			onclick={() => (selectedColumn = 'upcoming')}
		>
			Próximos
		</button>
		<button
			class="cursor-pointer transition duration-100 flex-1 px-3 py-2 rounded-lg text-sm font-semibold border {selectedColumn === 'overdue'
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-slate-200 border-slate-200 text-slate-600 hover:bg-slate-50'}"
			onclick={() => (selectedColumn = 'overdue')}
		>
			Vencidos
		</button>
		<button
			class="cursor-pointer transition duration-100 flex-1 px-3 py-2 rounded-lg text-sm font-semibold border {selectedColumn === 'completed'
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-slate-200 border-slate-200 text-slate-600 hover:bg-slate-50'}"
			onclick={() => (selectedColumn = 'completed')}
		>
			Completados
		</button>
	</div>

	<div class="sm:hidden">
		{#each columns as column (column.key)}
			{#if column.key === selectedColumn}
				<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div class="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
						{column.title}
					</div>
					<div class="p-4 space-y-3">
						{#if column.items.length === 0}
							<div class="text-sm text-slate-500">Sin eventos</div>
						{:else}
							{#each column.items as ev (ev.id)}
								<div
									data-event-id={ev.id}
									class={`kanban-event kanban-event--mobile rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
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
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<AlertDialog.Root
		open={deleteConfirmEvent !== null}
		onOpenChange={(open) => !open && cancelDelete()}
	>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>¿Confirmar eliminación?</AlertDialog.Title>
				<AlertDialog.Description>
					{#if deleteConfirmEvent}
						Esta acción eliminará permanentemente el evento
						<strong class="inline-block max-w-[20ch] truncate align-bottom">"{deleteConfirmEvent.title}"</strong>.
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

	<div class="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-4">
		{#each columns as column (column.key)}
			<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
				<div class="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
					{column.title}
				</div>
				<div class="p-4 space-y-3">
					{#if column.items.length === 0}
						<div class="text-sm text-slate-500">Sin eventos</div>
					{:else}
						{#each column.items as ev (ev.id)}
							<div
								data-event-id={ev.id}
								class={`kanban-event kanban-event--desktop rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
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
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
