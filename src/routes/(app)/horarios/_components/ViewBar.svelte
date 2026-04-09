<script lang="ts">
	import { Table2, List, ClockFading, GalleryHorizontalEnd, Layers2 } from '@lucide/svelte';
	type ViewMode = 'table' | 'list' | 'clock' | 'gallery';
	type LayerMode = boolean;

	interface Props {
		selectedView: ViewMode;
		selectedLayer: LayerMode;
		onSelectView: (view: ViewMode) => void;
		onSelectLayer: (layer: LayerMode) => void;
	}

	let {
		selectedView = 'table',
		selectedLayer = false,
		onSelectView = () => {},
		onSelectLayer = () => {}
	}: Props = $props();
</script>

<div class="space-y-4">
	<div
		class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
			<button
				onclick={() => onSelectView('table')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'table'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<Table2 class="w-4 h-4" />
				Tabla
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
				onclick={() => onSelectView('clock')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'clock'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<ClockFading class="w-4 h-4" />
				Reloj
			</button>
			<button
				onclick={() => onSelectView('gallery')}
				class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto ${
					selectedView === 'gallery'
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<GalleryHorizontalEnd class="w-4 h-4" />
				Galería
			</button>
		</div>
		<div class="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
			<button
				onclick={() => onSelectLayer(!selectedLayer)}
				class={`cursor-pointer inline-flex items-center justify-center max-sm:mt-2 gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors w-full sm:w-auto ${
					selectedLayer
						? 'bg-blue-600 text-white border-blue-600'
						: 'border-slate-200 text-slate-600 hover:bg-slate-50'
				}`}
			>
				<Layers2 class="w-4 h-4" />
				Eventos
			</button>
		</div>
	</div>
</div>
