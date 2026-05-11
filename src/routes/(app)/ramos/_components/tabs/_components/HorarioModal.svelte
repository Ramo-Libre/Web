<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay, HorarioType } from '$lib/state/horarios.svelte';
	import { BookOpen, FlaskConical, Users, Hammer, X } from '@lucide/svelte';

	type Prefill = Partial<
		Pick<Horario, 'ramoId' | 'day' | 'start' | 'end' | 'location' | 'type'>
	> | null;

	interface Props {
		open: boolean;
		onClose: () => void;
		initialHorario?: Horario | null;
		prefill?: Prefill;
		lockRamo?: boolean;
	}

	let { open = false, onClose, initialHorario = null, prefill = null, lockRamo = false }: Props =
		$props();

	const isEditing = $derived.by(() => Boolean(initialHorario));
	const isRamoLocked = $derived.by(() => Boolean(lockRamo));

	const ramos = $derived.by(() => db.ramos.list);
	const ramoColor = $derived.by(() => db.ramos.map.get(ramoId)?.color ?? '#cbd5e1');

	let formDay: HorarioDay = $state('L');
	let formStart = $state('');
	let formEnd = $state('');
	let formLocation = $state('');
	let selectedIcon: HorarioType = $state('book');
	let ramoId = $state('');
	let lastInitKey = $state<string | null>(null);

	const iconOptions = [
		{ id: 'book', label: 'Clase', Icon: BookOpen },
		{ id: 'lab', label: 'Lab', Icon: FlaskConical },
		{ id: 'assist', label: 'Ayudantía', Icon: Users },
		{ id: 'taller', label: 'Taller', Icon: Hammer }
	] as const;

	function resetForm() {
		formDay = 'L';
		formStart = '';
		formEnd = '';
		formLocation = '';
		selectedIcon = 'book';
		ramoId = '';
	}

	const prefillKey = $derived.by(() => (open ? JSON.stringify(prefill ?? {}) : null));

	$effect(() => {
		if (!open) {
			lastInitKey = null;
			return;
		}

		const nextKey = initialHorario?.id ? `edit:${initialHorario.id}` : `new:${prefillKey ?? ''}`;
		if (lastInitKey === nextKey) return;
		lastInitKey = nextKey;

		if (initialHorario) {
			formDay = initialHorario.day;
			formStart = initialHorario.start;
			formEnd = initialHorario.end;
			formLocation = initialHorario.location ?? '';
			selectedIcon = initialHorario.type;
			ramoId = initialHorario.ramoId ?? '';
		} else {
			resetForm();
			if (prefill) {
				formDay = prefill.day ?? formDay;
				formStart = prefill.start ?? formStart;
				formEnd = prefill.end ?? formEnd;
				formLocation = prefill.location ?? formLocation;
				selectedIcon = prefill.type ?? selectedIcon;
				ramoId = prefill.ramoId ?? ramoId;
			}
		}
	});

	function handleCancel() {
		resetForm();
		onClose();
	}

	function handleSubmit() {
		if (!formStart || !formEnd) return;

		if (isEditing && initialHorario) {
			db.horarios.update(initialHorario.id, {
				...initialHorario,
				day: formDay,
				start: formStart,
				end: formEnd,
				location: formLocation.trim() || undefined,
				type: selectedIcon,
				ramoId: ramoId || undefined
			});
		} else {
			db.horarios.add({
				ramoId: ramoId || undefined,
				day: formDay,
				start: formStart,
				end: formEnd,
				location: formLocation.trim() || undefined,
				type: selectedIcon
			});
		}

		resetForm();
		onClose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			aria-label="Cerrar"
			onclick={handleCancel}
		></button>

		<div
			class="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 overflow-hidden"
		>
			<div class="flex items-center justify-between mb-6">
				<div class="text-sm font-bold text-content uppercase tracking-widest">
					{isEditing ? 'Editar horario' : 'Nuevo horario'}
				</div>
				<button
					class="p-2 rounded-lg hover:bg-base-200 text-content/50 hover:text-content cursor-pointer transition-colors"
					onclick={handleCancel}
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="sm:space-y-6 space-y-2">
				<div>
					<div class="text-xs font-bold text-content/60 uppercase tracking-wider mb-3">
						Tipo de bloque
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{#each iconOptions as option (option.id)}
							<button
								class={`inline-flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
									selectedIcon === option.id
										? 'shadow-sm'
										: 'border-base-400 bg-base-100 text-content/60 hover:bg-base-200'
								}`}
								style={selectedIcon === option.id ? `border-color: ${ramoColor}; background-color: ${ramoColor}1f; color: ${ramoColor};` : ''}
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
						<label
							class="text-xs font-bold text-content/60 uppercase tracking-wider"
							for="horario-day">Día</label
						>
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
						<label
							class="text-xs font-bold text-content/60 uppercase tracking-wider"
							for="horario-ramo">Ramo</label
						>
						<select
							id="horario-ramo"
							bind:value={ramoId}
							disabled={isRamoLocked}
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content focus:ring-2 focus:ring-classes-100 focus:outline-none disabled:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60 transition-colors cursor-pointer"
						>
							<option value="">Sin ramo</option>
							{#each ramos as [id, ramo] (id)}
								<option value={id}>{ramo.nombre}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-1.5">
					<label
						class="text-xs font-bold text-content/60 uppercase tracking-wider"
						for="horario-location">Lugar</label
					>
					<input
						id="horario-location"
						type="text"
						placeholder="Ej: Sala 204"
						bind:value={formLocation}
						class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content placeholder-content/30 focus:ring-2 focus:ring-classes-100 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label
							class="text-xs font-bold text-content/60 uppercase tracking-wider"
							for="horario-start">Inicio</label
						>
						<input
							id="horario-start"
							type="time"
							bind:value={formStart}
							class="w-full rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content focus:ring-2 focus:ring-classes-100 focus:outline-none"
						/>
					</div>
					<div class="space-y-1.5">
						<label
							class="text-xs font-bold text-content/60 uppercase tracking-wider"
							for="horario-end">Fin</label
						>
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
						onclick={handleCancel}
					>
						Cancelar
					</button>
					<button
						type="button"
						class="px-5 py-2 cursor-pointer rounded-lg bg-primary-100 text-base-100 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
						onclick={handleSubmit}
					>
						{isEditing ? 'Actualizar' : 'Guardar'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
