<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { onMount } from 'svelte';
	import { parseScript, extractFreeVariables, extractDomains } from '@ramo-libre/dsl-parser';
	import ScriptViewer from './_components/ScriptViewer.svelte';
	import ScriptEditor from './_components/ScriptEditor.svelte';
	import GradeInputs from './_components/GradeInputs.svelte';
	import StrategySelector from './_components/StrategySelector.svelte';
	import StatusPanel from './_components/StatusPanel.svelte';
	import ComputedVariables from './_components/ComputedVariables.svelte';
	import RamosDashboard from './_components/RamosDashboard.svelte';
	import type { RenderType } from '$lib/features/notas.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let worker: Worker | null = null;
	let dashboardResults = $state<Map<string, { feasible: boolean; probability: number } | null>>(new Map());

	onMount(() => {
		worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (e: MessageEvent<{ requestId: number; result?: any; error?: string; ramoId?: string }>) => {
			const { requestId, result, error, ramoId } = e.data;
			if (ramoId) {
				if (error) {
					dashboardResults.set(ramoId, null);
				} else {
					dashboardResults.set(ramoId, { feasible: result.feasible, probability: result.probability });
				}
				dashboardResults = new SvelteMap(dashboardResults);
				return;
			}
			if (requestId !== solveRequestId) return;
			if (error) {
				solveError = error;
				solverResult = null;
			} else {
				console.log('🧮 Solver result:', result);
				solverResult = result;
				solveError = null;
			}
			isSolving = false;
		};
	});

	let selectedRamoId = $state('');
	let selectedStrategy = $state('punto_medio');
	let showEditor = $state(false);

	let solveRequestId = 0;
	let solverResult = $state<{
		feasible: boolean;
		plan: Record<string, number>;
		probability: number;
		constraint_violations: string[];
		libertad: { label?: string; raw: string; slack: number; penalty: number }[];
	} | null>(null);
	let isSolving = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let solveError = $state<string | null>(null);

	let ramoNotas = $derived(selectedRamoId ? semestre.notas.get(selectedRamoId) : null);
	let scriptRaw = $derived(ramoNotas?.scriptRaw ?? '');
	let variableEntries = $derived(ramoNotas?.variableEntries ?? {});
	let renderTypes = $derived<RenderType[]>(ramoNotas?.renderTypes ?? ['constraint']);

	let statements = $derived(parseScript(scriptRaw));
	let freeVariables = $derived(extractFreeVariables(statements));
	let domains = $derived(extractDomains(statements));
	let assignedVarNames = $derived(
		statements.filter((s) => s.type === 'assignment').map((s) => s.lhs)
	);

	let fullScript = $derived.by(() => {
		if (!scriptRaw) return '';
		const fixed = Object.entries(variableEntries)
			.filter(([, v]) => v !== null)
			.map(([k, v]) => `${k} = ${v}`)
			.join('\n');
		return fixed ? scriptRaw + '\n' + fixed : scriptRaw;
	});

	function handleSelectRamo(id: string) {
		if (id === selectedRamoId) return;
		selectedRamoId = id;
		if (browser) window.location.hash = id;
		solverResult = null;
		solveError = null;
	}

	function handleGradeChange(variable: string, value: number | null) {
		if (!selectedRamoId) return;
		semestre.notas.setVariableEntry(selectedRamoId, variable, value);
	}

	function handleStrategyChange(strategy: string) {
		if (strategy === selectedStrategy) return;
		selectedStrategy = strategy;
		solverResult = null;
	}

	$effect(() => {
		if (!browser) return;
		const fragment = page.url.hash.slice(1);
		if (fragment && semestre.ramos.has(fragment)) {
			selectedRamoId = fragment;
		}
	});

	$effect(() => {
		const fs = fullScript;
		const strat = selectedStrategy;
		if (!fs || !selectedRamoId || !worker || !scriptRaw.trim() || statements.length === 0) {
			solverResult = null;
			isSolving = false;
			solveError = null;
			return;
		}

		const requestId = ++solveRequestId;
		isSolving = true;
		solveError = null;

		worker.postMessage({ fs, strategy: strat, requestId });
	});

	$effect(() => {
		if (!worker || selectedRamoId) return;
		dashboardResults = new SvelteMap();
		for (const [id] of semestre.ramos.list) {
			const data = semestre.notas.get(id);
			const raw = data?.scriptRaw ?? '';
			const entries = data?.variableEntries ?? {};
			if (!raw.trim()) continue;
			const fixed = Object.entries(entries)
				.filter(([, v]) => v !== null)
				.map(([k, v]) => `${k} = ${v}`)
				.join('\n');
			const full = fixed ? raw + '\n' + fixed : raw;
			const stmts = parseScript(raw);
			if (stmts.length === 0) continue;
			worker.postMessage({ fs: full, strategy: 'punto_medio', requestId: ++solveRequestId, ramoId: id });
		}
	});
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-4">
	{#if selectedRamoId}
		<div class="bg-base-100 border border-base-400 rounded-xl p-4">
			<h3 class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-3">Ramos</h3>
			{#if semestre.ramos.empty()}
				<p class="text-sm text-content/30 text-center py-4">Sin ramos.</p>
			{:else}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
					{#each semestre.ramos.list as [id, ramo] (id)}
						<button
							onclick={() => handleSelectRamo(id)}
							class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer {selectedRamoId ===
							id
								? 'bg-primary-100/10 border border-primary-100/30'
								: 'hover:bg-base-200 border border-transparent'}"
						>
							<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"></span>
							<span class="text-sm font-medium text-content truncate">{ramo.name}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if !selectedRamoId}
		{@const total = semestre.ramos.list.length}
		{@const counts = (() => {
			let sinDatos = 0, garantizados = 0, factibles = 0, noFactibles = 0, resolviendo = 0;
			for (const [id] of semestre.ramos.list) {
				const data = semestre.notas.get(id);
				if (!data?.scriptRaw?.trim()) { sinDatos++; continue; }
				const r = dashboardResults.get(id);
				if (r === undefined) { resolviendo++; continue; }
				if (r === null) { noFactibles++; continue; }
				if (r.feasible && r.probability >= 0.9999) { garantizados++; continue; }
				if (r.feasible) { factibles++; continue; }
				noFactibles++;
			}
			return { sinDatos, garantizados, factibles, noFactibles, resolviendo };
		})()}
		{@const segments = [
			{ count: counts.garantizados, color: 'bg-success-100', label: 'Garantizado' },
			{ count: counts.factibles, color: 'bg-primary-100', label: 'Factible' },
			{ count: counts.noFactibles, color: 'bg-error-100', label: 'No factible' },
			{ count: counts.sinDatos, color: 'bg-base-300', label: 'Sin datos' },
			{ count: counts.resolviendo, color: 'bg-content/20 animate-pulse', label: 'Resolviendo' },
		].filter(s => s.count > 0)}
		<div class="bg-base-100 border border-base-400 rounded-xl p-5">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-content/70">Progreso Semestral</h3>
				<span class="text-sm tabular-nums text-content/50">{total} ramos</span>
			</div>
			<div class="h-3 bg-base-300 rounded-full overflow-hidden flex">
				{#each segments as seg (seg.label)}
					<div class="{seg.color} h-full transition-all duration-500" style="width: {(seg.count / total) * 100}%"></div>
				{/each}
			</div>
			<div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-content/50">
				{#each segments as seg (seg.label)}
					<span class="flex items-center gap-1.5">
						<span class="w-2 h-2 rounded-full {seg.color.replace('animate-pulse', '').trim()}"></span>
						{seg.count} {seg.label.toLowerCase()}{seg.count !== 1 ? 's' : ''}
					</span>
				{/each}
			</div>
		</div>
		<RamosDashboard results={dashboardResults} onSelect={handleSelectRamo} />
	{:else}
		<StatusPanel
			feasible={solverResult?.feasible ?? null}
			probability={solverResult?.probability ?? null}
			constraintViolations={solverResult?.constraint_violations ?? []}
			libertad={solverResult?.libertad ?? []}
			{isSolving}
		/>

		<StrategySelector selected={selectedStrategy} onSelect={handleStrategyChange} />

		<ScriptViewer {scriptRaw} {renderTypes} onEdit={() => (showEditor = true)} />

		<GradeInputs
			{freeVariables}
			{domains}
			{variableEntries}
			plan={solverResult?.plan ?? null}
			onChange={handleGradeChange}
		/>

		<ComputedVariables plan={solverResult?.plan ?? null} {assignedVarNames} />
	{/if}
</div>

<ScriptEditor ramoId={selectedRamoId} show={showEditor} onClose={() => (showEditor = false)} />
