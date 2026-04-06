<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { Pencil, Trash2, CheckCircle2, Circle } from '@lucide/svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';

	interface Props {
		onEditEvent?: (event: CalendarEvent) => void;
	}

	let { onEditEvent }: Props = $props();

	const events = $derived.by(() => {
		const list = db.events.list.map(([, event]) => event);
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
		<div class="overflow-x-auto">
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
											: 'bg-slate-50 text-slate-600 border border-slate-200'
									}`}
								>
									{event.completed ? 'Completado' : 'Pendiente'}
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
										onclick={() => db.events.remove(event.id)}
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
</div>
