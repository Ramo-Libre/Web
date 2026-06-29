<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';

	interface Props {
		events: ScheduleEvent[];
		onEventClick?: (event: ScheduleEvent) => void;
	}

	let { events, onEventClick }: Props = $props();

	const timed = $derived(events.filter((e) => e.startTime));

	const minH = $derived(timed.length > 0 ? Math.min(...timed.map((e) => parseInt(e.startTime!.split(':')[0]))) : 6);
	const maxH = $derived(timed.length > 0 ? Math.max(...timed.map((e) => parseInt((e.endTime || e.startTime)!.split(':')[0]))) : 23);

	const hours = $derived.by(() => {
		const hs: number[] = [];
		for (let h = Math.max(6, minH - 1); h <= Math.min(23, maxH + 1); h++) hs.push(h);
		return hs;
	});

	const byHour = $derived.by(() => {
		const m = new Map<number, ScheduleEvent[]>();
		for (const e of timed) {
			const h = parseInt(e.startTime!.split(':')[0]);
			if (!m.has(h)) m.set(h, []);
			m.get(h)!.push(e);
		}
		return m;
	});

	function rc(ramoId?: string) {
		if (!ramoId) return 'var(--color-primary-100)';
		return semestre.ramos.get(ramoId)?.color ?? 'var(--color-primary-100)';
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4">
	<div class="relative">
		{#each hours as hour (hour)}
			{@const evs = byHour.get(hour) ?? []}
			<div class="flex gap-2 items-stretch">
				<div class="w-8 shrink-0 pt-[3px] text-right">
					<span class="text-[9px] font-mono text-content/20">{String(hour).padStart(2, '0')}</span>
				</div>
				<div class="flex-1 min-w-0 border-t border-base-300/40 py-[5px]">
					{#each evs as event (event.id)}
						{@const timeLabel = event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime}
						<button
							onclick={() => onEventClick?.(event)}
							class="flex items-center gap-1.5 w-full mb-0.5 last:mb-0 px-1.5 py-0.5 rounded text-left hover:opacity-80 transition-opacity cursor-pointer"
							style="background: {rc(event.ramoId)}15"
						>
							<span class="w-1 h-full min-h-[14px] rounded-sm shrink-0" style="background: {rc(event.ramoId)}"></span>
							<span class="text-[10px] font-mono text-content/40 shrink-0">{timeLabel}</span>
							<span class="text-[11px] font-medium text-content truncate">{event.title || 'Evento'}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
