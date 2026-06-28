<script lang="ts">
	import { CalendarDays, MapPin, CheckCircle2, Circle } from '@lucide/svelte';
	import { page } from '$app/state';
	import { SvelteMap } from 'svelte/reactivity';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import { getNow } from '$lib/utils/date';

	const prefix = $derived(page.url.pathname.startsWith('/new') ? '/new' : '');
	const calendarPath = $derived(prefix + '/calendario/');

	const todayKey = getNow().toISOString().slice(0, 10);

	function keyToDate(key: string): Date {
		const [y, m, d] = key.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	function formatDayLabel(key: string) {
		const date = keyToDate(key);
		const formatter = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric' });
		const text = formatter.format(date);
		const [weekday, day] = text.split(' ');
		return { weekday, day };
	}

	function formatFullDate(key: string) {
		return new Intl.DateTimeFormat('es-CL', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		}).format(keyToDate(key));
	}

	const eventsByDate = $derived.by(() => {
		const map = new SvelteMap<string, CalendarEvent[]>();
		for (const [, event] of db.events.list) {
			if (event.dueDate < todayKey) continue;
			const key = event.dueDate;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(event);
		}

		for (const [, events] of map) {
			events.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
		}

		return map;
	});

	const eventDates = $derived.by(() =>
		Array.from(eventsByDate.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
	);

	let selectedKey = $state<string | null>(null);

	$effect(() => {
		if (eventDates.length === 0) {
			selectedKey = null;
			return;
		}
		if (!selectedKey || !eventsByDate.has(selectedKey)) {
			selectedKey = eventDates[0];
		}
	});

	const selectedEvents = $derived.by(() =>
		selectedKey ? (eventsByDate.get(selectedKey) ?? []) : []
	);

	function eventBadgeClasses(priority: CalendarEvent['priority']) {
		switch (priority) {
			case 'high':
				return 'bg-error-400 text-error-100 border border-error-300';
			case 'medium':
				return 'bg-warning-400 text-warning-100 border border-warning-300';
			case 'low':
			default:
				return 'bg-success-400 text-success-100 border border-success-300';
		}
	}
</script>

<div class="bg-base-100 rounded-2xl p-5 border border-base-400 shadow-sm flex flex-col min-w-0">
	<div class="flex items-center gap-2 mb-4">
		<CalendarDays class="w-5 h-5 text-calendar-100" />
		<h3 class="text-sm font-bold text-content/50 uppercase tracking-widest">Proximos hitos</h3>
	</div>

	{#if eventDates.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center text-content text-sm">
			<CalendarDays class="w-8 h-8 text-content/40 mb-2" />
			No hay eventos próximos
		</div>
	{:else}
		<div class="overflow-x-auto max-w-[calc(100vw-70px)] days-scroll">
			<div class="grid grid-flow-col auto-cols-[56px] gap-2 w-max pb-2">
				{#each eventDates as key (key)}
					{@const isSelected = key === selectedKey}
					{@const isToday = key === todayKey}
					{@const label = formatDayLabel(key)}
					<button
						class={`min-w-14 h-14 shrink-0 rounded-lg border text-center px-2 py-1 transition-colors cursor-pointer ${
							/* Reemplazo del azul por el token primary */
							isSelected ? 'border-primary-100 bg-primary-400' : 'border-base-400 hover:bg-base-200'
						} ${isToday ? 'ring-1 ring-primary-300' : ''}`}
						onclick={() => (selectedKey = key)}
						aria-label={`Eventos del ${formatFullDate(key)}`}
					>
						<div class="text-[10px] uppercase text-content">{label.weekday}</div>
						<div class="text-lg font-semibold text-content leading-tight">{label.day}</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-3 text-xs font-semibold text-content/80">
			{selectedKey ? `Eventos - ${formatFullDate(selectedKey)}` : ''}
		</div>

		<ul class="mt-2 space-y-2 overflow-y-auto pr-1">
			{#each selectedEvents as ev (ev.id)}
				<li>
					<a
						href={`${calendarPath}#${ev.id}`}
						class="block rounded-lg border border-base-400 bg-base-100 p-2 cursor-pointer hover:bg-base-200"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<div class="font-semibold text-content truncate">{ev.title}</div>
								{#if ev.description}
									<div class="text-xs text-content truncate">{ev.description}</div>
								{/if}
							</div>
							<div class="flex items-center gap-1">
								{#if ev.completed}
									<CheckCircle2 class="w-4 h-4 text-success-100" />
								{:else}
									<Circle class="w-4 h-4 text-content/40" />
								{/if}
							</div>
						</div>

						<div class="mt-2 flex flex-wrap gap-2 text-[11px]">
							<span
								class={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${eventBadgeClasses(
									ev.priority
								)}`}
							>
								{ev.priority === 'high' ? 'Alta' : ev.priority === 'medium' ? 'Media' : 'Baja'}
							</span>
							<span
								class={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
									ev.completed
										? 'bg-success-400 text-success-100 border border-success-300'
										: 'bg-base-300 text-content/80 border border-base-400'
								}`}
							>
								{ev.completed ? 'Completado' : 'Pendiente'}
							</span>
						</div>

						{#if ev.location}
							<div class="mt-2 flex items-center gap-2 text-xs text-content">
								<MapPin class="w-3.5 h-3.5 text-content/50 shrink-0" />
								<span class="truncate min-w-0 flex-1">{ev.location}</span>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.days-scroll {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.days-scroll::-webkit-scrollbar {
		display: none;
	}
</style>
