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

	// --- DATOS REALES ---
	const tagsList = $derived(selectedRamoId ? db.notas.getTagsData(selectedRamoId).list : []);
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

	function generateUUID(): string {
		return crypto.randomUUID();
	}

	// --- ACCIONES ---
	function addRule() {
		if (!selectedRamoId || !newRuleTag) return;

		const restriccion: Restriccion = {
			id: generateUUID(),
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

	function getTagHexColor(colorClasses: string): string {
		const mapping: Record<string, string> = {
			'bg-blue-': '#3b82f6',
			'bg-green-': '#10b981',
			'bg-purple-': '#8b5cf6',
			'bg-orange-': '#f59e0b',
			'bg-red-': '#ef4444',
			'bg-yellow-': '#f59e0b',
			'bg-indigo-': '#6366f1',
			'bg-pink-': '#ec4899',
			'bg-emerald-': '#10b981',
			'bg-cyan-': '#06b6d4',
			'bg-teal-': '#14b8a6'
		};
		for (const [key, value] of Object.entries(mapping)) {
			if (colorClasses.includes(key)) return value;
		}
		return '#6b7280';
	}
</script>

<div class="space-y-8 w-full max-w-4xl mx-auto pb-10">
	<ReglasDisplay {rules} tags={tagsList} />

	<button
		onclick={openContextoModal}
		class="w-full bg-base-100 px-4 py-4 rounded-xl border border-base-400 shadow-sm hover:bg-base-200 transition-colors cursor-pointer text-left"
	>
		<div class="flex flex-row flex-wrap items-center gap-4 text-xs text-content/70">
			<div class="flex items-center gap-2 text-xs">
				<Ruler size={14} class="text-content/40" />
				<span class="font-semibold text-content">Escala de notas</span>
			</div>
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-1">
					<ArrowDown size={14} class="text-content/40" />
					<span class="font-semibold text-content/80">{contexto?.nota_minima ?? '-'}</span>
				</div>
				<div class="flex items-center gap-1">
					<ArrowUp size={14} class="text-content/40" />
					<span class="font-semibold text-content/80">{contexto?.nota_maxima ?? '-'}</span>
				</div>
				<div class="flex items-center gap-1">
					<Flag size={14} class="text-content/40" />
					<span class="font-semibold text-content/80">{contexto?.nota_aprobacion ?? '-'}</span>
				</div>
			</div>
			<div
				class="ml-auto flex items-center gap-1 text-xs font-semibold text-content/60 hover:text-primary-100 transition-colors"
			>
				<Pencil size={14} />
				<span class="max-sm:hidden">Editar escala</span>
			</div>
		</div>
	</button>

	<div class="bg-base-100 p-6 rounded-xl border border-base-400 shadow-sm">
		<h3 class="text-sm font-medium text-content/50 mb-4 uppercase tracking-wide">Nueva Regla</h3>

		<div class="flex flex-wrap items-center gap-4">
			<div class="flex max-sm:grid max-sm:grid-rows-2 max-sm:w-full gap-2">
				<button
					onclick={() => (newRuleType = 'PROMEDIO_SIMPLE_TAG')}
					class="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer {newRuleType ===
					'PROMEDIO_SIMPLE_TAG'
						? 'bg-classes-400 border-classes-300 text-classes-100'
						: 'bg-base-100 border-base-400 text-content/60 hover:bg-base-200'}"
				>
					Promedio por Tag
				</button>
				<button
					onclick={() => (newRuleType = 'NOTA_MINIMA_INDIVIDUAL_TAG')}
					class="px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer {newRuleType ===
					'NOTA_MINIMA_INDIVIDUAL_TAG'
						? 'bg-classes-400 border-classes-300 text-classes-100'
						: 'bg-base-100 border-base-400 text-content/60 hover:bg-base-200'}"
				>
					Nota Mínima
				</button>
			</div>

			{#if tagsList.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each tagsList as [tagId, tag] (tagId)}
						{@const tagColor = getTagHexColor(tag.color)}
						<button
							onclick={() => (newRuleTag = tagId)}
							class="px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 cursor-pointer {newRuleTag ===
							tagId
								? 'bg-classes-400 border-classes-300 text-classes-100'
								: 'bg-base-100 border-base-400 text-content/60 hover:bg-base-200'}"
						>
							<div class="w-2 h-2 rounded-full" style="background-color: {tagColor}"></div>
							{tag.name}
						</button>
					{/each}
				</div>
			{:else}
				<div class="text-sm text-content/40 italic">
					No hay tags disponibles. Crea evaluaciones con tags primero.
				</div>
			{/if}

			<div class="flex items-center gap-2">
				<span class="text-sm text-content/50">≥</span>
				<input
					type="number"
					bind:value={newRuleTarget}
					class="w-16 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-classes-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
				<span class="text-sm text-content/40">pts</span>
			</div>

			<button
				onclick={addRule}
				type="button"
				class="px-4 py-2 bg-primary-100 text-base-100 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
			>
				+ Agregar
			</button>
		</div>
	</div>

	{#if rules.length > 0}
		<div class="space-y-3">
			{#each rules as rule, index (index)}
				<div
					class="flex items-center justify-between p-3 bg-base-100 border border-base-400 rounded-lg group"
				>
					<div class="flex items-center gap-3">
						{#if rule.tag_objetivo}
							{@const tag = getTag(rule.tag_objetivo)}
							{#if tag}
								{@const tagColor = getTagHexColor(tag.color)}
								<div
									class="w-3 h-3 rounded-full shadow-xs"
									style="background-color: {tagColor}"
								></div>
							{/if}
						{/if}
						<span class="font-medium text-content/90">
							{formatRule(rule)}
						</span>
					</div>

					<button
						onclick={() => removeRule(index)}
						class="text-content/20 hover:text-error-100 p-2 hover:bg-error-400 rounded-lg transition-all cursor-pointer"
						title="Eliminar regla"
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
