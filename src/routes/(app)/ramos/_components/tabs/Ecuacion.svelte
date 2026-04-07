<script lang="ts">
	import { Trash2, Plus, ChartPie, Tag, X, PaintBucket, Eraser, Palette } from '@lucide/svelte';
	import { ColorUtils } from '$lib/utils/colors';
	import type { HexColor } from '$lib/types/colors';
	import { db } from '$lib/state/index.svelte';
	import EcuacionDisplay from './EcuacionDisplay.svelte';

	interface Props {
		selectedRamoId: string;
	}

	let { selectedRamoId = '' }: Props = $props();

	// --- ESTADO ---
	// Estado global del modo pintor
	let paintMode = $state(false);
	let selectedTagForPainting = $state<string | null>(null);

	// Estado para Tags
	let newTagName = $state('');

	// Estado para Evaluaciones
	let newEvalId = $state('');
	let newEvalPeso = $state(20);

	// --- DERIVADOS ---
	// Usar el manager de notas con ramoId (métodos de solo lectura)
	let evaluacionesList = $derived(
		selectedRamoId ? db.notas.getEvaluacionesData(selectedRamoId).list : []
	);
	let tagsList = $derived(selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []);
	let totalWeight = $derived(selectedRamoId ? db.notas.getCurrentWeight(selectedRamoId) : 0);

	// Tag seleccionado para pintar
	let selectedTag = $derived(
		selectedTagForPainting && selectedRamoId
			? db.notas.getTag(selectedRamoId, selectedTagForPainting)
			: null
	);

	// --- LÓGICA DEL MODO PINTOR ---
	function togglePaintMode() {
		paintMode = !paintMode;
		if (!paintMode) {
			selectedTagForPainting = null;
		}
	}

	function selectTagForPainting(tagId: string) {
		if (!paintMode) return;
		selectedTagForPainting = selectedTagForPainting === tagId ? null : tagId;
	}

	function paintEvaluation(evaluacionId: string) {
		console.log('paintEvaluation called with:', {
			evaluacionId,
			paintMode,
			selectedTagForPainting
		});
		if (!paintMode || !selectedTagForPainting || !selectedRamoId) {
			console.log('paintEvaluation - early return due to missing conditions');
			return;
		}
		console.log('paintEvaluation - calling togglePaint');
		db.notas.togglePaint(selectedRamoId, evaluacionId, selectedTagForPainting);
	}

	// --- LÓGICA DE COLORES ---
	function changeTagColor(tagId: string, newColor: string) {
		if (!selectedRamoId) return;
		const tag = db.notas.getTags(selectedRamoId).get(tagId);
		if (tag) {
			const twClasses = ColorUtils.hexToTailwindClasses(newColor as HexColor);
			const newColorClasses = `${twClasses.bg} ${twClasses.text} ${twClasses.border}`;

			db.notas.getTags(selectedRamoId).update(tagId, {
				...tag,
				color: newColorClasses
			});
		}
	}

	// --- LÓGICA DE TAGS ---
	function createTag() {
		if (!newTagName.trim() || !selectedRamoId) return;
		const hexColor = ColorUtils.COLORS[tagsList.length % ColorUtils.COLORS.length];
		const twClasses = ColorUtils.hexToTailwindClasses(hexColor);
		const colorClasses = `${twClasses.bg} ${twClasses.text} ${twClasses.border}`;

		db.notas.getTags(selectedRamoId).add({
			name: newTagName.trim(),
			color: colorClasses
		});
		newTagName = '';
	}

	function deleteTag(tagId: string) {
		if (!selectedRamoId) return;
		// Remover el tag de todas las evaluaciones primero
		db.notas.removeTagFromAllEvaluaciones(selectedRamoId, tagId);
		// Luego eliminar el tag
		db.notas.getTags(selectedRamoId).remove(tagId);

		if (selectedTagForPainting === tagId) {
			selectedTagForPainting = null;
		}
	}

	// --- LÓGICA DE EVALUACIONES ---
	function addEvaluation() {
		if (!newEvalId.trim() || !selectedRamoId) return;

		db.notas.getEvaluaciones(selectedRamoId).add({
			id: newEvalId.trim(),
			peso: newEvalPeso,
			tags: [],
			valor_actual: null
		});

		newEvalId = '';
		newEvalPeso = Math.max(0, 100 - totalWeight);
	}

	function removeEvaluation(evaluacionId: string) {
		if (!selectedRamoId) return;
		db.removeEvaluacion(selectedRamoId, evaluacionId);
	}

	function updateEvaluacionId(evaluacionId: string, newId: string) {
		if (!selectedRamoId) return;
		const evaluacion = db.notas.getEvaluaciones(selectedRamoId).get(evaluacionId);
		if (evaluacion) {
			db.notas.getEvaluaciones(selectedRamoId).update(evaluacionId, {
				...evaluacion,
				id: newId
			});
		}
	}

	function updateEvaluacionPeso(evaluacionId: string, newPeso: number) {
		if (!selectedRamoId) return;
		const evaluacion = db.notas.getEvaluaciones(selectedRamoId).get(evaluacionId);
		if (evaluacion) {
			db.notas.getEvaluaciones(selectedRamoId).update(evaluacionId, {
				...evaluacion,
				peso: newPeso
			});
		}
	}

	function getTag(tagId: string) {
		if (!selectedRamoId) return null;
		return db.notas.getTag(selectedRamoId, tagId);
	}
</script>

<div class="space-y-8 w-full max-w-4xl mx-auto pb-10">
	<!-- Display de la Ecuación -->
	<EcuacionDisplay evaluaciones={evaluacionesList} tags={tagsList} />

	<!-- Sección de Tags -->
	<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
		<div class="flex justify-between items-end">
			<div>
				<span
					class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-1"
				>
					<Tag size={14} /> Banco de Etiquetas
				</span>
				<p class="text-[11px] text-gray-400 h-4 max-sm:hidden">
					{#if paintMode && selectedTagForPainting}
						<span class="text-indigo-600 font-bold animate-pulse"
							>Pintando con etiqueta seleccionada:</span
						> Toca las evaluaciones abajo para asignar.
					{:else if paintMode}
						<span class="text-orange-600 font-bold">Modo Pintor Activo:</span> Selecciona una etiqueta
						para pintar.
					{:else}
						Haz clic en el modo pintor para comenzar a etiquetar evaluaciones.
					{/if}
				</p>
				<p class="text-[11px] text-gray-400 h-4 sm:hidden mb-2">
					{#if paintMode && selectedTagForPainting}
						Toca las evaluaciones abajo para asignar.
					{:else if paintMode}
						Selecciona una etiqueta para pintar.
					{:else}
						Haz clic en el modo pintor etiquetar evaluaciones.
					{/if}
				</p>
			</div>

			<!-- Botón de Pintar -->
			<button
				onclick={togglePaintMode}
				class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
                {paintMode
					? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
					: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'}"
			>
				{#if paintMode}
					<Eraser size={14} />
					Dejar de Pintar
				{:else}
					<PaintBucket size={14} />
					Pintar
				{/if}
			</button>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			{#each tagsList as [tagId, tag] (tagId)}
				<div
					class="group relative flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium transition-all duration-200
                    {tag.color}
                    {paintMode && selectedTagForPainting === tagId
						? 'ring-2 ring-offset-1 shadow-md scale-105 cursor-pointer'
						: paintMode
							? 'cursor-pointer hover:ring-1 hover:shadow-sm hover:scale-105'
							: 'hover:shadow-sm'}"
					role="button"
					tabindex="0"
					onclick={() => (paintMode ? selectTagForPainting(tagId) : null)}
					onkeydown={(e) => e.key === 'Enter' && paintMode && selectTagForPainting(tagId)}
				>
					{#if paintMode && selectedTagForPainting === tagId}
						<PaintBucket size={10} class="animate-bounce" />
					{/if}
					<span class="select-none">{tag.name}</span>

					{#if !paintMode}
						<button
							onclick={(e) => {
								e.stopPropagation();
								deleteTag(tagId);
							}}
							class="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-200 hover:text-red-600 transition-colors ml-1 opacity-60 hover:opacity-100 touch-manipulation"
							title="Eliminar etiqueta"
						>
							<X size={12} />
						</button>
					{/if}
				</div>
			{/each}

			{#if !paintMode}
				<div
					class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-gray-300 bg-gray-50/50 hover:bg-white hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white"
				>
					<Plus size={14} class="text-gray-400" />
					<input
						type="text"
						bind:value={newTagName}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								createTag();
							}
						}}
						placeholder="Nueva etiqueta..."
						class="w-24 bg-transparent border-none outline-none text-xs font-medium placeholder-gray-400 text-gray-700 min-w-12"
						autocomplete="off"
						enterkeyhint="done"
					/>
				</div>
			{/if}
		</div>

		<!-- Footer - Mini Barra de Colores - Solo en modo pintor con tag seleccionado -->
		{#if paintMode && selectedTag}
			<div class="border-t border-gray-200 pt-3 -mb-1">
				<div class="flex items-center gap-2 mb-3">
					<Palette size={12} class="text-slate-500" />
					<span class="text-xs font-medium text-slate-600">
						Cambiar color de <span class="font-semibold">"{selectedTag.name}"</span>
					</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each ColorUtils.COLORS as color (color)}
						{@const twClasses = ColorUtils.hexToTailwindClasses(color)}
						{@const currentColorClass = `${twClasses.bg} ${twClasses.text} ${twClasses.border}`}
						{@const isCurrentColor = selectedTag.color === currentColorClass}
						<button
							class="h-5 w-5 rounded border border-white/20 shadow-sm transition-all hover:scale-110 cursor-pointer
							{isCurrentColor ? 'ring-2 ring-indigo-500 scale-110' : 'hover:ring-1 hover:ring-gray-300'}"
							style="background-color: {color}"
							title={color}
							onclick={() =>
								selectedTagForPainting && changeTagColor(selectedTagForPainting, color)}
						></button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Sección de Evaluaciones -->
	<div class="space-y-4">
		<!-- Barra de progreso -->
		<div class="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
			<ChartPie size={18} class="text-gray-500" />
			<div class="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
				<div
					class="h-full transition-all duration-500 ease-out {totalWeight > 100
						? 'bg-red-500'
						: totalWeight === 100
							? 'bg-green-500'
							: 'bg-indigo-500'}"
					style="width: {Math.min(totalWeight, 100)}%"
				></div>
			</div>
			<span class="text-xs font-bold {totalWeight > 100 ? 'text-red-500' : 'text-gray-600'}">
				{totalWeight}%
			</span>
		</div>

		<!-- Lista de evaluaciones -->
		<div class="space-y-3">
			{#each evaluacionesList as [evaluacionId, evaluacion] (evaluacionId)}
				<div
					role="button"
					tabindex="0"
					onclick={() => {
						if (paintMode && selectedTagForPainting) {
							paintEvaluation(evaluacionId);
						}
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' && paintMode && selectedTagForPainting) {
							paintEvaluation(evaluacionId);
						}
					}}
					class="relative bg-white border border-gray-200 rounded-xl p-3 shadow-sm transition-all duration-200 group
                    {paintMode && selectedTagForPainting
						? 'cursor-crosshair hover:border-indigo-400 hover:shadow-md'
						: paintMode
							? 'opacity-75'
							: ''}
                    {paintMode &&
					selectedTagForPainting &&
					evaluacion.tags.includes(selectedTagForPainting)
						? 'bg-indigo-50/40 ring-1 ring-indigo-200'
						: ''}"
				>
					<!-- Layout responsive: fila única en sm+, dos filas en móvil -->
					<div class="relative z-10">
						<!-- Fila principal: nombre + controles -->
						<div class="flex items-center gap-3">
							<!-- Nombre de la evaluación -->
							<input
								type="text"
								value={evaluacion.id}
								onchange={(e) =>
									updateEvaluacionId(evaluacionId, (e.target as HTMLInputElement).value)}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										(e.target as HTMLInputElement).blur();
									}
								}}
								onclick={(e) => !paintMode && e.stopPropagation()}
								disabled={paintMode}
								class="flex-1 bg-transparent border-none outline-none font-medium text-gray-800 placeholder-gray-400 focus:ring-0 text-base min-w-0
	                            {paintMode ? 'cursor-crosshair pointer-events-none' : ''}"
								placeholder="Nombre de la evaluación..."
								autocomplete="off"
								enterkeyhint="done"
							/>

							<!-- Tags asignados - solo visible en sm+ -->
							{#if evaluacion.tags.length > 0}
								<div class="hidden sm:flex flex-wrap gap-1">
									{#each evaluacion.tags as tagId (tagId)}
										{@const tag = getTag(tagId)}
										{#if tag}
											<span
												class="text-[10px] px-2 py-0.5 rounded-md border font-medium select-none
	                                            {paintMode && selectedTagForPainting === tagId
													? 'opacity-100 animate-pulse ring-1 ring-indigo-400'
													: paintMode
														? 'opacity-60'
														: 'opacity-90'}
	                                            {tag.color}"
												title={paintMode && selectedTagForPainting === tagId
													? 'Clic para quitar'
													: 'Etiqueta'}
											>
												{tag.name}
											</span>
										{/if}
									{/each}
								</div>
							{/if}

							<!-- Peso de la evaluación -->
							<div
								class="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shrink-0
	                            {paintMode ? 'pointer-events-none opacity-75' : ''}"
								role="button"
								tabindex="0"
								onclick={(e) => !paintMode && e.stopPropagation()}
								onkeydown={(e) => e.key === 'Enter' && !paintMode && e.stopPropagation()}
							>
								<input
									type="number"
									value={evaluacion.peso}
									onchange={(e) =>
										updateEvaluacionPeso(
											evaluacionId,
											Number((e.target as HTMLInputElement).value)
										)}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											(e.target as HTMLInputElement).blur();
										}
									}}
									disabled={paintMode}
									class="w-10 text-right bg-transparent outline-none font-bold text-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
	                                {paintMode ? 'cursor-crosshair' : ''}"
									autocomplete="off"
									enterkeyhint="done"
									inputmode="numeric"
								/>
								<span class="text-xs text-gray-400 font-bold">%</span>
							</div>

							<!-- Botón eliminar -->
							{#if !paintMode}
								<button
									onclick={(e) => {
										e.stopPropagation();
										removeEvaluation(evaluacionId);
									}}
									class="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
									aria-label="Eliminar evaluación"
								>
									<Trash2 size={16} />
								</button>
							{/if}
						</div>

						<!-- Fila de tags - solo visible en móvil -->
						{#if evaluacion.tags.length > 0}
							<div class="flex sm:hidden flex-wrap gap-1 mt-2">
								{#each evaluacion.tags as tagId (tagId)}
									{@const tag = getTag(tagId)}
									{#if tag}
										<span
											class="text-[10px] px-2 py-0.5 rounded-md border font-medium select-none
                                            {paintMode && selectedTagForPainting === tagId
												? 'opacity-100 animate-pulse ring-1 ring-indigo-400'
												: paintMode
													? 'opacity-60'
													: 'opacity-90'}
                                            {tag.color}"
											title={paintMode && selectedTagForPainting === tagId
												? 'Clic para quitar'
												: 'Etiqueta'}
										>
											{tag.name}
										</span>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}

			<!-- Input para nueva evaluación -->
			{#if !paintMode}
				<div
					class="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-colors group cursor-text"
					role="button"
					tabindex="0"
					onclick={() => document.getElementById('new-eval-input')?.focus()}
					onkeydown={(e) => e.key === 'Enter' && document.getElementById('new-eval-input')?.focus()}
				>
					<div
						class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors"
					>
						<Plus size={18} />
					</div>

					<input
						id="new-eval-input"
						type="text"
						bind:value={newEvalId}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addEvaluation();
							}
						}}
						placeholder="Nueva evaluación (ej: Certamen 1)..."
						class="flex-1 bg-transparent border-none outline-none text-sm text-gray-600 font-medium placeholder-gray-400 focus:ring-0"
						autocomplete="off"
						enterkeyhint="done"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
