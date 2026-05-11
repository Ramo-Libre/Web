<script lang="ts">
	import type { Horario, HorarioType } from '$lib/state/horarios.svelte';
	import { Pencil, Trash2, BookOpen, FlaskConical, Users, Hammer } from '@lucide/svelte';

	interface Props {
		horario: Horario;
		color: string;
		onEdit: (horario: Horario) => void;
		onRemove: (id: string) => void;
	}

	let { horario, color, onEdit, onRemove }: Props = $props();
	const TypeIcon = $derived(iconFor(horario.type));

	const iconOptions = [
		{ id: 'book', label: 'Clase', Icon: BookOpen },
		{ id: 'lab', label: 'Lab', Icon: FlaskConical },
		{ id: 'assist', label: 'Ayudantía', Icon: Users },
		{ id: 'taller', label: 'Taller', Icon: Hammer }
	] as const;

	function iconFor(type: HorarioType) {
		return iconOptions.find((o) => o.id === type)?.Icon ?? BookOpen;
	}
</script>

<div
	class="flex items-center justify-between rounded-lg border border-base-400 bg-base-100 px-4 py-3 hover:bg-base-200 transition-colors"
>
	<div class="flex items-center gap-3">
		<div
			class="inline-flex h-9 w-9 items-center justify-center rounded-lg font-bold border"
			style="background-color: {color}20; border-color: {color}; color: {color}"
		>
			{horario.day}
		</div>
		<div class="flex max-sm:flex-col sm:items-center max-sm:justify-center gap-1 sm:gap-4">
			<div class="text-sm font-black text-content">{horario.start} - {horario.end}</div>
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
			onclick={() => onEdit(horario)}
		>
			<Pencil class="w-4 h-4" />
		</button>
		<button
			class="hover:text-error-100 p-2 rounded-lg hover:bg-error-400 transition-colors cursor-pointer"
			aria-label="Eliminar"
			onclick={() => onRemove(horario.id)}
		>
			<Trash2 class="w-4 h-4" />
		</button>
	</div>
</div>
