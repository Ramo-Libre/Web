<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import {
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Clock,
		Ellipsis
	} from '@lucide/svelte';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation,
		urgent: CircleAlert,
		book: Book,
		lab: FlaskConical,
		assist: Users,
		taller: Wrench,
		event: Clock,
		other: Ellipsis
	};

	const categoryLabels: Record<string, string> = {
		exam: 'Examen',
		urgent: 'Urgente',
		book: 'Libro',
		lab: 'Lab',
		assist: 'Asistencia',
		taller: 'Taller',
		event: 'Evento',
		other: 'Otro'
	};

	interface Props {
		dateStr: string | null;
		events: ScheduleEvent[];
		onEventClick?: (event: ScheduleEvent) => void;
	}

	let { dateStr, events, onEventClick }: Props = $props();

	const allDay = $derived(events.filter((e) => !e.startTime));
	const timed = $derived(events.filter((e) => e.startTime));

	const minHour = $derived(
		timed.length > 0 ? Math.min(...timed.map((e) => parseInt(e.startTime!.split(':')[0]))) : 6
	);
	const maxHour = $derived(
		timed.length > 0
			? Math.max(...timed.map((e) => parseInt((e.endTime || e.startTime)!.split(':')[0])))
			: 23
	);

	const hourRange = $derived.by(() => {
		const start = Math.max(0, minHour - 1);
		const end = Math.min(23, maxHour + 2);
		const hours: number[] = [];
		for (let h = start; h <= end; h++) hours.push(h);
		return hours;
	});

	const eventsByHour = $derived.by(() => {
		const map = new Map<number, ScheduleEvent[]>();
		for (const e of timed) {
			const h = parseInt(e.startTime!.split(':')[0]);
			if (!map.has(h)) map.set(h, []);
			map.get(h)!.push(e);
		}
		return map;
	});

	const dayLabel = $derived(
		dateStr
			? new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
					weekday: 'long',
					day: 'numeric',
					month: 'long'
				})
			: null
	);

	function ramoColor(ramoId?: string): string {
		if (!ramoId) return 'var(--color-primary-100)';
		return semestre.ramos.get(ramoId)?.color ?? 'var(--color-primary-100)';
	}

	function ramoName(ramoId?: string): string {
		if (!ramoId) return '';
		return semestre.ramos.get(ramoId)?.name ?? '';
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl">
	{#if !dateStr}
		<p class="text-sm text-content/40 text-center py-8">Selecciona un día para ver sus eventos.</p>
	{:else}
		<div class="flex items-center justify-between p-5 pb-3 border-b border-base-300">
			<h3 class="text-base font-bold text-content capitalize">{dayLabel}</h3>
			<span class="text-xs font-mono text-content/40"
				>{events.length} evento{events.length !== 1 ? 's' : ''}</span
			>
		</div>

		{#if events.length === 0}
			<div class="text-center py-8">
				<p class="text-sm text-content/40">Sin eventos este día.</p>
				<p class="text-xs text-content/30 mt-1">Selecciona otro día o agrega uno nuevo.</p>
			</div>
		{:else}
			<div class="p-5 pt-4">
				{#if allDay.length > 0}
					<div class="mb-5">
						<span class="text-[11px] font-semibold text-content/40 tracking-wider uppercase"
							>Todo el día</span
						>
						<div class="mt-2 space-y-2">
							{#each allDay as event (event.id)}
								{@const Icon = categoryIcons[event.category] ?? Ellipsis}
								<button
									onclick={() => onEventClick?.(event)}
									class="w-full flex items-start gap-3 p-3 rounded-lg border border-base-400 bg-base-100 hover:bg-base-200 transition-colors text-left cursor-pointer"
								>
									<span
										class="p-2 rounded-lg shrink-0"
										style="background: {ramoColor(event.ramoId)}20; color: {ramoColor(
											event.ramoId
										)}"
									>
										<Icon class="w-4 h-4" />
									</span>
									<div class="flex-1 min-w-0">
										<span class="font-semibold text-sm text-content">
											{event.title || categoryLabels[event.category] || 'Evento'}
										</span>
										{#if event.description}
											<p class="text-xs text-content/50 mt-0.5">{event.description}</p>
										{/if}
										{#if event.ramoId}
											<span class="text-[11px] text-content/30">{ramoName(event.ramoId)}</span>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if timed.length > 0}
					<div class="space-y-0">
						{#each hourRange as hour (hour)}
							{@const evs = eventsByHour.get(hour) ?? []}
							<div class="flex gap-4 py-0.5">
								<div class="w-10 shrink-0 pt-1.5 text-right">
									<span class="text-[11px] font-mono text-content/30"
										>{String(hour).padStart(2, '0')}:00</span
									>
								</div>
								<div class="flex-1 min-w-0 border-t border-base-300/50 pt-1.5">
									{#each evs as event (event.id)}
										{@const Icon = categoryIcons[event.category] ?? Ellipsis}
										{@const timeLabel = event.endTime
											? `${event.startTime} – ${event.endTime}`
											: event.startTime}
										<button
											onclick={() => onEventClick?.(event)}
											class="w-full flex items-start gap-3 p-3 mb-2 last:mb-0 rounded-lg border border-base-400 bg-base-100 hover:bg-base-200 transition-colors text-left cursor-pointer"
										>
											<span
												class="p-2 rounded-lg shrink-0"
												style="background: {ramoColor(event.ramoId)}20; color: {ramoColor(
													event.ramoId
												)}"
											>
												<Icon class="w-4 h-4" />
											</span>
											<div class="flex-1 min-w-0">
												<div class="flex items-center gap-2">
													<span class="text-[11px] font-mono text-primary-100 font-medium shrink-0"
														>{timeLabel}</span
													>
													<span class="font-semibold text-sm text-content truncate">
														{event.title || categoryLabels[event.category] || 'Evento'}
													</span>
													{#if event.ramoId}
														<span
															class="w-2 h-2 rounded-full shrink-0"
															style="background: {ramoColor(event.ramoId)}"
														></span>
													{/if}
												</div>
												{#if event.description}
													<p class="text-xs text-content/50 mt-0.5 line-clamp-2">
														{event.description}
													</p>
												{/if}
												{#if event.ramoId}
													<span class="text-[11px] text-content/30">{ramoName(event.ramoId)}</span>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
