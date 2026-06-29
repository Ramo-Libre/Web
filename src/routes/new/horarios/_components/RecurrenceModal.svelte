<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		X, ChevronDown, ChevronRight, Clock,
		Presentation, CircleAlert, Book, FlaskConical, Users, Wrench, Ellipsis
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

	const DOW_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

	interface Props {
		event: ScheduleEvent | null;
		prefillDay?: number;
		onClose: () => void;
		onSave: (data: {
			id?: string;
			title?: string;
			description?: string;
			category: ScheduleCategory;
			ramoId?: string;
			daysOfWeek: number[];
			startTime: string;
			endTime: string;
			recurrenceStart?: string;
			recurrenceEnd?: string;
		}) => void;
		onDelete?: (id: string) => void;
	}

	let { event, prefillDay, onClose, onSave, onDelete }: Props = $props();

	let title = $state(event?.title ?? '');
	let category = $state<ScheduleCategory>(event?.category ?? 'exam');
	let ramoId = $state(event?.ramoId ?? '');
	let daysOfWeek = $state<number[]>(event?.daysOfWeek ?? (prefillDay ? [prefillDay] : []));
	let startTime = $state(event?.startTime ?? '08:00');
	let endTime = $state(event?.endTime ?? '09:30');
	let description = $state(event?.description ?? '');
	let recurrenceStart = $state(event?.recurrenceStart ?? '');
	let recurrenceEnd = $state(event?.recurrenceEnd ?? '');
	let showRamoDropdown = $state(false);
	let showRecurrence = $state(!!(event?.recurrenceStart || event?.recurrenceEnd));

	const ramos = $derived(semestre.ramos.list);
	const ramoName = $derived(ramoId ? semestre.ramos.get(ramoId)?.name : '');

	const selectedRamo = $derived(ramos.find(([id]) => id === ramoId));

	function toggleDow(dow: number) {
		if (daysOfWeek.includes(dow)) {
			daysOfWeek = daysOfWeek.filter(d => d !== dow);
		} else {
			daysOfWeek = [...daysOfWeek, dow].sort();
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (daysOfWeek.length === 0) return;
		onSave({
			id: event?.id,
			title: title || undefined,
			description: description || undefined,
			category,
			ramoId: ramoId || undefined,
			daysOfWeek,
			startTime,
			endTime,
			...(showRecurrence ? { recurrenceStart: recurrenceStart || undefined, recurrenceEnd: recurrenceEnd || undefined } : {})
		});
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-hb-ramo]')) showRamoDropdown = false;
	}
</script>

<svelte:window onclick={handleWindowClick} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
	onclick={() => onClose()}
>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="bg-base-100 w-full max-w-md mx-4 rounded-xl shadow-xl border border-base-400 max-h-[90vh] overflow-y-auto"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="flex items-center justify-between p-4 border-b border-base-300">
			<h2 class="text-base font-bold text-content">{event ? 'Editar Horario' : 'Nuevo Horario'}</h2>
			<button onclick={onClose} class="p-1 rounded-lg hover:bg-base-200 transition-colors cursor-pointer text-content/40">
				<X class="w-5 h-5" />
			</button>
		</div>

		<form onsubmit={handleSubmit} class="p-4 space-y-4">
			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Título</label>
				<input
					type="text"
					placeholder="Ej: Clase 1"
					bind:value={title}
					class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors"
				/>
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-2">Categoría</label>
				<div class="flex flex-wrap gap-2">
					{#each CATEGORIES as cat}
						<button
							type="button"
							onclick={() => (category = cat.value)}
							class="p-2.5 rounded-lg border transition-all cursor-pointer {category === cat.value
								? 'bg-primary-100 text-base-100 border-primary-100'
								: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
							title={cat.label}
						>
							<cat.icon class="w-5 h-5" />
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Ramo</label>
				<div class="relative" data-hb-ramo>
					<button
						type="button"
						onclick={() => (showRamoDropdown = !showRamoDropdown)}
						class="flex items-center gap-2 px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors cursor-pointer w-full"
					>
						{#if selectedRamo}
							{@const r = selectedRamo[1]}
							<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {r.color}"></span>
							<span class="text-left truncate">{r.name}</span>
						{:else}
							<span class="text-content/40">Seleccionar ramo</span>
						{/if}
						<ChevronDown class="w-4 h-4 text-content/30 shrink-0 ml-auto" />
					</button>
					{#if showRamoDropdown}
						<div class="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-400 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
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
				<label class="text-sm font-semibold text-content/70 block mb-2">Días</label>
				<div class="flex gap-1.5">
					{#each DOW_LABELS as label, i}
						<button
							type="button"
							onclick={() => toggleDow(i + 1)}
							class="w-10 h-10 rounded-lg border text-sm font-semibold transition-all cursor-pointer {daysOfWeek.includes(i + 1)
								? 'bg-primary-100 text-base-100 border-primary-100'
								: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
						>
							{label}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex gap-3">
				<div class="flex-1">
					<label class="text-sm font-semibold text-content/70 block mb-1">Inicio</label>
					<input
						type="time"
						bind:value={startTime}
						class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors"
					/>
				</div>
				<div class="flex-1">
					<label class="text-sm font-semibold text-content/70 block mb-1">Fin</label>
					<input
						type="time"
						bind:value={endTime}
						class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors"
					/>
				</div>
			</div>

			<div>
				<button
					type="button"
					onclick={() => { if (showRecurrence) { recurrenceStart = ''; recurrenceEnd = ''; } showRecurrence = !showRecurrence; }}
					class="flex items-center gap-2 text-sm font-semibold text-content/60 hover:text-content transition-colors cursor-pointer"
				>
					{#if showRecurrence}
						<ChevronDown class="w-4 h-4" />
					{:else}
						<ChevronRight class="w-4 h-4" />
					{/if}
					Rango de recurrencia
				</button>
				{#if showRecurrence}
					<div class="flex gap-3 mt-2">
						<div class="flex-1">
							<label class="text-sm font-semibold text-content/70 block mb-1">Inicio</label>
							<input
								type="date"
								bind:value={recurrenceStart}
								class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors"
							/>
						</div>
						<div class="flex-1">
							<label class="text-sm font-semibold text-content/70 block mb-1">Fin</label>
							<input
								type="date"
								bind:value={recurrenceEnd}
								class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors"
							/>
						</div>
					</div>
				{/if}
			</div>

			<div>
				<label class="text-sm font-semibold text-content/70 block mb-1">Descripción</label>
				<div class="relative">
					<textarea
						placeholder="Opcional"
						bind:value={description}
						maxlength="150"
						class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors resize-none h-20"
					></textarea>
					<span class="absolute bottom-1.5 right-2 text-[10px] text-content/30">{description.length}/150</span>
				</div>
			</div>

			<div class="flex items-center justify-between pt-2">
				<div>
					{#if event}
						<button
							type="button"
							onclick={() => onDelete?.(event.id)}
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
						disabled={daysOfWeek.length === 0}
						class="px-4 py-2 rounded-lg bg-primary-100 text-base-100 font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{event ? 'Guardar' : 'Crear'}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
