<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay } from '$lib/state/horarios.svelte';
	import { CalendarX2, Plus } from '@lucide/svelte';
	import HorarioModal from '../../shared/HorarioModal.svelte';
	import HorarioListItem from '../../shared/HorarioListItem.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const dayOrder: HorarioDay[] = ['L', 'M', 'X', 'J', 'V', 'S'];

	let editingHorario: Horario | null = $state(null);
	let isEditOpen = $state(false);
	let isCreateOpen = $state(false);

	const horarios = $derived.by(() => db.horarios.list.map(([, horario]) => horario));

	const groupedHorarios = $derived.by(() => {
		const groups = new SvelteMap<
			string,
			{
				id: string;
				name: string;
				color: string;
				horarios: Horario[];
			}
		>();

		for (const horario of horarios) {
			const ramoId = horario.ramoId ?? '';
			const ramo = ramoId ? db.ramos.map.get(ramoId) : null;
			const key = ramoId || '__none__';
			const name = ramo?.nombre ?? 'Sin ramo';
			const color = ramo?.color ?? '#cbd5e1';

			if (!groups.has(key)) {
				groups.set(key, { id: key, name, color, horarios: [] });
			}
			groups.get(key)?.horarios.push(horario);
		}

		const result = Array.from(groups.values()).sort((a, b) => {
			if (a.id === '__none__') return 1;
			if (b.id === '__none__') return -1;
			return a.name.localeCompare(b.name);
		});

		for (const group of result) {
			group.horarios.sort((a, b) => {
				const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
				if (dayDiff !== 0) return dayDiff;
				return a.start.localeCompare(b.start);
			});
		}

		return result;
	});

	function openEdit(horario: Horario) {
		editingHorario = horario;
		isEditOpen = true;
	}

	function closeEdit() {
		editingHorario = null;
		isEditOpen = false;
	}

	function removeHorario(id: string) {
		db.horarios.remove(id);
	}

	function openNew() {
		isCreateOpen = true;
	}

	function closeNew() {
		isCreateOpen = false;
	}
</script>

<div class="space-y-6 w-full">
	<div class="rounded-2xl border border-base-400 bg-base-100 p-6 shadow-sm">
		<div class="flex items-center justify-between mb-6">
			<div class="text-sm font-bold text-content uppercase tracking-widest">Todos los horarios</div>
			<button
				class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-100 px-4 py-2 text-sm font-semibold text-base-100 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
				onclick={openNew}
			>
				<Plus class="w-4 h-4" />
				<p class="max-sm:hidden">Agregar horario</p>
			</button>
		</div>

		{#if groupedHorarios.length === 0}
			<div class="text-sm text-content/40 flex flex-col justify-center items-center gap-2 py-12">
				<CalendarX2 class="w-8 h-8 opacity-20" />
				No hay horarios agregados.
			</div>
		{:else}
			<div class="space-y-6">
				{#each groupedHorarios as group (group.id)}
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 rounded-full" style="background-color: {group.color}"></div>
							<h4 class="text-sm font-bold text-content uppercase tracking-widest">
								{group.name}
							</h4>
							<span class="text-xs font-bold text-content/40">({group.horarios.length})</span>
						</div>

						{#each group.horarios as horario (horario.id)}
							<HorarioListItem
								{horario}
								color={group.color}
								onEdit={openEdit}
								onRemove={removeHorario}
							/>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<HorarioModal open={isEditOpen} onClose={closeEdit} initialHorario={editingHorario} />
<HorarioModal open={isCreateOpen} onClose={closeNew} />
