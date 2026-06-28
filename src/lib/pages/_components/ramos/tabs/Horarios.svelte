<script lang="ts">
	import { Plus, CalendarX2 } from '@lucide/svelte';
	import HorarioModal from './_components/HorarioModal.svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay } from '$lib/state/horarios.svelte';
	import HorarioListItem from '../../shared/HorarioListItem.svelte';

	interface Props {
		selectedRamoId?: string;
	}

	let { selectedRamoId }: Props = $props();

	let isModalOpen = $state(false);
	let editingHorario: Horario | null = $state(null);

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
				<HorarioListItem
					{horario}
					color={db.ramos.map.get(horario.ramoId ?? '')?.color ?? '#cbd5e1'}
					onEdit={openEdit}
					onRemove={removeHorario}
				/>
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
