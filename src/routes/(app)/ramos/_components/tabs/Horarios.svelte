<script lang="ts">
	import {
		Plus,
		Pencil,
		Trash2,
		BookOpen,
		FlaskConical,
		Users,
		Hammer,
		X,
		CalendarX2
	} from '@lucide/svelte';
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

	const dayOrder: HorarioDay[] = ['L', 'M', 'X', 'J', 'V', 'S'];

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
			<h3 class="text-sm font-bold text-content/50 uppercase tracking-widest">Horarios</h3>
		</div>
		<button
			class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-100 px-4 py-2 text-sm font-semibold text-base-100 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
			onclick={openNew}
		>
			<Plus class="w-4 h-4" />
			Agregar horario
		</button>
	</div>

	<div class="space-y-2">
		{#if sortedHorarios.length === 0}
			<div class="text-sm text-content/40 flex flex-col justify-center items-center gap-2 mt-20">
				<CalendarX2 class="w-8 h-8 opacity-20" />
				No hay horarios agregados.
			</div>
		{:else}
			{#each sortedHorarios as horario (horario.id)}
				{@const TypeIcon = iconFor(horario.type)}
				<div
					class="flex items-center justify-between rounded-lg border border-base-400 bg-base-100 px-4 py-3 hover:bg-base-200 transition-colors"
				>
					<div class="flex items-center gap-3">
						<div
							class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-classes-400 text-classes-100 font-bold border border-classes-300"
						>
							{horario.day}
						</div>
						<div class="flex max-sm:flex-col sm:items-center max-sm:justify-center gap-1 sm:gap-4">
							<div class="text-sm font-black text-content">
								{horario.start} - {horario.end}
							</div>
							<div class="inline-flex items-center gap-1 text-xs text-content/60">
								<TypeIcon class="w-3.5 h-3.5 text-content/40" />
								{#if horario.location}
									<div class="text-xs">{horario.location}</div>
								{/if}
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2 text-content/40">
						<button
							class="p-2 rounded-lg hover:bg-base-300 hover:text-content transition-colors cursor-pointer"
							aria-label="Editar"
							onclick={() => openEdit(horario)}
						>
							<Pencil class="w-4 h-4" />
						</button>
						<button
							class="hover:text-error-100 p-2 rounded-lg hover:bg-error-400 transition-colors cursor-pointer"
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
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			aria-label="Cerrar"
			onclick={closeModal}
		></button>

		<div class="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 overflow-hidden">
			<div class="flex items-center justify-between mb-6">
				<div class="text-sm font-bold text-content uppercase tracking-widest">
					{editingId ? 'Editar horario' : 'Nuevo horario'}
				</div>
				<button class="p-2 rounded-lg hover:bg-base-200 text-content/50 hover:text-content cursor-pointer transition-colors" onclick={closeModal}>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="space-y-6">
				<div>
					<div class="text-xs font-bold text-content/60 uppercase tracking-wider mb-3">Tipo de bloque</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{#each iconOptions as option (option.id)}
							<button
								class={`inline-flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
									selectedIcon === option.id
										? 'border-classes-300 bg-classes-400 text-classes-100 shadow-sm'
										: 'border-base-400 bg-base-100 text-content/60 hover:bg-base-200'
								}`}
								onclick={() => (selectedIcon = option.id)}
							>
								<option.Icon class="w-5 h-5" />
								<span>{option.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-content/60 uppercase tracking-wider" for="horario-day">Día</label>
						<select
							id="horario-day"
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content focus:ring-2 focus:ring-classes-100 focus:outline-none cursor-pointer"
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
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-content/60 uppercase tracking-wider" for="horario-location">Lugar</label>
						<input
							id="horario-location"
							type="text"
							placeholder="Ej: Sala 204"
							bind:value={formLocation}
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content placeholder-content/30 focus:ring-2 focus:ring-classes-100 focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-content/60 uppercase tracking-wider" for="horario-start">Inicio</label>
						<input
							id="horario-start"
							type="time"
							bind:value={formStart}
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content focus:ring-2 focus:ring-classes-100 focus:outline-none"
						/>
					</div>
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-content/60 uppercase tracking-wider" for="horario-end">Fin</label>
						<input
							id="horario-end"
							type="time"
							bind:value={formEnd}
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content focus:ring-2 focus:ring-classes-100 focus:outline-none"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4 border-t border-base-300">
					<button
						type="button"
						class="px-5 py-2 cursor-pointer rounded-lg border border-base-400 text-content/70 text-sm font-bold hover:bg-base-200 transition-colors"
						onclick={closeModal}
					>
						Cancelar
					</button>
					<button
						type="button"
						class="px-5 py-2 cursor-pointer rounded-lg bg-primary-100 text-base-100 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
						onclick={saveHorario}
					>
						Guardar
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
