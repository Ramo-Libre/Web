<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { Pencil, Trash2, CheckCircle2, Circle, CalendarDays, MapPin, FileText } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';

	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	interface Props {
		onEditEvent?: (event: CalendarEvent) => void;
		selectedStatus?: StatusFilter;
		selectedRamo?: string;
	}

	let { onEditEvent, selectedStatus = 'all', selectedRamo = 'all' }: Props = $props();

	let deleteConfirmEvent = $state<CalendarEvent | null>(null);

	function openDeleteConfirm(event: CalendarEvent) {
		deleteConfirmEvent = event;
	}

	function confirmDelete() {
		if (!deleteConfirmEvent) return;
		db.events.remove(deleteConfirmEvent.id);
		deleteConfirmEvent = null;
	}

	function cancelDelete() {
		deleteConfirmEvent = null;
	}

	const events = $derived.by(() => {
		const today = new Date().toISOString().slice(0, 10);
		const list = db.events.list
			.map(([, event]) => event)
			.filter((event) => {
				if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) {
					return false;
				}
				if (selectedStatus === 'completed') {
					return event.completed;
				}
				if (selectedStatus === 'overdue') {
					return !event.completed && event.dueDate < today;
				}
				if (selectedStatus === 'upcoming') {
					return !event.completed && event.dueDate >= today;
				}
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
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
	<div class="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-slate-700">Eventos</div>

	{#if events.length === 0}
		<div class="p-6 text-sm text-slate-500">No hay eventos registrados.</div>
	{:else}
		<div class="lg:hidden space-y-3 p-4">
			{#each events as event (event.id)}
				<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<div class="font-semibold text-slate-800 truncate" title={event.title}>{event.title}</div>
							<div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
								<FileText class="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<span class="truncate min-w-0 flex-1" title={event.description ?? '—'}>{event.description ?? '—'}</span>
							</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button
								class="cursor-pointer text-emerald-600 hover:text-emerald-700"
								aria-label={event.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
								onclick={() => db.events.toggleCompleted(event.id)}
							>
								{#if event.completed}
									<CheckCircle2 class="w-4 h-4" />
								{:else}
									<Circle class="w-4 h-4" />
								{/if}
							</button>
							<button
								class="cursor-pointer text-blue-600 hover:text-blue-700"
								aria-label="Editar evento"
								onclick={() => onEditEvent?.(event)}
							>
								<Pencil class="w-4 h-4" />
							</button>
							<button
								class="cursor-pointer text-rose-600 hover:text-rose-700"
								aria-label="Borrar evento"
								onclick={() => openDeleteConfirm(event)}
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>
					</div>

					<div class="mt-3 flex flex-wrap gap-2 text-xs">
						<span
							class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityClasses(
								event.priority
							)}`}
						>
							{priorityLabel(event.priority)}
						</span>
						<span
							class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
								event.completed
									? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
									: event.dueDate < new Date().toISOString().slice(0, 10)
										? 'bg-red-50 text-red-700 border border-red-200'
										: 'bg-slate-50 text-slate-600 border border-slate-200'
							}`}
						>
							{event.completed
								? 'Completado'
								: event.dueDate < new Date().toISOString().slice(0, 10)
									? 'Vencido'
									: 'Pendiente'}
						</span>
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-600">
							{getRamoName(event.ramoId)}
						</span>
					</div>

					<div class="mt-3 text-xs text-slate-600 space-y-1">
						<div class="flex items-center gap-2">
							<CalendarDays class="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span>{(new Date(event.dueDate)).toLocaleDateString('es-CL')}</span>
						</div>
						<div class="flex items-center gap-2">
							<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span class="truncate min-w-0 flex-1" title={event.location ?? '—'}>{event.location ?? '—'}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="hidden lg:block overflow-x-auto">
			<table class="min-w-full text-sm table-fixed">
				<thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
					<tr>
						<th class="px-4 py-3 text-left w-48">Título</th>
						<th class="px-4 py-3 text-left w-64">Descripción</th>
						<th class="px-4 py-3 text-left">Fecha</th>
						<th class="px-4 py-3 text-left">Lugar</th>
						<th class="px-4 py-3 text-left">Prioridad</th>
						<th class="px-4 py-3 text-left">Ramo</th>
						<th class="px-4 py-3 text-left">Estado</th>
						<th class="px-4 py-3 text-left">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each events as event (event.id)}
						<tr class="hover:bg-slate-50">
							<td class="px-4 py-3 font-medium text-slate-800">
								<div class="max-w-[20ch] truncate" title={event.title}>{event.title}</div>
							</td>
							<td class="px-4 py-3 text-slate-600">
								<div class="max-w-[20ch] truncate" title={event.description ?? '—'}>
									{event.description ?? '—'}
								</div>
							</td>
							<td class="px-4 py-3 text-slate-600">{(new Date(event.dueDate)).toLocaleDateString('es-CL')}</td>
							<td class="px-4 py-3 text-slate-600 max-w-[20ch] truncate">{event.location ?? '—'}</td>
							<td class="px-4 py-3">
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityClasses(
										event.priority
									)}`}
								>
									{priorityLabel(event.priority)}
								</span>
							</td>
							<td class="px-4 py-3 text-slate-600 max-w-[20ch] truncate">{getRamoName(event.ramoId)}</td>
							<td class="px-4 py-3">
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
										event.completed
											? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
											: event.dueDate < new Date().toISOString().slice(0, 10)
												? 'bg-red-50 text-red-700 border border-red-200'
												: 'bg-slate-50 text-slate-600 border border-slate-200'
									}`}
								>
									{event.completed
										? 'Completado'
										: event.dueDate < new Date().toISOString().slice(0, 10)
											? 'Vencido'
											: 'Pendiente'}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<button
										class="cursor-pointer text-emerald-600 hover:text-emerald-700"
										aria-label={event.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
										onclick={() => db.events.toggleCompleted(event.id)}
									>
										{#if event.completed}
											<CheckCircle2 class="w-4 h-4" />
										{:else}
											<Circle class="w-4 h-4" />
										{/if}
									</button>
									<button
										class="cursor-pointer text-blue-600 hover:text-blue-700"
										aria-label="Editar evento"
										onclick={() => onEditEvent?.(event)}
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										class="cursor-pointer text-rose-600 hover:text-rose-700"
										aria-label="Borrar evento"
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
</div>
