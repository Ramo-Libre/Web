<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { getNow } from '$lib/utils/date';
	import { timeTravel } from '$lib/pages/_components/dev-tools/dev-tools-time.svelte';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';
	import {
		ChevronLeft,
		ChevronRight,
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Clock,
		Ellipsis
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

	interface Props {
		events: ScheduleEvent[];
		selectedDate?: string | null;
		onDaySelect?: (dateStr: string) => void;
	}

	let { events, selectedDate, onDaySelect }: Props = $props();

	const todayStr = $derived.by(() => {
		const today = getNow();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	});

	let year = $state(getNow().getFullYear());
	let month = $state(getNow().getMonth() + 1);

	let lastTravelKey = '';
	$effect(() => {
		const key = `${timeTravel.enabled}:${timeTravel.date}`;
		if (key === lastTravelKey) return;
		lastTravelKey = key;
		const now = getNow();
		year = now.getFullYear();
		month = now.getMonth() + 1;
	});

	$effect(() => {
		if (selectedDate) {
			const d = new Date(selectedDate + 'T12:00:00');
			if (!isNaN(d.getTime())) {
				year = d.getFullYear();
				month = d.getMonth() + 1;
			}
		}
	});

	const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	function ds(y: number, m: number, d: number): string {
		return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	}

	function dim(y: number, m: number): number {
		return new Date(y, m, 0).getDate();
	}

	function ramoColor(ramoId?: string): string {
		if (!ramoId) return 'var(--color-primary-100)';
		const r = semestre.ramos.get(ramoId);
		return r?.color ?? 'var(--color-primary-100)';
	}

	const weeks = $derived.by(() => {
		const firstDow = new Date(year, month - 1, 1).getDay();
		const firstDowMon = firstDow === 0 ? 6 : firstDow - 1;
		const totalDays = dim(year, month);
		const prevM = month === 1 ? 12 : month - 1;
		const prevY = month === 1 ? year - 1 : year;
		const prevTotal = dim(prevY, prevM);
		const nextM = month === 12 ? 1 : month + 1;
		const nextY = month === 12 ? year + 1 : year;

		const cells: { day: number; dateStr: string; isCurrent: boolean; events: ScheduleEvent[] }[] =
			[];

		for (let i = firstDowMon - 1; i >= 0; i--) {
			const d = prevTotal - i;
			const s = ds(prevY, prevM, d);
			cells.push({
				day: d,
				dateStr: s,
				isCurrent: false,
				events: events.filter((e) => semestre.schedule.isActiveOnDate(e, s))
			});
		}
		for (let d = 1; d <= totalDays; d++) {
			const s = ds(year, month, d);
			cells.push({
				day: d,
				dateStr: s,
				isCurrent: true,
				events: events.filter((e) => semestre.schedule.isActiveOnDate(e, s))
			});
		}
		let nd = 1;
		while (cells.length % 7 !== 0) {
			const s = ds(nextY, nextM, nd);
			cells.push({
				day: nd,
				dateStr: s,
				isCurrent: false,
				events: events.filter((e) => semestre.schedule.isActiveOnDate(e, s))
			});
			nd++;
		}

		const weeks: (typeof cells)[] = [];
		for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
		return weeks;
	});

	const monthLabel = $derived(
		new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
	);

	function prev() {
		if (month === 1) {
			month = 12;
			year--;
		} else {
			month--;
		}
	}

	function next() {
		if (month === 12) {
			month = 1;
			year++;
		} else {
			month++;
		}
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl">
	<div class="flex items-center justify-between p-4 border-b border-base-300">
		<button
			onclick={prev}
			class="flex items-center gap-1 px-2 py-1 rounded-lg border border-base-400 bg-base-100 text-content/60 hover:bg-base-200 transition-colors text-sm cursor-pointer"
		>
			<ChevronLeft class="w-4 h-4" />
		</button>
		<h2 class="text-base font-bold text-content">{monthLabel}</h2>
		<button
			onclick={next}
			class="flex items-center gap-1 px-2 py-1 rounded-lg border border-base-400 bg-base-100 text-content/60 hover:bg-base-200 transition-colors text-sm cursor-pointer"
		>
			<ChevronRight class="w-4 h-4" />
		</button>
	</div>

	<div class="grid grid-cols-7">
		{#each dayHeaders as h, idx (idx)}
			<div
				class="px-1.5 py-2 text-center text-xs font-semibold text-content/40 border-b border-base-300"
			>
				{h}
			</div>
		{/each}

		{#each weeks as week, idx2 (idx2)}
			{#each week as cell (cell.dateStr)}
				{@const isToday = cell.dateStr === todayStr}
				{@const isSelected = cell.dateStr === selectedDate}
				<button
					class="flex flex-col items-start p-1.5 min-h-[72px] sm:min-h-[88px] border-b border-r border-base-300 text-left transition-colors cursor-pointer {cell.isCurrent
						? ''
						: 'opacity-30'} {isSelected
						? 'bg-primary-100/20 ring-2 ring-inset ring-primary-100'
						: isToday
							? 'bg-calendar-400'
							: 'bg-transparent hover:bg-calendar-400'}"
					onclick={() => onDaySelect?.(cell.dateStr)}
				>
					<span
						class="text-xs font-semibold leading-none mb-auto {isToday
							? 'bg-calendar-100 text-base-100 rounded-full w-5 h-5 flex items-center justify-center'
							: 'text-content/60'}"
					>
						{cell.day}
					</span>
					<div class="flex flex-wrap gap-0.5 mt-auto pt-0.5">
						{#each cell.events.slice(0, 5) as event (event.id)}
							{@const Icon = categoryIcons[event.category] ?? Ellipsis}
							<span class="pointer-events-none" style="color: {ramoColor(event.ramoId)}">
								<Icon class="w-4 h-4" />
							</span>
						{/each}
						{#if cell.events.length > 5}
							<span class="text-xs text-content/40 leading-none">+{cell.events.length - 5}</span>
						{/if}
					</div>
				</button>
			{/each}
		{/each}
	</div>
</div>
