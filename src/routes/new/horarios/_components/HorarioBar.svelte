<script lang="ts">
	import { ChevronLeft, ChevronRight, Plus, Calendar } from '@lucide/svelte';

	interface Props {
		weekStart: string;
		showCalendarEvents: boolean;
		onToggleCalendar: () => void;
		onPrevWeek: () => void;
		onNextWeek: () => void;
		onAddClass: () => void;
	}

	let {
		weekStart,
		showCalendarEvents,
		onToggleCalendar,
		onPrevWeek,
		onNextWeek,
		onAddClass
	}: Props = $props();

	const weekLabel = $derived.by(() => {
		const d = new Date(weekStart + 'T12:00:00');
		const end = new Date(d);
		end.setDate(end.getDate() + 6);
		const fmt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
		return `${d.toLocaleDateString('es-ES', fmt)} – ${end.toLocaleDateString('es-ES', fmt)}`;
	});
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4">
	<div class="flex items-center gap-3">
		<button
			onclick={onToggleCalendar}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer {showCalendarEvents
				? 'bg-primary-100 text-base-100 border-primary-100'
				: 'bg-base-100 text-content/60 border-base-400 hover:border-primary-100 hover:text-content'}"
			title="Mostrar eventos del calendario"
		>
			<Calendar class="w-4 h-4" />
			<span class="max-sm:hidden">Calendario</span>
		</button>

		<div class="flex items-center gap-1">
			<button
				onclick={onPrevWeek}
				class="p-1.5 rounded-lg border border-base-400 text-content/60 hover:bg-base-200 transition-colors cursor-pointer"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<span class="text-sm font-semibold text-content px-2 min-w-[160px] text-center">{weekLabel}</span>
			<button
				onclick={onNextWeek}
				class="p-1.5 rounded-lg border border-base-400 text-content/60 hover:bg-base-200 transition-colors cursor-pointer"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>

		<button
			onclick={onAddClass}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer ml-auto"
		>
			<Plus class="w-4 h-4" />
			<span class="max-sm:hidden">Clase</span>
		</button>
	</div>
</div>
