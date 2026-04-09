<script lang="ts">
	import { Plus, Pencil, Trash2, BookOpen, FlaskConical, Users, Hammer, X, CalendarX2 } from '@lucide/svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay, HorarioType } from '$lib/state/horarios.svelte';

	interface Props {
		selectedRamoId?: string;
	}

	let { selectedRamoId }: Props = $props();

	let isModalOpen = $state(false);
	let editingId: string | null = $state(null);

	let formDay: HorarioDay = $state('L');
	let formStart = $state('');
	let formEnd = $state('');
	let formLocation = $state('');
	let selectedIcon: HorarioType = $state('book');

	const iconOptions = [
		{ id: 'book', label: 'Clase', Icon: BookOpen },
		{ id: 'lab', label: 'Lab', Icon: FlaskConical },
		{ id: 'assist', label: 'Ayudantía', Icon: Users },
		{ id: 'taller', label: 'Taller', Icon: Hammer }
	] as const;

	const dayOrder: HorarioDay[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

	const horarios = $derived.by(() => {
		const list = db.horarios.list.map(([, horario]) => horario);
		return selectedRamoId ? list.filter((h) => h.ramoId === selectedRamoId) : list;
	});

	const sortedHorarios = $derived.by(() => {
		return [...horarios].sort((a, b) => {
			const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
			if (dayDiff !== 0) return dayDiff;
			return a.start.localeCompare(b.start);
		});
	});

	function resetForm() {
		formDay = 'L';
		formStart = '';
		formEnd = '';
		formLocation = '';
		selectedIcon = 'book';
		editingId = null;
	}

	function openNew() {
		resetForm();
		isModalOpen = true;
	}

	function openEdit(horario: Horario) {
		formDay = horario.day;
		formStart = horario.start;
		formEnd = horario.end;
		formLocation = horario.location ?? '';
		selectedIcon = horario.type;
		editingId = horario.id;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		resetForm();
	}

	function removeHorario(id: string) {
		db.horarios.remove(id);
	}

	function saveHorario() {
		if (!formStart || !formEnd) return;

		if (editingId) {
			const existing = db.horarios.get(editingId);
			if (!existing) return;

			db.horarios.update(editingId, {
				...existing,
				day: formDay,
				start: formStart,
				end: formEnd,
				location: formLocation.trim() || undefined,
				type: selectedIcon,
				ramoId: selectedRamoId ?? existing.ramoId
			});
		} else {
			db.horarios.add({
				ramoId: selectedRamoId || undefined,
				day: formDay,
				start: formStart,
				end: formEnd,
				location: formLocation.trim() || undefined,
				type: selectedIcon
			});
		}

		closeModal();
	}

	function iconFor(type: HorarioType) {
		return iconOptions.find((o) => o.id === type)?.Icon ?? BookOpen;
	}
</script>

<div class="space-y-6 w-full max-w-4xl mx-auto pb-10">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
		<div>
			<h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Horarios</h3>
		</div>
		<button
			class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
			onclick={openNew}
		>
			<Plus class="w-4 h-4" />
			Agregar horario
		</button>
	</div>

	<div class="space-y-2">
	    {#if sortedHorarios.length === 0}
			<div class="text-sm text-slate-500 flex justify-center items-center gap-1 mt-20">
			    <CalendarX2 class="w-4 h-4" />
			    No hay horarios agregados.
			</div>
		{:else}
		{#each sortedHorarios as horario (horario.id)}
			{@const TypeIcon = iconFor(horario.type)}
			<div
				class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
			>
				<div class="flex items-center gap-3">
					<div
						class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold"
					>
						{horario.day}
					</div>
					<div class="flex max-sm:flex-col sm:items-center max-sm:justify-center gap-1 sm:gap-4">
						<div class="text-sm font-semibold text-slate-800">{horario.start} - {horario.end}</div>
						<div class="inline-flex items-center gap-1 text-xs text-slate-500">
							<TypeIcon class="w-4 h-4" />
							{#if horario.location}
								<div class="text-xs text-slate-500">{horario.location}</div>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex items-center gap-2 text-slate-500">
					<button
						class="p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
						aria-label="Editar"
						onclick={() => openEdit(horario)}
					>
						<Pencil class="w-4 h-4" />
					</button>
					<button
						class="text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
						aria-label="Eliminar"
						onclick={() => removeHorario(horario.id)}
					>
						<Trash2 class="w-4 h-4" />
					</button>
				</div>
			</div>
		{/each}
		{/if}
	</div>
</div>

{#if isModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button class="absolute inset-0 bg-black/40" aria-label="Cerrar" onclick={closeModal}></button>
		<div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
					{editingId ? 'Editar horario' : 'Nuevo horario'}
				</div>
				<button class="p-2 rounded-lg hover:bg-slate-50 cursor-pointer" onclick={closeModal}>
					<X class="w-4 h-4 text-slate-500" />
				</button>
			</div>

			<div class="mt-4 space-y-4">
				<div>
					<div class="text-sm font-medium text-slate-600 mb-2">Tipo</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{#each iconOptions as option (option.id)}
							<button
								class={`inline-flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
									selectedIcon === option.id
										? 'border-blue-600 bg-blue-50 text-blue-700'
										: 'border-slate-200 text-slate-600 hover:bg-slate-50'
								}`}
								onclick={() => (selectedIcon = option.id)}
							>
								<svelte:component this={option.Icon} class="w-4 h-4" />
								<span>{option.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="text-sm font-medium text-slate-600">Día</label>
						<select
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
							bind:value={formDay}
						>
							<option value="L">Lunes</option>
							<option value="M">Martes</option>
							<option value="X">Miércoles</option>
							<option value="J">Jueves</option>
							<option value="V">Viernes</option>
							<option value="S">Sábado</option>
						</select>
					</div>
					<div>
						<label class="text-sm font-medium text-slate-600">Lugar</label>
						<input
							type="text"
							placeholder="Ej: Sala 204"
							bind:value={formLocation}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="text-sm font-medium text-slate-600">Inicio</label>
						<input
							type="time"
							bind:value={formStart}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
						/>
					</div>
					<div>
						<label class="text-sm font-medium text-slate-600">Fin</label>
						<input
							type="time"
							bind:value={formEnd}
							class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button
						type="button"
						class="px-4 py-2 cursor-pointer rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
						onclick={closeModal}
					>
						Cancelar
					</button>
					<button
						type="button"
						class="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
						onclick={saveHorario}
					>
						Guardar
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
