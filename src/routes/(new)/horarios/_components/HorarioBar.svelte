<script lang="ts">
	import { ChevronLeft, ChevronRight, Plus, Calendar, RotateCw } from '@lucide/svelte';
	import { SvelteDate } from 'svelte/reactivity';

	type Orientation = 'normal' | 'rotated';

	interface Props {
		weekStart: string;
		showCalendarEvents: boolean;
		orientation: Orientation;
		onToggleCalendar: () => void;
		onPrevWeek: () => void;
		onNextWeek: () => void;
		onAddClass: () => void;
		onToggleOrientation: () => void;
	}
	let {
		weekStart,
		showCalendarEvents,
		orientation,
		onToggleCalendar,
		onPrevWeek,
		onNextWeek,
		onAddClass,
		onToggleOrientation
	}: Props = $props();

	const weekLabel = $derived.by(() => {
		const d = new Date(weekStart + 'T12:00:00');
		const end = new SvelteDate(d);
		end.setDate(end.getDate() + 6);
		const fmt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
		return `${d.toLocaleDateString('es-ES', fmt)} – ${end.toLocaleDateString('es-ES', fmt)}`;
	});
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-2 sm:p-4">
	<div class="flex items-center gap-1 sm:gap-3 flex-wrap">
		<button
			onclick={onToggleCalendar}
			class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {showCalendarEvents
				? 'bg-primary-100 text-base-100 border-primary-100'
				: 'bg-base-100 text-content/60 border-base-400 hover:border-primary-100 hover:text-content'}"
			title="Mostrar eventos del calendario"
		>
			<Calendar class="w-4 h-4" />
			<span class="max-sm:hidden">Calendario</span>
		</button>

		<div class="flex items-center gap-1 flex-1 min-w-0 justify-center sm:justify-start">
			<button
				onclick={onPrevWeek}
				class="p-1.5 rounded-lg border border-base-400 text-content/60 hover:bg-base-200 transition-colors cursor-pointer shrink-0"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<span class="text-xs sm:text-sm font-semibold text-content px-1 sm:px-2 truncate"
				>{weekLabel}</span
			>
			<button
				onclick={onNextWeek}
				class="p-1.5 rounded-lg border border-base-400 text-content/60 hover:bg-base-200 transition-colors cursor-pointer shrink-0"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>

		<!-- Rotar vista: días en X (normal) <-> días en Y / tiempo en X (rotada) -->
		<button
			onclick={onToggleOrientation}
			class="p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 {orientation ===
			'rotated'
				? 'bg-primary-100 text-base-100 border-primary-100'
				: 'border-base-400 text-content/60 hover:bg-base-200'}"
			title="Rotar vista"
			aria-label="Rotar vista"
		>
			<RotateCw class="w-4 h-4" />
		</button>

		<button
			onclick={onAddClass}
			class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer ml-auto shrink-0"
		>
			<Plus class="w-4 h-4" />
			<span class="max-sm:hidden">Clase</span>
		</button>
	</div>
</div>
