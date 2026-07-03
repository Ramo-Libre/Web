<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import {
		X,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Presentation,
		Clock,
		Ellipsis,
		CircleCheck,
		Circle,
		CircleX,
		HelpCircle,
		ArrowRight,
	} from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ramoDrawer } from '$lib/features/ramosDrawer.svelte';
	import { ColorUtils } from '$lib/utils/colors';
	import type { Escenario } from '$lib/features/notas.svelte';

	const WEEKDAYS: Record<number, string> = {
		1: 'L',
		2: 'M',
		3: 'X',
		4: 'J',
		5: 'V',
		6: 'S',
		7: 'D'
	};

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation,
		book: Book,
		lab: FlaskConical,
		assist: Users,
		taller: Wrench,
		event: Clock,
		other: Ellipsis
	};

	const categoryLabels: Record<string, string> = {
		exam: 'Examen',
		book: 'Clase',
		lab: 'Lab',
		assist: 'Ayudantía',
		taller: 'Taller',
		event: 'Evento',
		other: 'Otro'
	};

	const selectedRamo = $derived(ramoDrawer.id ? semestre.ramos.get(ramoDrawer.id) : null);

	const scheduleEvents = $derived(ramoDrawer.id ? semestre.schedule.getByRamo(ramoDrawer.id) : []);

	const recurringEntries = $derived(
		scheduleEvents
			.filter((e) => e.daysOfWeek && e.daysOfWeek.length > 0)
			.flatMap((event) =>
				event.daysOfWeek!.map((day) => ({ event, day, key: event.id + '-' + day }))
			)
			.sort((a, b) => {
				if (a.day !== b.day) return a.day - b.day;
				return (a.event.startTime ?? '').localeCompare(b.event.startTime ?? '');
			})
	);

	const escenarios = $derived(ramoDrawer.id ? semestre.escenarios.byRamo(ramoDrawer.id) : []);

	beforeNavigate(() => {
		ramoDrawer.close();
	});

	function handleNameChange(e: Event) {
		if (!ramoDrawer.id || !selectedRamo) return;
		const newName = (e.currentTarget as HTMLInputElement).value.trim();
		if (newName) semestre.ramos.update(ramoDrawer.id, { ...selectedRamo, name: newName });
	}

	function handleColorChange(color: string) {
		if (!ramoDrawer.id || !selectedRamo) return;
		semestre.ramos.update(ramoDrawer.id, { ...selectedRamo, color });
	}

	function handleNameKey(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
	}

	function navTo(path: string) {
		ramoDrawer.close();
		goto(path);
	}

	function escenarioStatus(esc: Escenario) {
		if (!esc.lastResult) return { label: 'Sin datos', cls: 'text-content/40', Icon: HelpCircle };
		if (esc.lastResult.feasible && esc.lastResult.probability >= 0.9999)
			return { label: 'Garantizado', cls: 'text-success-100', Icon: CircleCheck };
		if (esc.lastResult.feasible)
			return { label: 'Factible', cls: 'text-primary-100', Icon: Circle };
		return { label: 'No factible', cls: 'text-error-100', Icon: CircleX };
	}
</script>

{#snippet detailContent()}
	{#if selectedRamo}
		<div class="flex items-center gap-4 mb-6">
			<div
				class="w-14 h-14 rounded-xl text-base-100 shadow-md flex items-center justify-center font-bold text-lg shrink-0"
				style="background-color: {selectedRamo.color};"
			>
				{selectedRamo.name.substring(0, 2).toUpperCase()}
			</div>
			<div class="flex-1 min-w-0">
				<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-1">
					Nombre del Ramo
				</div>
				<input
					type="text"
					value={selectedRamo.name}
					onchange={handleNameChange}
					onkeydown={handleNameKey}
					class="w-full bg-transparent border-none outline-none text-2xl font-bold text-content focus:ring-0 p-0"
				/>
			</div>
		</div>
		<div class="border-t border-base-300 pt-4">
			<h3 class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">Color</h3>
			<div class="flex flex-wrap gap-2">
				{#each ColorUtils.COLORS as color (color)}
					<button
						class="w-6 h-6 rounded-sm border border-base-100/20 shadow-sm transition-all hover:scale-110 cursor-pointer {selectedRamo.color ===
						color
							? 'ring-2 ring-content/80 scale-110'
							: ''}"
						style="background-color: {color}"
						title={color}
						onclick={() => handleColorChange(color)}
						aria-label="Elegir color {color}"
					></button>
				{/each}
			</div>
		</div>

		{#if recurringEntries.length > 0}
			<div class="border-t border-base-300 pt-4 mt-4">
				<h3 class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
					Horarios ({recurringEntries.length})
				</h3>
				<div class="space-y-2">
					{#each recurringEntries as entry (entry.key)}
						{@const ev = entry.event}
						{@const CatIcon = categoryIcons[ev.category] ?? Ellipsis}
						{@const dayLetter = WEEKDAYS[entry.day] ?? '?'}
						{@const bgColor = selectedRamo?.color ?? 'var(--color-primary-100)'}
						<div
							class="rounded-md border-l-4 shadow-sm p-3 transition-colors hover:shadow-md"
							style="background-color: {bgColor}10; border-color: {bgColor};"
						>
							<div class="flex items-start gap-2.5">
								<div
									class="flex items-center justify-center rounded-md text-sm font-bold w-9 h-9 shrink-0"
									style="background-color: {bgColor}20; color: {bgColor};"
								>
									{dayLetter}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0 flex-1 flex flex-col gap-1">
											<div class="flex items-center gap-1.5">
												<CatIcon class="h-4 w-4 shrink-0" style="color: {bgColor}" />
												<span class="text-[13px] font-bold leading-tight text-content truncate">
													{ev.title || (categoryLabels[ev.category] ?? ev.category)}
												</span>
											</div>
											<div class="flex items-center gap-1 text-[11px] text-content/50 leading-tight">
												<span>{ev.startTime}–{ev.endTime}</span>
											</div>
										</div>
										{#if ev.description}
											<div class="text-[11px] text-content/50 leading-tight text-right max-w-[140px] shrink-0 line-clamp-3">
												{ev.description}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if escenarios.length > 0}
			<div class="border-t border-base-300 pt-4 mt-4">
				<h3 class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">
					Escenarios ({escenarios.length})
				</h3>
				<div class="space-y-2">
					{#each escenarios as esc (esc.id)}
						{@const { label, cls, Icon } = escenarioStatus(esc)}
						<button
							class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200 cursor-pointer"
							onclick={() => navTo('/new/notas#' + esc.id)}
						>
							<Icon class="h-4 w-4 shrink-0 {cls}" />
							<div class="min-w-0 flex-1">
								<div class="text-sm font-bold text-content truncate">{esc.name}</div>
							</div>
							<span class="text-xs font-medium {cls} shrink-0">{label}</span>
							<ArrowRight class="h-4 w-4 shrink-0 text-content/20" />
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
{/snippet}

{#if ramoDrawer.id !== null}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		in:fly={{ duration: 200 }}
	>
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={() => ramoDrawer.close()}
			aria-label="Cerrar"
		></button>

		<!-- Desktop: right panel -->
		<div
			class="hidden sm:block absolute top-0 right-0 bottom-0 w-[500px] bg-base-100 border-l border-base-400 shadow-2xl overflow-y-auto"
			in:fly={{ x: 380, duration: 250 }}
			out:fly={{ x: 380, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-3 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">Detalle del Ramo</h3>
				<button
					onclick={() => ramoDrawer.close()}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="p-6">
				{@render detailContent()}
			</div>
		</div>

		<!-- Mobile: bottom sheet -->
		<div
			class="sm:hidden absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] overflow-y-auto"
			in:fly={{ y: 100, duration: 250 }}
			out:fly={{ y: 100, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">Detalle del Ramo</h3>
				<button
					onclick={() => ramoDrawer.close()}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="p-6">
				{@render detailContent()}
			</div>
		</div>
	</div>
{/if}
