<script lang="ts">
	import {
		CalendarDays,
		List,
		ArrowRightLeft,
		ChevronsRight,
		KanbanSquare,
		AlertTriangle,
		CheckCircle2,
		BarChart3
	} from '@lucide/svelte';

	type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';

	interface Props {
		selectedView: ViewMode;
		onSelectView: (view: ViewMode) => void;
		onOpenEventModal: () => void;
	}

	let {
		selectedView = 'calendar',
		onSelectView,
		onOpenEventModal
	}: Props = $props();
</script>

<div class="space-y-4">
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs uppercase tracking-wider text-blue-500">Próximos</div>
					<div class="sm:text-2xl text-md font-semibold">0</div>
				</div>
				<ChevronsRight class="sm:w-6 sm:h-6 w-5 h-5 text-blue-500" />
			</div>
		</div>

		<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs uppercase tracking-wider text-red-500">Vencidos</div>
					<div class="sm:text-2xl text-md font-semibold">0</div>
				</div>
				<AlertTriangle class="sm:w-6 sm:h-6 w-5 h-5 text-red-500" />
			</div>
		</div>

		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs uppercase tracking-wider text-emerald-500">Completados</div>
					<div class="sm:text-2xl text-md font-semibold">0</div>
				</div>
				<CheckCircle2 class="sm:w-6 sm:h-6 w-5 h-5 text-emerald-500" />
			</div>
		</div>

		<div class="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-purple-700">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs uppercase tracking-wider text-purple-500">Total</div>
					<div class="sm:text-2xl text-md font-semibold">0</div>
				</div>
				<BarChart3 class="sm:w-6 sm:h-6 w-5 h-5 text-purple-500" />
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
			<button
				onclick={() => onSelectView('calendar')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'calendar'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<CalendarDays class="w-4 h-4" />
				Calendario
			</button>
			<button
				onclick={() => onSelectView('list')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'list'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<List class="w-4 h-4" />
				Lista
			</button>
			<button
				onclick={() => onSelectView('kanban')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'kanban'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<KanbanSquare class="w-4 h-4" />
				Kanban
			</button>
			<button
				onclick={() => onSelectView('timeline')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'timeline'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<ArrowRightLeft class="w-4 h-4" />
				Timeline
			</button>
		</div>
		<div class="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
			<label class="flex items-center gap-2 text-sm text-slate-600 w-full justify-between sm:w-auto sm:justify-start">
				<span>Estado:</span>
				<select class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 w-full sm:w-auto">
					<option>Todos</option>
					<option>Próximos</option>
					<option>Vencidos</option>
					<option>Completados</option>
				</select>
			</label>
			<label class="flex items-center gap-2 text-sm text-slate-600 w-full justify-between sm:w-auto sm:justify-start">
				<span>Materia:</span>
				<select class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 w-full sm:w-auto">
					<option>Todas</option>
					<option>ISW</option>
					<option>PSI</option>
					<option>FAC</option>
					<option>YT</option>
				</select>
			</label>
			<button
				onclick={onOpenEventModal}
				class="cursor-pointer inline-flex items-center justify-center max-sm:mt-2 gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
			>
				<span class="text-base leading-none">+</span>
				<span>Agregar evento</span>
			</button>
		</div>
	</div>
</div>
