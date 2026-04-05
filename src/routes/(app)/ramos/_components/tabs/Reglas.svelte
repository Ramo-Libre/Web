<script lang="ts">
	import { Trash2, ArrowDown, ArrowUp, Flag, Pencil, Ruler } from '@lucide/svelte';
	import { db } from '$lib/state/index.svelte';
	import ReglasDisplay from './ReglasDisplay.svelte';
	import ContextoModal from './_components/ContextoModal.svelte';
	import type { Restriccion, Contexto } from '@madmti/gradesolver';

	interface Props {
		selectedRamoId?: string;
	}

	let { selectedRamoId }: Props = $props();

	// --- TIPOS ---

	// --- DATOS REALES ---
	// Tags del ramo seleccionado
	const tagsList = $derived(selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []);

	// Reglas del ramo desde el state real
	const rulesData = $derived(
		selectedRamoId ? db.notas.getRestriccionesData(selectedRamoId) : { list: [] }
	);
	const rules = $derived(rulesData.list.map(([, rule]) => rule));

	// --- CONTEXTO DEL RAMO ---
	let contexto = $state<Contexto | null>(null);
	let contextoModalOpen = $state(false);

	$effect(() => {
		if (!selectedRamoId) {
			contexto = null;
			return;
		}
		contexto = db.notas.getContexto(selectedRamoId);
	});

	const modalContexto = $derived(contexto ?? db.notas.getContextoRecomendado());

	function openContextoModal() {
		if (!selectedRamoId) return;
		contextoModalOpen = true;
	}

	function closeContextoModal() {
		contextoModalOpen = false;
	}

	function applyContexto(next: Contexto) {
		if (!selectedRamoId) return;
		db.notas.setContexto(selectedRamoId, next);
		contexto = db.notas.getContexto(selectedRamoId);
		contextoModalOpen = false;
	}

	function applyContextoAll(next: Contexto) {
		db.notas.setContextoForAll(next);
		if (selectedRamoId) {
			contexto = db.notas.getContexto(selectedRamoId);
		}
		contextoModalOpen = false;
	}

	// --- ESTADO NUEVA REGLA ---
	let newRuleType = $state<Restriccion['tipo']>('PROMEDIO_SIMPLE_TAG');
	let newRuleTarget = $state(40);
	let newRuleTag = $state('');

	// --- ACCIONES ---
	function addRule() {
		if (!selectedRamoId) return;

		if (!newRuleTag) {
			return;
		}

		const restriccion: Restriccion = {
			id: crypto.randomUUID(),
			tipo: newRuleType,
			valor_minimo: newRuleTarget,
			tag_objetivo: newRuleTag
		};

		db.notas.getRestricciones(selectedRamoId).add(restriccion);
		resetForm();
	}

	function removeRule(index: number) {
		if (!selectedRamoId) return;

		const ruleId = rulesData.list[index]?.[0];
		if (ruleId) {
			db.notas.getRestricciones(selectedRamoId).remove(ruleId);
		}
	}

	function resetForm() {
		newRuleType = 'PROMEDIO_SIMPLE_TAG';
		newRuleTarget = 40;
		newRuleTag = '';
	}

	function formatRule(rule: Restriccion): string {
		switch (rule.tipo) {
			case 'PROMEDIO_SIMPLE_TAG': {
				const tagNameAvg = getTag(rule.tag_objetivo)?.name || rule.tag_objetivo;
				return `Promedio ${tagNameAvg} ≥ ${rule.valor_minimo}`;
			}
			case 'NOTA_MINIMA_INDIVIDUAL_TAG': {
				const tagNameMin = getTag(rule.tag_objetivo)?.name || rule.tag_objetivo;
				return `Cada ${tagNameMin} ≥ ${rule.valor_minimo}`;
			}
			default:
				return 'Regla desconocida';
		}
	}

	function getTag(tagId: string) {
		if (!selectedRamoId) return null;
		return db.notas.getTag(selectedRamoId, tagId);
	}

	// Extraer color hex del string de clases CSS
	function getTagHexColor(colorClasses: string): string {
		if (colorClasses.includes('bg-blue-')) return '#3b82f6';
		if (colorClasses.includes('bg-green-')) return '#10b981';
		if (colorClasses.includes('bg-purple-')) return '#8b5cf6';
		if (colorClasses.includes('bg-orange-')) return '#f59e0b';
		if (colorClasses.includes('bg-red-')) return '#ef4444';
		if (colorClasses.includes('bg-yellow-')) return '#f59e0b';
		if (colorClasses.includes('bg-indigo-')) return '#6366f1';
		if (colorClasses.includes('bg-pink-')) return '#ec4899';
		if (colorClasses.includes('bg-emerald-')) return '#10b981';
		if (colorClasses.includes('bg-cyan-')) return '#06b6d4';
		if (colorClasses.includes('bg-teal-')) return '#14b8a6';
		return '#6b7280'; // gray default
	}
</script>

<div class="space-y-8 w-full max-w-4xl mx-auto pb-10">
	<!-- Display de las Reglas -->
	<ReglasDisplay {rules} tags={tagsList} />

	<!-- Contexto del Ramo -->
	<button
		onclick={openContextoModal}
		class="w-full bg-white px-4 py-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer text-left"
	>
		<div class="flex flex-row flex-wrap items-center gap-4 text-xs text-gray-600">
			<div class="flex items-center gap-2 text-xs text-slate-600">
				<Ruler size={14} class="text-slate-400" />
				<span class="font-semibold">Escala de notas</span>
			</div>
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-1">
					<ArrowDown size={14} class="text-slate-400" />
					<span class="font-semibold text-slate-700">{contexto?.nota_minima ?? '-'}</span>
				</div>
				<div class="flex items-center gap-1">
					<ArrowUp size={14} class="text-slate-400" />
					<span class="font-semibold text-slate-700">{contexto?.nota_maxima ?? '-'}</span>
				</div>
				<div class="flex items-center gap-1">
					<Flag size={14} class="text-slate-400" />
					<span class="font-semibold text-slate-700">{contexto?.nota_aprobacion ?? '-'}</span>
				</div>
			</div>
			<div class="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-600">
				<Pencil size={14} class="text-slate-400" />
				<span class="max-sm:hidden">Editar escala</span>
			</div>
		</div>
	</button>

	<!-- Formulario Simple -->
	<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
		<h3 class="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Nueva Regla</h3>

		<div class="flex flex-wrap items-center gap-4">
			<!-- Tipo -->
			<div class="flex max-sm:grid max-sm:grid-rows-3 max-sm:w-full gap-2">
				<button
					onclick={() => (newRuleType = 'PROMEDIO_SIMPLE_TAG')}
					class="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer {newRuleType ===
					'PROMEDIO_SIMPLE_TAG'
						? 'bg-blue-50 border-blue-300 text-blue-700'
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}"
				>
					Promedio por Tag
				</button>
				<button
					onclick={() => (newRuleType = 'NOTA_MINIMA_INDIVIDUAL_TAG')}
					class="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer {newRuleType ===
					'NOTA_MINIMA_INDIVIDUAL_TAG'
						? 'bg-blue-50 border-blue-300 text-blue-700'
						: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}"
				>
					Nota Mínima
				</button>
			</div>

			<!-- Tags -->
			{#if tagsList.length > 0}
				<div class="flex gap-2">
					{#each tagsList as [tagId, tag] (tagId)}
						{@const tagColor = getTagHexColor(tag.color)}
						<button
							onclick={() => (newRuleTag = tagId)}
							class="px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 cursor-pointer {newRuleTag ===
							tagId
								? 'bg-blue-50 border-blue-300 text-blue-700'
								: 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}"
						>
							<div class="w-2 h-2 rounded-full" style="background-color: {tagColor}"></div>
							{tag.name}
						</button>
					{/each}
				</div>
			{:else}
				<div class="text-sm text-gray-500 italic">
					No hay tags disponibles. Ve a "Ecuación de Nota" para crear evaluaciones con tags.
				</div>
			{/if}

			<!-- Target -->
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-500">≥</span>
				<input
					type="number"
					bind:value={newRuleTarget}
					class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
				<span class="text-sm text-gray-400">pts</span>
			</div>

			<button
				onclick={addRule}
				class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
			>
				+ Agregar
			</button>
		</div>
	</div>

	<!-- Lista de reglas -->
	{#if rules.length > 0}
		<div class="space-y-3">
			{#each rules as rule, index (index)}
				<div
					class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
				>
					<div class="flex items-center gap-3">
						{#if rule.tag_objetivo}
							{@const tag = getTag(rule.tag_objetivo)}
							{#if tag}
								{@const tagColor = getTagHexColor(tag.color)}
								<div class="w-3 h-3 rounded-full" style="background-color: {tagColor}"></div>
							{/if}
						{/if}
						<span class="font-medium text-gray-700">
							{formatRule(rule)}
						</span>
					</div>

					<button
						onclick={() => removeRule(index)}
						class="text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
					>
						<Trash2 size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<ContextoModal
		open={contextoModalOpen}
		contexto={modalContexto}
		onApply={applyContexto}
		onApplyAll={applyContextoAll}
		onClose={closeContextoModal}
	/>
</div>
