<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		Plus,
		ChevronDown,
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Ellipsis,
		Clock,
		Calendar
	} from '@lucide/svelte';
	import type { ScheduleCategory } from '$lib/features/schedule.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	const CATEGORIES: { value: ScheduleCategory; icon: typeof Book }[] = [
		{ value: 'exam', icon: Presentation },
		{ value: 'urgent', icon: CircleAlert },
		{ value: 'book', icon: Book },
		{ value: 'lab', icon: FlaskConical },
		{ value: 'assist', icon: Users },
		{ value: 'taller', icon: Wrench },
		{ value: 'event', icon: Clock },
		{ value: 'other', icon: Ellipsis }
	];

	interface Props {
		selectedRamo: string | null;
		selectedCategories: SvelteSet<ScheduleCategory>;
		showHorarios: boolean;
		onRamoChange: (ramoId: string | null) => void;
		onCategoriesChange: (categories: SvelteSet<ScheduleCategory>) => void;
		onToggleHorarios: () => void;
		onAddEvent: () => void;
	}

	let {
		selectedRamo,
		selectedCategories,
		showHorarios,
		onRamoChange,
		onCategoriesChange,
		onToggleHorarios,
		onAddEvent
	}: Props = $props();

	const ramos = $derived(semestre.ramos.list);
	let showRamoDropdown = $state(false);

	function toggleCategory(cat: ScheduleCategory) {
		const next = new SvelteSet(selectedCategories);
		if (next.has(cat)) next.delete(cat);
		else next.add(cat);
		onCategoriesChange(next);
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-vb-ramo]')) showRamoDropdown = false;
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="bg-base-100 border border-base-400 rounded-xl p-4">
	<!-- Mobile: stacked layout -->
	<div class="sm:hidden flex flex-col gap-1.5">
		<div class="grid grid-cols-[1fr_auto] gap-1.5">
			<div class="grid grid-cols-4 gap-1.5">
				{#each CATEGORIES as cat (cat.value)}
					<button
						onclick={() => toggleCategory(cat.value)}
						title={cat.value}
						class="p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center {selectedCategories.has(
							cat.value
						)
							? 'bg-primary-100 text-base-100 border-primary-100'
							: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					>
						<cat.icon class="w-4 h-4" />
					</button>
				{/each}
			</div>
			<div class="flex flex-col gap-1.5">
				<div class="relative" data-vb-ramo>
					<button
						type="button"
						onclick={() => (showRamoDropdown = !showRamoDropdown)}
						class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors cursor-pointer w-full"
					>
						{#if selectedRamo}
							{@const r = semestre.ramos.get(selectedRamo)}
							<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {r?.color}"></span>
							<span class="text-left truncate">{r?.name || 'Todos los ramos'}</span>
						{:else}
							<span class="text-content/50 text-left">Todos los ramos</span>
						{/if}
						<ChevronDown class="w-4 h-4 text-content/30 shrink-0" />
					</button>
					{#if showRamoDropdown}
						<div
							class="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-400 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[180px]"
						>
							<button
								type="button"
								onclick={() => {
									onRamoChange(null);
									showRamoDropdown = false;
								}}
								class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content/50 hover:bg-base-200 transition-colors text-left cursor-pointer"
							>
								Todos los ramos
							</button>
							{#each ramos as [id, ramo] (id)}
								<button
									type="button"
									onclick={() => {
										onRamoChange(id);
										showRamoDropdown = false;
									}}
									class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content hover:bg-base-200 transition-colors text-left cursor-pointer {selectedRamo ===
									id
										? 'bg-base-200'
										: ''}"
								>
									<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
									></span>
									<span>{ramo.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<button
					onclick={onToggleHorarios}
					class="flex items-center justify-center px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {showHorarios
						? 'bg-primary-100 text-base-100 border-primary-100'
						: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
					title="Mostrar horarios"
				>
					<Calendar class="w-4 h-4" />
				</button>
			</div>
		</div>
		<button
			onclick={onAddEvent}
			class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Evento</span>
		</button>
	</div>

	<!-- Desktop: inline layout -->
	<div class="hidden sm:flex items-center gap-3">
		<div class="flex items-center gap-3 flex-wrap">
			<div class="relative" data-vb-ramo>
				<button
					type="button"
					onclick={() => (showRamoDropdown = !showRamoDropdown)}
					class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-400 bg-base-100 text-sm text-content outline-none focus:border-primary-100 transition-colors cursor-pointer"
				>
					{#if selectedRamo}
						{@const r = semestre.ramos.get(selectedRamo)}
						<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {r?.color}"></span>
						<span class="text-left">{r?.name || 'Todos los ramos'}</span>
					{:else}
						<span class="text-content/50 text-left">Todos los ramos</span>
					{/if}
					<ChevronDown class="w-4 h-4 text-content/30" />
				</button>
				{#if showRamoDropdown}
					<div
						class="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-400 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[180px]"
					>
						<button
							type="button"
							onclick={() => {
								onRamoChange(null);
								showRamoDropdown = false;
							}}
							class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content/50 hover:bg-base-200 transition-colors text-left cursor-pointer"
						>
							Todos los ramos
						</button>
						{#each ramos as [id, ramo] (id)}
							<button
								type="button"
								onclick={() => {
									onRamoChange(id);
									showRamoDropdown = false;
								}}
								class="w-full flex items-center gap-2 px-3 py-2 text-sm text-content hover:bg-base-200 transition-colors text-left cursor-pointer {selectedRamo ===
								id
									? 'bg-base-200'
									: ''}"
							>
								<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"
								></span>
								<span>{ramo.name}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<button
				onclick={onToggleHorarios}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer shrink-0 {showHorarios
					? 'bg-primary-100 text-base-100 border-primary-100'
					: 'bg-base-100 text-content/60 border-base-400 hover:border-primary-100 hover:text-content'}"
				title="Mostrar horarios"
			>
				<Calendar class="w-4 h-4" />
				<span>Horarios</span>
			</button>

			<span class="w-px h-5 bg-base-300"></span>

			{#each CATEGORIES as cat (cat.value)}
				<button
					onclick={() => toggleCategory(cat.value)}
					title={cat.value}
					class="p-2 rounded-lg border transition-all cursor-pointer {selectedCategories.has(
						cat.value
					)
						? 'bg-primary-100 text-base-100 border-primary-100'
						: 'bg-base-100 text-content/40 border-base-400 hover:border-primary-100 hover:text-content'}"
				>
					<cat.icon class="w-4 h-4" />
				</button>
			{/each}
		</div>

		<button
			onclick={onAddEvent}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0 ml-auto"
		>
			<Plus class="w-4 h-4" />
			<span>Evento</span>
		</button>
	</div>
</div>
