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

	let paintMode = $state(false);
	let selectedTagForPainting = $state<string | null>(null);
	let newTagName = $state('');
	let newEvalId = $state('');
	let newEvalPeso = $state(20);

	let evaluacionesList = $derived(
		selectedRamoId ? db.notas.getEvaluacionesData(selectedRamoId).list : []
	);
	let tagsList = $derived(selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []);
	let totalWeight = $derived(selectedRamoId ? db.notas.getCurrentWeight(selectedRamoId) : 0);

	let selectedTag = $derived(
		selectedTagForPainting && selectedRamoId
			? db.notas.getTag(selectedRamoId, selectedTagForPainting)
			: null
	);

	function togglePaintMode() {
		paintMode = !paintMode;
		if (!paintMode) selectedTagForPainting = null;
	}

	function selectTagForPainting(tagId: string) {
		if (!paintMode) return;
		selectedTagForPainting = selectedTagForPainting === tagId ? null : tagId;
	}

	function paintEvaluation(evaluacionId: string) {
		if (!paintMode || !selectedTagForPainting || !selectedRamoId) return;
		db.notas.togglePaint(selectedRamoId, evaluacionId, selectedTagForPainting);
	}

	function changeTagColor(tagId: string, newColor: string) {
		if (!selectedRamoId) return;
		const tag = db.notas.getTags(selectedRamoId).get(tagId);
		if (tag) {
			const twClasses = ColorUtils.hexToTailwindClasses(newColor as HexColor);
			const newColorClasses = `${twClasses.bg} ${twClasses.text} ${twClasses.border}`;
			db.notas.getTags(selectedRamoId).update(tagId, { ...tag, color: newColorClasses });
		}
	}

	function createTag() {
		if (!newTagName.trim() || !selectedRamoId) return;
		const hexColor = ColorUtils.COLORS[tagsList.length % ColorUtils.COLORS.length];
		const twClasses = ColorUtils.hexToTailwindClasses(hexColor);
		const colorClasses = `${twClasses.bg} ${twClasses.text} ${twClasses.border}`;

		db.notas.getTags(selectedRamoId).add({ name: newTagName.trim(), color: colorClasses });
		newTagName = '';
	}

	function deleteTag(tagId: string) {
		if (!selectedRamoId) return;
		db.notas.removeTagFromAllEvaluaciones(selectedRamoId, tagId);
		db.notas.getTags(selectedRamoId).remove(tagId);
		if (selectedTagForPainting === tagId) selectedTagForPainting = null;
	}

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
			db.notas.getEvaluaciones(selectedRamoId).update(evaluacionId, { ...evaluacion, id: newId });
		}
	}

	function updateEvaluacionPeso(evaluacionId: string, newPeso: number) {
		if (!selectedRamoId) return;
		const evaluacion = db.notas.getEvaluaciones(selectedRamoId).get(evaluacionId);
		if (evaluacion) {
			db.notas.getEvaluaciones(selectedRamoId).update(evaluacionId, { ...evaluacion, peso: newPeso });
		}
	}

	function getTag(tagId: string) {
		if (!selectedRamoId) return null;
		return db.notas.getTag(selectedRamoId, tagId);
	}
</script>

<div class="space-y-8 w-full max-w-4xl mx-auto pb-10">
	<EcuacionDisplay evaluaciones={evaluacionesList} tags={tagsList} />

	<div class="bg-base-100 p-5 rounded-xl border border-base-400 shadow-sm space-y-4">
		<div class="flex justify-between items-end">
			<div>
				<span class="text-xs font-bold text-content/40 uppercase tracking-wider flex items-center gap-2 mb-1">
					<Tag size={14} /> Banco de Etiquetas
				</span>
				<p class="text-[11px] text-content/50 h-4 max-sm:hidden">
					{#if paintMode && selectedTagForPainting}
						<span class="text-primary-100 font-bold animate-pulse">Pintando con etiqueta seleccionada:</span> Toca las evaluaciones para asignar.
					{:else if paintMode}
						<span class="text-warning-100 font-bold">Modo Pintor Activo:</span> Selecciona una etiqueta.
					{:else}
						Haz clic en el modo pintor para comenzar a etiquetar.
					{/if}
				</p>
			</div>

			<button
				onclick={togglePaintMode}
				class="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer border
                {paintMode
					? 'bg-error-400 text-error-100 border-error-300'
					: 'bg-success-400 text-success-100 border-success-300'}"
			>
				{#if paintMode}
					<Eraser size={14} /> Dejar de Pintar
				{:else}
					<PaintBucket size={14} /> Pintar
				{/if}
			</button>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			{#each tagsList as [tagId, tag] (tagId)}
				<div
					class="group relative flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium transition-all
                    {tag.color}
                    {paintMode && selectedTagForPainting === tagId
						? 'ring-2 ring-primary-100 shadow-md scale-105 cursor-pointer ring-offset-base-100'
						: paintMode
							? 'cursor-pointer hover:ring-1 hover:ring-primary-100 hover:scale-105'
							: ''}"
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
							onclick={(e) => { e.stopPropagation(); deleteTag(tagId); }}
							class="w-5 h-5 flex items-center justify-center rounded-full hover:bg-error-400 hover:text-error-100 transition-colors ml-1 opacity-60 hover:opacity-100"
						>
							<X size={12} />
						</button>
					{/if}
				</div>
			{/each}

			{#if !paintMode}
				<div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-base-400 bg-base-200 focus-within:border-primary-100 focus-within:ring-1 focus-within:ring-primary-100 transition-all">
					<Plus size={14} class="text-content/40" />
					<input
						type="text"
						bind:value={newTagName}
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), createTag())}
						placeholder="Nueva etiqueta..."
						class="w-24 bg-transparent border-none outline-none text-xs font-medium placeholder-content/30 text-content"
					/>
				</div>
			{/if}
		</div>

		{#if paintMode && selectedTag}
			<div class="border-t border-base-300 pt-3 -mb-1">
				<div class="flex items-center gap-2 mb-3">
					<Palette size={12} class="text-content/40" />
					<span class="text-xs font-medium text-content/70">
						Cambiar color de <span class="font-semibold text-content">"{selectedTag.name}"</span>
					</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each ColorUtils.COLORS as color (color)}
						{@const twClasses = ColorUtils.hexToTailwindClasses(color)}
						{@const isCurrentColor = selectedTag.color.includes(twClasses.bg)}
						<button
							class="h-5 w-5 rounded border border-base-100/20 shadow-sm transition-all hover:scale-110 cursor-pointer
							{isCurrentColor ? 'ring-2 ring-primary-100 scale-110' : 'hover:ring-1 hover:ring-base-400'}"
							style="background-color: {color}"
							onclick={() => selectedTagForPainting && changeTagColor(selectedTagForPainting, color)}
						></button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="space-y-4">
		<div class="flex items-center gap-3 bg-base-200 px-4 py-3 rounded-xl border border-base-400">
			<ChartPie size={18} class="text-content/40" />
			<div class="flex-1 h-2.5 bg-base-300 rounded-full overflow-hidden">
				<div
					class="h-full transition-all duration-500 ease-out {totalWeight > 100
						? 'bg-error-100'
						: totalWeight === 100
							? 'bg-success-100'
							: 'bg-primary-100'}"
					style="width: {Math.min(totalWeight, 100)}%"
				></div>
			</div>
			<span class="text-xs font-bold {totalWeight > 100 ? 'text-error-100' : 'text-content/70'}">
				{totalWeight}%
			</span>
		</div>

		<div class="space-y-3">
			{#each evaluacionesList as [evaluacionId, evaluacion] (evaluacionId)}
				<div
					role="button"
					tabindex="0"
					onclick={() => paintMode && selectedTagForPainting && paintEvaluation(evaluacionId)}
					onkeydown={(e) => e.key === 'Enter' && paintMode && selectedTagForPainting && paintEvaluation(evaluacionId)}
					class="relative bg-base-100 border border-base-400 rounded-xl p-3 shadow-sm transition-all group
                    {paintMode && selectedTagForPainting ? 'cursor-crosshair hover:border-primary-100 hover:shadow-md' : paintMode ? 'opacity-75' : ''}
                    {paintMode && selectedTagForPainting && evaluacion.tags.includes(selectedTagForPainting) ? 'bg-primary-400/20 ring-1 ring-primary-100/50' : ''}"
				>
					<div class="flex items-center gap-3">
						<input
							type="text"
							value={evaluacion.id}
							onchange={(e) => updateEvaluacionId(evaluacionId, (e.target as HTMLInputElement).value)}
							disabled={paintMode}
							class="flex-1 bg-transparent border-none outline-none font-medium text-content placeholder-content/30 text-base min-w-0 {paintMode ? 'pointer-events-none' : 'focus:ring-0'}"
							placeholder="Nombre evaluación..."
						/>

						{#if evaluacion.tags.length > 0}
							<div class="hidden sm:flex flex-wrap gap-1">
								{#each evaluacion.tags as tagId (tagId)}
									{@const tag = getTag(tagId)}
									{#if tag}
										<span class="text-[10px] px-2 py-0.5 rounded-md border font-medium {tag.color} {paintMode && selectedTagForPainting === tagId ? 'animate-pulse ring-1 ring-primary-100' : ''}">
											{tag.name}
										</span>
									{/if}
								{/each}
							</div>
						{/if}

						<div class="flex items-center gap-1 bg-base-200 px-2.5 py-1.5 rounded-lg border border-base-400 focus-within:ring-1 focus-within:ring-primary-100 {paintMode ? 'opacity-75' : ''}">
							<input
								type="number"
								value={evaluacion.peso}
								onchange={(e) => updateEvaluacionPeso(evaluacionId, Number((e.target as HTMLInputElement).value))}
								disabled={paintMode}
								class="w-10 text-right bg-transparent outline-none font-bold text-content [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
							/>
							<span class="text-xs text-content/40 font-bold">%</span>
						</div>

						{#if !paintMode}
							<button onclick={(e) => { e.stopPropagation(); removeEvaluation(evaluacionId); }} class="text-content/20 hover:text-error-100 p-1.5 hover:bg-error-400 rounded-lg transition-all cursor-pointer">
								<Trash2 size={16} />
							</button>
						{/if}
					</div>

					{#if evaluacion.tags.length > 0}
						<div class="flex sm:hidden flex-wrap gap-1 mt-2">
							{#each evaluacion.tags as tagId (tagId)}
								{@const tag = getTag(tagId)}
								{#if tag}
									<span class="text-[10px] px-2 py-0.5 rounded-md border font-medium {tag.color}">
										{tag.name}
									</span>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/each}

			{#if !paintMode}
				<div
					class="flex items-center gap-3 p-3 border-2 border-dashed border-base-400 rounded-xl hover:bg-base-200 hover:border-primary-100 transition-all group cursor-text"
					role="button"
					tabindex="0"
					onclick={() => document.getElementById('new-eval-input')?.focus()}
				>
					<div class="w-8 h-8 rounded-full bg-base-200 text-content/30 flex items-center justify-center group-hover:bg-primary-400 group-hover:text-primary-100">
						<Plus size={18} />
					</div>
					<input
						id="new-eval-input"
						type="text"
						bind:value={newEvalId}
						onkeydown={(e) => e.key === 'Enter' && addEvaluation()}
						placeholder="Nueva evaluación..."
						class="flex-1 bg-transparent border-none outline-none text-sm text-content/60 font-medium placeholder-content/30 focus:ring-0"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
