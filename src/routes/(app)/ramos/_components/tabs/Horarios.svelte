<script lang="ts">
	import {
		Plus,
		Pencil,
		Trash2,
		BookOpen,
		FlaskConical,
		Users,
		Hammer,
		CalendarX2
	} from '@lucide/svelte';
	import HorarioModal from './_components/HorarioModal.svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay, HorarioType } from '$lib/state/horarios.svelte';

	interface Props {
		selectedRamoId?: string;
	}

	let { selectedRamoId }: Props = $props();

	let isModalOpen = $state(false);
	let editingHorario: Horario | null = $state(null);

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

	const horarioPrefill = $derived.by(() => (selectedRamoId ? { ramoId: selectedRamoId } : null));

	function openNew() {
		editingHorario = null;
		isModalOpen = true;
	}

	function openEdit(horario: Horario) {
		editingHorario = horario;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		editingHorario = null;
	}

	function removeHorario(id: string) {
		db.horarios.remove(id);
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

<HorarioModal
	open={isModalOpen}
	onClose={closeModal}
	initialHorario={editingHorario}
	prefill={horarioPrefill}
	lockRamo={Boolean(selectedRamoId)}
/>
