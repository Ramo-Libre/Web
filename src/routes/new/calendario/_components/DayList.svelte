<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';
	import { Presentation, CircleAlert, Book, FlaskConical, Users, Wrench, Clock, Ellipsis } from '@lucide/svelte';

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation, urgent: CircleAlert, book: Book, lab: FlaskConical,
		assist: Users, taller: Wrench, event: Clock, other: Ellipsis
	};

	interface Props {
		dateStr: string | null;
		events: ScheduleEvent[];
		onEventClick?: (event: ScheduleEvent) => void;
	}

	let { dateStr, events, onEventClick }: Props = $props();

	const sorted = $derived([...events].sort((a, b) => {
		if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
		if (a.startTime) return -1;
		if (b.startTime) return 1;
		return 0;
	}));

	const dayLabel = $derived(dateStr
		? new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
		: null);

	function rc(ramoId?: string) {
		if (!ramoId) return 'var(--color-primary-100)';
		return semestre.ramos.get(ramoId)?.color ?? 'var(--color-primary-100)';
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4">
	{#if !dateStr}
		<p class="text-sm text-content/40 text-center py-6">Selecciona un día.</p>
	{:else}
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-bold text-content capitalize">{dayLabel}</h3>
			<span class="text-[11px] font-mono text-content/40">{events.length}</span>
		</div>

		{#if sorted.length === 0}
			<p class="text-sm text-content/30 text-center py-6">Sin eventos.</p>
		{:else}
			<div class="space-y-1">
				{#each sorted as event (event.id)}
					{@const Icon = categoryIcons[event.category] ?? Ellipsis}
					{@const time = event.startTime ? (event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime) : null}
					<button
						onclick={() => onEventClick?.(event)}
						class="w-full p-2 rounded-lg hover:bg-base-200 transition-colors text-left cursor-pointer"
					>
						<div class="flex items-center gap-2.5">
							<span style="color: {rc(event.ramoId)}" class="shrink-0">
								<Icon class="w-4 h-4" />
							</span>
							<div class="flex-1 min-w-0 flex items-center gap-2">
								<span class="text-sm font-medium text-content truncate">
									{event.title || (event.ramoId ? semestre.ramos.get(event.ramoId)?.name : null) || 'Evento'}
								</span>
							</div>
							{#if time}
								<span class="text-[11px] font-mono text-content/40 shrink-0">{time}</span>
							{:else}
								<span class="text-[10px] text-content/30 shrink-0">Todo el día</span>
							{/if}
						</div>
						{#if event.description}
							<p class="text-[12px] text-content/50 mt-0.5 ml-7 line-clamp-2">{event.description}</p>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{/if}
</div>
