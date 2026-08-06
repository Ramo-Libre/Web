<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { getNow } from '$lib/utils/date';

	let {
		value,
		onChange,
		label = ''
	}: { value: string; onChange: (date: string) => void; label?: string } = $props();

	const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	const ds = (y: number, m: number, d: number) =>
		`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	const dim = (y: number, m: number) => new Date(y, m, 0).getDate();

	const today = $derived.by(() => {
		const t = getNow();
		return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
	});

	let viewYear = $state(getNow().getFullYear());
	let viewMonth = $state(getNow().getMonth() + 1);

	$effect(() => {
		if (!value) return;
		const [y, m] = value.split('-').map(Number);
		const vY = untrack(() => viewYear);
		const vM = untrack(() => viewMonth);
		if (y !== vY || m !== vM) {
			viewYear = y;
			viewMonth = m;
		}
	});

	const monthLabel = $derived(
		new Date(viewYear, viewMonth - 1).toLocaleDateString('es-ES', {
			month: 'long',
			year: 'numeric'
		})
	);

	const cells = $derived.by(() => {
		const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
		const firstDowMon = firstDow === 0 ? 6 : firstDow - 1;
		const totalDays = dim(viewYear, viewMonth);
		const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
		const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
		const prevTotal = dim(prevY, prevM);
		const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
		const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;

		const out: { day: number; dateStr: string; inMonth: boolean }[] = [];
		for (let i = firstDowMon - 1; i >= 0; i--) {
			const d = prevTotal - i;
			out.push({ day: d, dateStr: ds(prevY, prevM, d), inMonth: false });
		}
		for (let d = 1; d <= totalDays; d++) {
			out.push({ day: d, dateStr: ds(viewYear, viewMonth, d), inMonth: true });
		}
		let nd = 1;
		while (out.length % 7 !== 0) {
			out.push({ day: nd, dateStr: ds(nextY, nextM, nd), inMonth: false });
			nd++;
		}
		return out;
	});

	function prevMonth() {
		if (viewMonth === 1) {
			viewMonth = 12;
			viewYear--;
		} else {
			viewMonth--;
		}
	}

	function nextMonth() {
		if (viewMonth === 12) {
			viewMonth = 1;
			viewYear++;
		} else {
			viewMonth++;
		}
	}

	let touchX = 0;

	function onTouchStart(e: TouchEvent) {
		touchX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 40) {
			if (dx < 0) nextMonth();
			else prevMonth();
		}
	}
</script>

<div
	class="select-none"
	role="group"
	aria-label="Selector de fecha"
	ontouchstart={onTouchStart}
	ontouchend={onTouchEnd}
>
	{#if label}
		<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-2">
			{label}
		</div>
	{/if}
	<div class="flex items-center justify-between mb-2">
		<button
			type="button"
			onclick={prevMonth}
			class="p-1 rounded-md text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
			aria-label="Mes anterior"
		>
			<ChevronLeft class="w-4 h-4" />
		</button>
		<span class="text-sm font-bold text-content capitalize">{monthLabel}</span>
		<button
			type="button"
			onclick={nextMonth}
			class="p-1 rounded-md text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
			aria-label="Mes siguiente"
		>
			<ChevronRight class="w-4 h-4" />
		</button>
	</div>
	<div class="grid grid-cols-7">
		{#each dayHeaders as h, i (i)}
			<div class="py-1 text-center text-[10px] font-semibold text-content/40">{h}</div>
		{/each}
		{#each cells as cell (cell.dateStr)}
			{@const isSelected = cell.dateStr === value}
			{@const isToday = cell.dateStr === today}
			<button
				type="button"
				onclick={() => onChange(cell.dateStr)}
				class="h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-colors cursor-pointer {cell.inMonth
					? ''
					: 'opacity-30'} {isSelected
					? 'bg-primary-100 text-base-100'
					: isToday
						? 'bg-calendar-400'
						: 'hover:bg-calendar-400'}"
			>
				{cell.day}
			</button>
		{/each}
	</div>
	<div class="flex items-center justify-between mt-2">
		<button
			type="button"
			onclick={() => onChange(today)}
			class="text-xs font-semibold text-primary-100 hover:underline cursor-pointer"
		>
			Hoy
		</button>
		{#if value}
			<button
				type="button"
				onclick={() => onChange('')}
				class="text-xs font-semibold text-content/40 hover:text-content/70 cursor-pointer"
			>
				Limpiar
			</button>
		{/if}
	</div>
</div>
