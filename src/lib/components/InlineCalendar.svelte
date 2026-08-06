<script lang="ts">
	import { X, ChevronLeft, ChevronRight, ChevronDown } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
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

	let drawerOpen = $state(false);

	const formattedValue = $derived(
		value
			? new Date(`${value}T12:00:00`).toLocaleDateString('es-ES', {
					weekday: 'short',
					day: 'numeric',
					month: 'short'
				})
			: ''
	);

	$effect(() => {
		if (!drawerOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopImmediatePropagation();
				drawerOpen = false;
			}
		};
		window.addEventListener('keydown', handler, true);
		return () => window.removeEventListener('keydown', handler, true);
	});

	function openDrawer() {
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
	}
</script>

{#snippet calendarGrid()}
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
{/snippet}

<div
	class="hidden sm:block select-none"
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
	{@render calendarGrid()}
</div>

<div class="sm:hidden">
	{#if label}
		<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-2">
			{label}
		</div>
	{/if}
	<button
		type="button"
		onclick={openDrawer}
		class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer text-sm {value
			? 'border-base-400 text-content'
			: 'border-base-400/60 text-content/30'}"
	>
		<span class="font-semibold">{value ? formattedValue : 'Seleccionar fecha'}</span>
		<ChevronDown class="w-4 h-4 shrink-0 text-content/40" />
	</button>
</div>

{#if drawerOpen}
	<div class="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
		<button
			type="button"
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={closeDrawer}
			aria-label="Cerrar"
		></button>
		<div
			class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] flex flex-col"
			in:fly={{ y: 100, duration: 250 }}
			out:fly={{ y: 100, duration: 200 }}
		>
			<div
				class="shrink-0 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">{label || 'Seleccionar fecha'}</h3>
				<button
					onclick={closeDrawer}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="flex-1 overflow-y-auto px-6 py-4">
				<div
					class="select-none"
					role="group"
					aria-label="Selector de fecha"
					ontouchstart={onTouchStart}
					ontouchend={onTouchEnd}
				>
					{@render calendarGrid()}
				</div>
			</div>
			<div
				class="shrink-0 px-6 py-4 border-t border-base-300 pb-[max(env(safe-area-inset-bottom,0px),1rem)]"
			>
				<button
					type="button"
					onclick={closeDrawer}
					class="w-full px-4 py-2 rounded-lg bg-primary-100 text-base-100 font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm"
				>
					Listo
				</button>
			</div>
		</div>
	</div>
{/if}
