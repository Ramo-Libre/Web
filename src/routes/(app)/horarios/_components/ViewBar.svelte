<script lang="ts">
	import { Table2, List, ClockFading, GalleryHorizontalEnd, Layers2 } from '@lucide/svelte';
</script>

<div class="space-y-4">
	<div
		class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
			<button
				class="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto bg-blue-600 text-white border-blue-600"
			>
				<Table2 class="w-4 h-4" />
				Tabla
			</button>
			<button
				class="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50"
			>
				<List class="w-4 h-4" />
				Lista
			</button>
			<button
				class="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50"
			>
			    <ClockFading class="w-4 h-4" />
				Reloj
			</button>
			<button
				class="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50"
			>
			    <GalleryHorizontalEnd class="w-4 h-4" />
				Galería
			</button>
		</div>
		<div class="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
			<button
				class="cursor-pointer inline-flex items-center justify-center max-sm:mt-2 gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto"
			>
				<Layers2 class="w-4 h-4" />
				Eventos
			</button>
		</div>
	</div>
</div>
