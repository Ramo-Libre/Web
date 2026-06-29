<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		X,
		Clock,
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Ellipsis,
		ChevronDown
	} from '@lucide/svelte';
	import type { ScheduleEvent, ScheduleCategory } from '$lib/features/schedule.svelte';

	const CATEGORIES: { value: ScheduleCategory; label: string; icon: typeof Book }[] = [
		{ value: 'exam', label: 'Examen', icon: Presentation },
		{ value: 'urgent', label: 'Urgente', icon: CircleAlert },
		{ value: 'book', label: 'Libro', icon: Book },
		{ value: 'lab', label: 'Lab', icon: FlaskConical },
		{ value: 'assist', label: 'Asistencia', icon: Users },
		{ value: 'taller', label: 'Taller', icon: Wrench },
		{ value: 'event', label: 'Evento', icon: Clock },
		{ value: 'other', label: 'Otro', icon: Ellipsis }
	];

	interface Props {
		event: ScheduleEvent | null;
		prefillDate?: string;
		onClose: () => void;
		onSave: (data: { id?: string; title?: string; description?: string; category: ScheduleCategory; ramoId?: string; date?: string; startTime?: string; endTime?: string }) => void;
		onDelete?: (id: string) => void;
	}

	let { event, prefillDate, onClose, onSave, onDelete }: Props = $props();

	const isEdit = $derived(!!event);
	const ramos = $derived(semestre.ramos.list);

	let title = $state(event?.title ?? '');
	let category = $state<ScheduleCategory>(event?.category ?? 'other');
	let ramoId = $state(event?.ramoId ?? '');
	let date = $state(event?.date ?? prefillDate ?? '');
	let showTime = $state(!!(event?.startTime || event?.endTime));
	let startTime = $state(event?.startTime ?? '');
	let endTime = $state(event?.endTime ?? '');
	let description = $state(event?.description ?? '');
	let showRamoDropdown = $state(false);

	function handleSubmit() {
		showRamoDropdown = false;
		onSave({
			id: event?.id,
			title: title || undefined,
			description: description || undefined,
			category,
			ramoId: ramoId || undefined,
			date: date || undefined,
			startTime: startTime || undefined,
			endTime: endTime || undefined
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') { showRamoDropdown = false; onClose(); }
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-ramo-dropdown]')) showRamoDropdown = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4"
	role="dialog"
	aria-modal="true"
>
	<button
		class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
		aria-label="Cerrar"
		onclick={onClose}
	></button>

	<div
		class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
	>
		<div class="flex items-center justify-between mb-6">
			<h3 class="text-lg font-bold text-content">
				{isEdit ? 'Editar evento' : 'Nuevo evento'}
			</h3>
			<button
				onclick={onClose}
				class="p-1 rounded-lg text-content/40 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
				aria-label="Cerrar"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Título</label>
				<input
					type="text"
					bind:value={title}
					placeholder="Título del evento"
					class="w-full bg-base-100 border border-base-400 rounded-lg px-3 py-2 text-sm text-content outline-none focus:border-primary-100 placeholder-content/30"
				/>
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-2">Categoría</label>
				<div class="flex flex-wrap gap-2">
					{#each CATEGORIES as cat}
						<button
							type="button"
							onclick={() => (category = cat.value)}
							title={cat.label}
							class="p-2.5 rounded-lg border transition-all cursor-pointer {category ===
							cat.value
								? 'bg-primary-100 text-base-100 border-primary-100'
								: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
						>
							<cat.icon class="w-5 h-5" />
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Ramo</label>
				<div class="relative" data-ramo-dropdown>
					<button
						type="button"
						onclick={() => (showRamoDropdown = !showRamoDropdown)}
						class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors cursor-pointer"
					>
						{#if ramoId}
							{@const r = semestre.ramos.get(ramoId)}
							<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {r?.color}"></span>
							<span class="flex-1 text-left">{r?.name || '—'}</span>
						{:else}
							<span class="text-content/40 flex-1 text-left">—</span>
						{/if}
						<ChevronDown class="w-4 h-4 text-content/30" />
					</button>
					{#if showRamoDropdown}
						<div class="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-400 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
							<button
								type="button"
								onclick={() => { ramoId = ''; showRamoDropdown = false; }}
								class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content/50 hover:bg-base-200 transition-colors text-left cursor-pointer"
							>
								—
							</button>
							{#each ramos as [id, ramo]}
								<button
									type="button"
									onclick={() => { ramoId = id; showRamoDropdown = false; }}
									class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content hover:bg-base-200 transition-colors text-left cursor-pointer {ramoId === id ? 'bg-base-200' : ''}"
								>
									<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"></span>
									<span>{ramo.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Fecha</label>
				<div class="flex items-center gap-2">
					<input
						type="date"
						bind:value={date}
						class="flex-1 bg-base-100 border border-base-400 rounded-lg px-3 py-2 text-sm text-content outline-none focus:border-primary-100"
					/>
					<button
						type="button"
						onclick={() => (showTime = !showTime)}
						class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer shrink-0 {showTime
							? 'bg-primary-100 text-base-100 border-primary-100 hover:opacity-90'
							: 'border-base-400 text-content/50 hover:text-content hover:border-primary-100'}"
					>
						<Clock class="w-4 h-4" />
						<span class="max-sm:hidden">{showTime ? 'Quitar' : 'Horario'}</span>
					</button>
				</div>
			</div>

			{#if showTime}
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="text-sm font-semibold text-content/70 block mb-1">Inicio</label>
						<input
							type="time"
							bind:value={startTime}
							class="w-full bg-base-100 border border-base-400 rounded-lg px-3 py-2 text-sm text-content outline-none focus:border-primary-100"
						/>
					</div>
					<div>
						<label class="text-sm font-semibold text-content/70 block mb-1">Fin</label>
						<input
							type="time"
							bind:value={endTime}
							class="w-full bg-base-100 border border-base-400 rounded-lg px-3 py-2 text-sm text-content outline-none focus:border-primary-100"
						/>
					</div>
				</div>
			{/if}

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Descripción</label>
				<textarea
					bind:value={description}
					placeholder="Notas adicionales..."
					rows="3"
					maxlength="150"
					class="w-full bg-base-100 border border-base-400 rounded-lg px-3 py-2 text-sm text-content outline-none focus:border-primary-100 placeholder-content/30 resize-none"
				></textarea>
				<span class="text-[10px] text-content/30 mt-0.5 block text-right">{description.length}/150</span>
			</div>

			<div class="flex items-center justify-between pt-2">
				<div>
					{#if isEdit && onDelete}
						<button
							type="button"
							onclick={() => { if (event) onDelete(event.id); }}
							class="px-3 py-2 rounded-lg text-error-100 text-sm font-semibold hover:bg-error-400 transition-colors cursor-pointer"
						>
							Eliminar
						</button>
					{/if}
				</div>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={onClose}
						class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 transition-colors cursor-pointer text-sm"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="px-4 py-2 rounded-lg bg-primary-100 text-base-100 font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm"
					>
						{isEdit ? 'Guardar' : 'Crear'}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
