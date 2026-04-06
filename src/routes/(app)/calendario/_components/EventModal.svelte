<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		initialEvent?: CalendarEvent | null;
	}

	let { open = false, onClose, initialEvent = null }: Props = $props();

	const isEditing = $derived.by(() => Boolean(initialEvent));

	const ramos = $derived.by(() => db.ramos.list);

	let title = $state('');
	let description = $state('');
	let dueDate = $state('');
	let location = $state('');
	let priority = $state<'low' | 'medium' | 'high'>('medium');
	let ramoId = $state('');

	function resetForm() {
		title = '';
		description = '';
		dueDate = '';
		location = '';
		priority = 'medium';
		ramoId = '';
	}

	$effect(() => {
		if (open) {
			if (initialEvent) {
				title = initialEvent.title ?? '';
				description = initialEvent.description ?? '';
				dueDate = initialEvent.dueDate ?? '';
				location = initialEvent.location ?? '';
				priority = initialEvent.priority ?? 'medium';
				ramoId = initialEvent.ramoId ?? '';
			} else {
				resetForm();
			}
		}
	});

	function handleCancel() {
		resetForm();
		onClose();
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (!title.trim() || !dueDate) return;

		if (isEditing && initialEvent) {
			db.events.update(initialEvent.id, {
				id: initialEvent.id,
				title: title.trim(),
				description: description.trim() || undefined,
				dueDate,
				location: location.trim() || undefined,
				priority,
				ramoId: ramoId || undefined,
				completed: initialEvent.completed ?? false
			});
		} else {
			db.events.add({
				title: title.trim(),
				description: description.trim() || undefined,
				dueDate,
				location: location.trim() || undefined,
				priority,
				ramoId: ramoId || undefined,
				completed: false
			});
		}

		resetForm();
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button class="absolute inset-0 bg-black/40" aria-label="Cerrar" onclick={handleCancel}
		></button>
		<div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
			<div class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
				{isEditing ? 'Editar evento' : 'Nuevo evento'}
			</div>

			<form class="mt-4 space-y-4" onsubmit={handleSubmit}>
				<div>
					<label for="event-title" class="text-sm font-medium text-slate-600">Título</label>
					<input
						id="event-title"
						type="text"
						bind:value={title}
						placeholder="Ej: Control 2"
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						required
					/>
				</div>

				<div>
					<label for="event-description" class="text-sm font-medium text-slate-600"
						>Descripción</label
					>
					<textarea
						id="event-description"
						bind:value={description}
						placeholder="Detalles del evento..."
						rows="3"
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
					></textarea>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="event-date" class="text-sm font-medium text-slate-600">Fecha</label>
						<input
							id="event-date"
							type="date"
							bind:value={dueDate}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
							required
						/>
					</div>
					<div>
						<label for="event-location" class="text-sm font-medium text-slate-600">Lugar</label>
						<input
							id="event-location"
							type="text"
							bind:value={location}
							placeholder="Ej: Sala A"
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="event-priority" class="text-sm font-medium text-slate-600">Prioridad</label>
						<select
							id="event-priority"
							bind:value={priority}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						>
							<option value="low">Baja</option>
							<option value="medium">Media</option>
							<option value="high">Alta</option>
						</select>
					</div>
					<div>
						<label for="event-ramo" class="text-sm font-medium text-slate-600">Ramo</label>
						<select
							id="event-ramo"
							bind:value={ramoId}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
						>
							<option value="">Sin ramo</option>
							{#each ramos as [id, ramo] (id)}
								<option value={id}>{ramo.nombre}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button
						type="button"
						class="px-4 py-2 cursor-pointer rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
						onclick={handleCancel}
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
					>
						{isEditing ? 'Actualizar' : 'Guardar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
