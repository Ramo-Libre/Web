<script lang="ts">
	import { Paintbrush, Tag, Plus, X } from '@lucide/svelte';

	let paintMode = false;
	let newTagName = '';
	let newTagIcon = '';
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<Tag class="w-5 h-5 text-indigo-500" />
			<h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Banco de etiquetas</h3>
		</div>
		<button
			type="button"
			class="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer {paintMode
				? 'bg-indigo-600 text-white border-indigo-600'
				: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
			onclick={() => (paintMode = !paintMode)}
		>
			<Paintbrush class="w-4 h-4" />
			{paintMode ? 'Pintor activo' : 'Modo pintor'}
		</button>
	</div>

	<div class="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
		<input
			type="text"
			placeholder="Nombre de etiqueta"
			bind:value={newTagName}
			class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
		/>
		<input
			type="text"
			placeholder="Icono (ej: 🧪, 📌)"
			bind:value={newTagIcon}
			class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
		/>
		<button
			type="button"
			class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			Crear
		</button>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		<span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
			<span class="text-sm">🧪</span>
			Laboratorio
			<button class="ml-1 text-blue-500 hover:text-blue-700 cursor-pointer" aria-label="Eliminar etiqueta">
				<X class="w-3 h-3" />
			</button>
		</span>
		<span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
			<span class="text-sm">🤝</span>
			Ayudantía
			<button class="ml-1 text-emerald-500 hover:text-emerald-700 cursor-pointer" aria-label="Eliminar etiqueta">
				<X class="w-3 h-3" />
			</button>
		</span>
		<span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">
			<span class="text-sm">📝</span>
			Control
			<button class="ml-1 text-amber-500 hover:text-amber-700 cursor-pointer" aria-label="Eliminar etiqueta">
				<X class="w-3 h-3" />
			</button>
		</span>
		<span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border-purple-200">
			<span class="text-sm">📌</span>
			Seminario
			<button class="ml-1 text-purple-500 hover:text-purple-700 cursor-pointer" aria-label="Eliminar etiqueta">
				<X class="w-3 h-3" />
			</button>
		</span>
	</div>

	<div class="mt-3 text-[11px] text-slate-400">
		{paintMode
			? 'Modo pintor activo: selecciona una etiqueta y luego toca horarios para asignarla.'
			: 'Activa el modo pintor para asignar etiquetas rápidamente.'}
	</div>
</div>