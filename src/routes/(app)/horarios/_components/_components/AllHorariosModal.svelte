<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay } from '$lib/state/horarios.svelte';
	import { X, CalendarX2 } from '@lucide/svelte';
	import HorarioModal from '../../../ramos/_components/tabs/_components/HorarioModal.svelte';
	import HorarioListItem from './HorarioListItem.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open = false, onClose }: Props = $props();

	const dayOrder: HorarioDay[] = ['L', 'M', 'X', 'J', 'V', 'S'];



	let editingHorario: Horario | null = $state(null);
	let isEditOpen = $state(false);

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

	function handleClose() {
		closeEdit();
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			aria-label="Cerrar"
			onclick={handleClose}
		></button>

		<div
			class="relative w-full max-w-3xl bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 overflow-hidden max-h-[80vh]"
		>
			<div class="flex items-center justify-between mb-6">
				<div class="text-sm font-bold text-content uppercase tracking-widest">
					Todos los horarios
				</div>
				<button
					class="p-2 rounded-lg hover:bg-base-200 text-content/50 hover:text-content cursor-pointer transition-colors"
					onclick={handleClose}
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="space-y-6 overflow-y-auto pr-1" style="max-height: calc(80vh - 96px);">
				{#if groupedHorarios.length === 0}
					<div class="text-sm text-content/40 flex flex-col justify-center items-center gap-2 py-12">
						<CalendarX2 class="w-8 h-8 opacity-20" />
						No hay horarios agregados.
					</div>
				{:else}
					{#each groupedHorarios as group (group.id)}
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full" style="background-color: {group.color}"></div>
								<h4 class="text-sm font-black text-content uppercase tracking-widest">
									{group.name}
								</h4>
								<span class="text-xs font-bold text-content/40">({group.horarios.length})</span>
							</div>

							{#each group.horarios as horario (horario.id)}
								<HorarioListItem
									horario={horario}
									color={group.color}
									onEdit={openEdit}
									onRemove={removeHorario}
								/>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<HorarioModal open={isEditOpen} onClose={closeEdit} initialHorario={editingHorario} />
{/if}
