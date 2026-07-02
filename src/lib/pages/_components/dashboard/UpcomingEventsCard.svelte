<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { goto } from '$app/navigation';
	import {
		CalendarDays,
		FlaskConical,
		Users,
		Wrench,
		Presentation,
		CircleAlert,
		Book,
		Ellipsis,
		Clock
	} from '@lucide/svelte';

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
		book: 'Clase',
		lab: 'Lab',
		assist: 'Ayudantía',
		taller: 'Taller',
		exam: 'Examen'
	};

	let { now }: { now: Date } = $props();

	const todayStr = $derived(now.toISOString().slice(0, 10));
	const weekEndStr = $derived(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

	const upcomingEvents = $derived(
		semestre.schedule
			.getOneOff()
			.filter((e) => e.date && e.date >= todayStr && e.date <= weekEndStr)
			.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
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

<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm lg:self-start">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-1.5">
			<CalendarDays class="h-4 w-4 text-calendar-100" />
			<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Próximos Eventos</h3>
		</div>
	</div>

	{#if upcomingEvents.length > 0}
		<div class="space-y-1">
			{#each upcomingEvents as ev (ev.id)}
				{@const CatIcon = categoryIcons[ev.category] ?? Ellipsis}
				{@const color = ramoColor(ev.ramoId)}
				<button
					onclick={() => goto('/new/calendario#' + ev.id)}
					class="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left hover:bg-base-200 transition-colors cursor-pointer"
				>
					<div class="flex flex-col items-center min-w-[36px]">
						<span class="text-xs lg:text-sm font-bold text-content/40 uppercase">
							{ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }) : ''}
						</span>
						<span class="text-lg lg:text-xl font-bold text-content leading-tight">
							{ev.date ? new Date(ev.date + 'T12:00:00').getDate() : ''}
						</span>
					</div>
					<CatIcon class="h-4 w-4 lg:h-6 lg:w-6 shrink-0" style="color: {color}" />
					<div class="min-w-0 flex-1">
						<div class="text-sm lg:text-base font-bold text-content truncate">{ev.title || categoryLabels[ev.category] || 'Sin título'}</div>
						{#if ev.ramoId}
							<div class="text-xs lg:text-sm text-content/50">{ramoName(ev.ramoId)}</div>
						{/if}
					</div>
					{#if ev.startTime}
						<span class="text-xs lg:text-sm font-mono text-content/40 shrink-0">{ev.startTime}</span>
					{/if}
				</button>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-4 text-content/40">
			<CalendarDays class="h-6 w-6 mb-1.5" />
			<p class="text-sm lg:text-base">No hay eventos próximos</p>
		</div>
	{/if}
</div>
