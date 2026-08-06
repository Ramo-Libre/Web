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
		Ellipsis
	} from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import type { ScheduleEvent, ScheduleCategory } from '$lib/features/schedule.svelte';
	import { SCHEDULE_DESC_MAX_LENGTH } from '$lib/features/schedule.svelte';
	import InlineCalendar from '$lib/components/InlineCalendar.svelte';

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

	const CATEGORY_ICONS: Record<string, typeof Book> = {};
	for (const c of CATEGORIES) CATEGORY_ICONS[c.value] = c.icon;

	interface Props {
		event: ScheduleEvent | null;
		prefillDate?: string;
		onClose: () => void;
		onSave: (data: {
			id?: string;
			title?: string;
			description?: string;
			category: ScheduleCategory;
			ramoId?: string;
			date?: string;
			startTime?: string;
			endTime?: string;
		}) => void;
		onDelete?: (id: string) => void;
	}

	let { event, prefillDate, onClose, onSave, onDelete }: Props = $props();

	const isEdit = $derived(!!event);
	const ramos = $derived(semestre.ramos.list);

	let title = $derived(event?.title ?? '');
	let category = $derived<ScheduleCategory>(event?.category ?? 'other');
	let ramoId = $derived(event?.ramoId ?? '');
	let date = $derived(event?.date ?? prefillDate ?? '');
	let showTime = $derived(!!(event?.startTime || event?.endTime));
	let startTime = $derived(event?.startTime ?? '');
	let endTime = $derived(event?.endTime ?? '');
	let description = $derived(event?.description ?? '');

	const selectedRamo = $derived(ramoId ? semestre.ramos.get(ramoId) : null);

	const badgeColor = $derived(selectedRamo?.color ?? 'var(--color-primary-100)');
	const BadgeIcon = $derived(CATEGORY_ICONS[category] ?? Ellipsis);

	function handleSubmit() {
		if (!date) return;
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
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function resizeTextarea(el: HTMLTextAreaElement) {
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50" role="dialog" aria-modal="true">
	<button
		class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
		onclick={onClose}
		aria-label="Cerrar"
	></button>

	<!-- Desktop: right panel -->
	<div
		class="max-sm:hidden absolute top-0 right-0 bottom-0 w-[{SCHEDULE_DESC_MAX_LENGTH}px] bg-base-100 border-l border-base-400 shadow-2xl flex flex-col"
		in:fly={{ x: 380, duration: 250 }}
		out:fly={{ x: 380, duration: 200 }}
	>
		<div
			class="shrink-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-3 border-b border-base-300"
		>
			<h3 class="text-lg font-bold text-content">{isEdit ? 'Editar evento' : 'Nuevo evento'}</h3>
			<button
				onclick={onClose}
				class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
				aria-label="Cerrar"
			>
				<X size={20} />
			</button>
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="flex flex-col flex-1 min-h-0"
		>
			<div class="flex-1 overflow-y-auto">
				<div class="p-6 space-y-6">
					<div class="flex items-center gap-4">
						<div
							class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
							style="background: {badgeColor}15; color: {badgeColor}"
						>
							<BadgeIcon class="w-6 h-6" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-1">
								Título
							</div>
							<input
								type="text"
								bind:value={title}
								placeholder="Nombre del evento"
								class="w-full bg-transparent border-none outline-none text-2xl font-bold text-content placeholder-content/20 p-0"
							/>
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Fecha
						</div>
						<InlineCalendar value={date} onChange={(d) => (date = d)} />
						<div class="flex items-center gap-3 flex-wrap">
							<button
								type="button"
								onclick={() => {
									if (showTime) {
										startTime = '';
										endTime = '';
									}
									showTime = !showTime;
								}}
								class="flex items-center gap-1.5 text-sm transition-colors cursor-pointer {showTime
									? 'text-primary-100'
									: 'text-content/30 hover:text-content/60'}"
							>
								<Clock class="w-4 h-4" />
								{showTime ? 'Quitar hora' : 'Añadir hora'}
							</button>
						</div>
						{#if showTime}
							<div class="flex items-center gap-2 mt-3">
								<span class="text-sm text-content/40">de</span>
								<input
									type="time"
									bind:value={startTime}
									class="bg-transparent text-sm text-content outline-none border-b border-dashed border-content/20 focus:border-content/50 w-28"
								/>
								<span class="text-sm text-content/40">a</span>
								<input
									type="time"
									bind:value={endTime}
									class="bg-transparent text-sm text-content outline-none border-b border-dashed border-content/20 focus:border-content/50 w-28"
								/>
							</div>
						{/if}
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Categoría
						</div>
						<div class="flex flex-wrap gap-2">
							{#each CATEGORIES as cat (cat.label)}
								<button
									type="button"
									onclick={() => (category = cat.value)}
									title={cat.label}
									class="p-2 rounded-lg transition-all cursor-pointer {category === cat.value
										? 'bg-primary-100/10 text-primary-100'
										: 'text-content/20 hover:text-content/50'}"
								>
									<cat.icon class="w-5 h-5" />
								</button>
							{/each}
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Ramo
						</div>
						<div class="flex flex-wrap gap-2">
							{#each ramos as [id, ramo] (id)}
								<button
									type="button"
									onclick={() => (ramoId = ramoId === id ? '' : id)}
									class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm {ramoId ===
									id
										? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
										: 'text-content/40 border-transparent hover:text-content/70'}"
								>
									<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
									></span>
									<span>{ramo.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Notas
						</div>
						<textarea
							bind:value={description}
							placeholder="Descripción opcional..."
							rows="2"
							maxlength={SCHEDULE_DESC_MAX_LENGTH}
							use:resizeTextarea
							oninput={(e) => resizeTextarea(e.currentTarget as HTMLTextAreaElement)}
							class="w-full bg-transparent text-sm text-content outline-none resize-none placeholder-content/20"
						></textarea>
						<span class="text-[10px] text-content/20 block text-right"
							>{description.length}/{SCHEDULE_DESC_MAX_LENGTH}</span
						>
					</div>
				</div>
			</div>

			<div class="shrink-0 flex items-center justify-between px-6 py-4 border-t border-base-300">
				<div>
					{#if isEdit && onDelete}
						<button
							type="button"
							onclick={() => {
								if (event) onDelete(event.id);
							}}
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
						disabled={!date}
						class="px-4 py-2 rounded-lg bg-primary-100 text-base-100 font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{isEdit ? 'Guardar' : 'Crear'}
					</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Mobile: bottom sheet -->
	<div
		class="sm:hidden absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] flex flex-col"
		in:fly={{ y: 100, duration: 250 }}
		out:fly={{ y: 100, duration: 200 }}
	>
		<div
			class="shrink-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
		>
			<h3 class="text-lg font-bold text-content">{isEdit ? 'Editar evento' : 'Nuevo evento'}</h3>
			<button
				onclick={onClose}
				class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
				aria-label="Cerrar"
			>
				<X size={20} />
			</button>
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="flex flex-col flex-1 min-h-0"
		>
			<div class="flex-1 overflow-y-auto">
				<div class="p-6 space-y-6">
					<div class="flex items-center gap-4">
						<div
							class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
							style="background: {badgeColor}15; color: {badgeColor}"
						>
							<BadgeIcon class="w-6 h-6" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-1">
								Título
							</div>
							<input
								type="text"
								bind:value={title}
								placeholder="Nombre del evento"
								class="w-full bg-transparent border-none outline-none text-2xl font-bold text-content placeholder-content/20 p-0"
							/>
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Fecha
						</div>
						<InlineCalendar value={date} onChange={(d) => (date = d)} />
						<div class="flex items-center gap-3 flex-wrap">
							<button
								type="button"
								onclick={() => {
									if (showTime) {
										startTime = '';
										endTime = '';
									}
									showTime = !showTime;
								}}
								class="flex items-center gap-1.5 text-sm transition-colors cursor-pointer {showTime
									? 'text-primary-100'
									: 'text-content/30 hover:text-content/60'}"
							>
								<Clock class="w-4 h-4" />
								{showTime ? 'Quitar hora' : 'Añadir hora'}
							</button>
						</div>
						{#if showTime}
							<div class="flex items-center gap-2 mt-3">
								<span class="text-sm text-content/40">de</span>
								<input
									type="time"
									bind:value={startTime}
									class="bg-transparent text-sm text-content outline-none border-b border-dashed border-content/20 focus:border-content/50 w-28"
								/>
								<span class="text-sm text-content/40">a</span>
								<input
									type="time"
									bind:value={endTime}
									class="bg-transparent text-sm text-content outline-none border-b border-dashed border-content/20 focus:border-content/50 w-28"
								/>
							</div>
						{/if}
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Categoría
						</div>
						<div class="flex flex-wrap gap-2">
							{#each CATEGORIES as cat (cat.label)}
								<button
									type="button"
									onclick={() => (category = cat.value)}
									title={cat.label}
									class="p-2 rounded-lg transition-all cursor-pointer {category === cat.value
										? 'bg-primary-100/10 text-primary-100'
										: 'text-content/20 hover:text-content/50'}"
								>
									<cat.icon class="w-5 h-5" />
								</button>
							{/each}
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Ramo
						</div>
						<div class="flex flex-wrap gap-2">
							{#each ramos as [id, ramo] (id)}
								<button
									type="button"
									onclick={() => (ramoId = ramoId === id ? '' : id)}
									class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm {ramoId ===
									id
										? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
										: 'text-content/40 border-transparent hover:text-content/70'}"
								>
									<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
									></span>
									<span>{ramo.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="border-t border-base-300 pt-4">
						<div class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
							Notas
						</div>
						<textarea
							bind:value={description}
							placeholder="Descripción opcional..."
							rows="2"
							maxlength={SCHEDULE_DESC_MAX_LENGTH}
							use:resizeTextarea
							oninput={(e) => resizeTextarea(e.currentTarget as HTMLTextAreaElement)}
							class="w-full bg-transparent text-sm text-content outline-none resize-none placeholder-content/20"
						></textarea>
						<span class="text-[10px] text-content/20 block text-right"
							>{description.length}/{SCHEDULE_DESC_MAX_LENGTH}</span
						>
					</div>
				</div>
			</div>

			<div
				class="shrink-0 flex items-center justify-between px-6 py-4 border-t border-base-300 pb-[max(env(safe-area-inset-bottom,0px),1rem)]"
			>
				<div>
					{#if isEdit && onDelete}
						<button
							type="button"
							onclick={() => {
								if (event) onDelete(event.id);
							}}
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
						disabled={!date}
						class="px-4 py-2 rounded-lg bg-primary-100 text-base-100 font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{isEdit ? 'Guardar' : 'Crear'}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
