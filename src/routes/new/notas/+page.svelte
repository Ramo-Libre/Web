<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { onMount, untrack } from 'svelte';
	import { parseScript, extractFreeVariables, extractDomains } from '@ramo-libre/dsl-parser';
	import ScriptViewer from './_components/ScriptViewer.svelte';
	import ScriptEditor from './_components/ScriptEditor.svelte';
	import GradeInputs from './_components/GradeInputs.svelte';
	import StrategySelector from './_components/StrategySelector.svelte';
	import StatusPanel from './_components/StatusPanel.svelte';
	import ComputedVariables from './_components/ComputedVariables.svelte';
	import { ArrowLeft, Trash2, Plus } from '@lucide/svelte';
	import EscenarioGrid from './_components/EscenarioGrid.svelte';
	import CreateEscenarioDrawer from './_components/CreateEscenarioDrawer.svelte';
	import type { RenderType, Escenario } from '$lib/features/notas.svelte';
	import { hashContext } from '$lib/features/notas.svelte';

	let worker: Worker | null = null;
	let dashboardResults = $state<Map<string, { feasible: boolean; probability: number } | null>>(
		new Map()
	);

	onMount(() => {
		worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (
			e: MessageEvent<{ requestId: number; result?: any; error?: string; escenarioId?: string }>
		) => {
			const { requestId, result, error, escenarioId } = e.data;
			if (escenarioId) {
				if (error) {
					dashboardResults.set(escenarioId, null);
				} else {
					const esc = semestre.escenarios.get(escenarioId);
					dashboardResults.set(escenarioId, {
						feasible: result.feasible,
						probability: result.probability
					});
					const res = {
						feasible: result.feasible,
						plan: result.plan,
						probability: result.probability,
						constraint_violations: result.constraint_violations ?? [],
						libertad: result.libertad ?? []
					};
					semestre.escenarios.setLastResult(escenarioId, res);
					if (esc) {
						const fixed = Object.entries(esc.variableEntries)
							.filter(([, v]) => v !== null)
							.map(([k, v]) => `${k} = ${v}`)
							.join('\n');
						const full = fixed ? esc.scriptRaw + '\n' + fixed : esc.scriptRaw;
						const strategy = esc.lastStrategy || 'punto_medio';
						semestre.escenarios.setLastHash(escenarioId, hashContext(full, strategy));
					}
				}
				dashboardResults = new Map(dashboardResults);
				return;
			}
			if (requestId !== solveRequestId) return;
			if (error) {
				solveError = error;
				solverResult = null;
			} else {
				solverResult = {
					feasible: result.feasible,
					plan: result.plan,
					probability: result.probability,
					constraint_violations: result.constraint_violations ?? [],
					libertad: result.libertad ?? []
				};
				solveError = null;
				if (selectedEscenarioId) {
					semestre.escenarios.setLastResult(selectedEscenarioId, solverResult);
					const esc = semestre.escenarios.get(selectedEscenarioId);
					if (esc) {
						const fixed = Object.entries(esc.variableEntries)
							.filter(([, v]) => v !== null)
							.map(([k, v]) => `${k} = ${v}`)
							.join('\n');
						const full = fixed ? esc.scriptRaw + '\n' + fixed : esc.scriptRaw;
						semestre.escenarios.setLastHash(
							selectedEscenarioId,
							hashContext(full, selectedStrategy)
						);
					}
				}
			}
			isSolving = false;
		};
	});

	let selectedEscenarioId = $state('');
	let selectedStrategy = $state('punto_medio');
	let showEditor = $state(false);
	let showCreateDrawer = $state(false);
	let createPreselectRamoId = $state<string | undefined>(undefined);

	let solveRequestId = 0;
	let dashboardSolveTrigger = $state(0);
	let solverResult = $state<{
		feasible: boolean;
		plan: Map<string, number>;
		probability: number;
		constraint_violations: string[];
		libertad: { label?: string; raw: string; slack: number; penalty: number }[];
	} | null>(null);
	let isSolving = $state(false);
	let solveError = $state<string | null>(null);

	let escenario = $derived<Escenario | null>(
		selectedEscenarioId ? (semestre.escenarios.get(selectedEscenarioId) ?? null) : null
	);
	let scriptRaw = $derived(escenario?.scriptRaw ?? '');
	let variableEntries = $derived(escenario?.variableEntries ?? {});
	let renderTypes = $derived<RenderType[]>(escenario?.renderTypes ?? ['constraint']);

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

	let escenarioName = $state('');
	let escenarioRamoId = $state('');

	$effect(() => {
		if (!selectedEscenarioId) return;
		const e = semestre.escenarios.get(selectedEscenarioId);
		if (!e) return;
		escenarioName = e.name;
		escenarioRamoId = e.ramoId ?? '';
	});

	function handleSelectEscenario(id: string) {
		if (id === selectedEscenarioId) return;
		selectedEscenarioId = id;
		if (browser) window.location.hash = id;
		const esc = semestre.escenarios.get(id);
		solverResult = esc?.lastResult ?? null;
		solveError = null;
		selectedStrategy = esc?.lastStrategy ?? 'punto_medio';
	}

	function handleBack() {
		selectedEscenarioId = '';
		solverResult = null;
		solveError = null;
		dashboardSolveTrigger++;
		if (browser) window.location.hash = '';
	}

	function handleGradeChange(variable: string, value: number | null) {
		if (!selectedEscenarioId) return;
		semestre.escenarios.setVariableEntry(selectedEscenarioId, variable, value);
	}

	function handleStrategyChange(strategy: string) {
		if (strategy === selectedStrategy) return;
		selectedStrategy = strategy;
		solverResult = null;
		if (selectedEscenarioId) {
			semestre.escenarios.update(selectedEscenarioId, { lastStrategy: strategy });
		}
	}

	function openCreate(ramoId?: string) {
		createPreselectRamoId = ramoId;
		showCreateDrawer = true;
	}

	function escenarioRamo(esc: Escenario): { name: string; color: string } | null {
		if (!esc.ramoId) return null;
		const ramo = semestre.ramos.get(esc.ramoId);
		return ramo ?? null;
	}

	let escenariosConRamo = $derived(semestre.escenarios.all().filter((e) => e.ramoId));
	let ramosSinEscenario = $derived(
		Array.from(semestre.ramos.list).filter(
			([id]) => !escenariosConRamo.some((e) => e.ramoId === id)
		)
	);

	$effect(() => {
		if (!browser) return;
		const fragment = page.url.hash.slice(1);
		if (fragment && semestre.escenarios.get(fragment)) {
			selectedEscenarioId = fragment;
			const esc = semestre.escenarios.get(fragment);
			solverResult = esc?.lastResult ?? null;
			selectedStrategy = esc?.lastStrategy ?? 'punto_medio';
		}
	});

	$effect(() => {
		const fs = fullScript;
		const strat = selectedStrategy;
		if (!fs || !selectedEscenarioId || !worker || !scriptRaw.trim() || statements.length === 0) {
			if (selectedEscenarioId) {
				solverResult ??= semestre.escenarios.get(selectedEscenarioId)?.lastResult ?? null;
			}
			isSolving = false;
			solveError = null;
			return;
		}

		const esc = semestre.escenarios.get(selectedEscenarioId);
		const h = hashContext(fs, strat);
		if (esc?.lastResult && esc.lastHash === h) {
			solverResult = esc.lastResult;
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
		if (!worker || selectedEscenarioId) return;
		dashboardSolveTrigger;
		untrack(() => {
			dashboardResults = new Map();
			for (const esc of semestre.escenarios.all()) {
				const raw = esc.scriptRaw;
				const entries = esc.variableEntries;
				if (!raw.trim()) continue;
				const fixed = Object.entries(entries)
					.filter(([, v]) => v !== null)
					.map(([k, v]) => `${k} = ${v}`)
					.join('\n');
				const full = fixed ? raw + '\n' + fixed : raw;
				const stmts = parseScript(raw);
				if (stmts.length === 0) continue;
				const strategy = esc.lastStrategy || 'punto_medio';
				const h = hashContext(full, strategy);
				if (esc.lastResult && esc.lastHash === h) {
					dashboardResults.set(esc.id, {
						feasible: esc.lastResult.feasible,
						probability: esc.lastResult.probability
					});
					continue;
				}
				worker.postMessage({
					fs: full,
					strategy,
					requestId: ++solveRequestId,
					escenarioId: esc.id
				});
			}
		});
	});
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-4">
	{#if !selectedEscenarioId}
		{@const escs = semestre.escenarios.all()}
		{@const total = escs.length}
		{@const counts = (() => {
			let garantizados = 0,
				factibles = 0,
				noFactibles = 0,
				resolviendo = 0;
			for (const esc of escs) {
				if (!esc.scriptRaw.trim()) continue;
				const r = dashboardResults.get(esc.id);
				if (r === undefined) {
					resolviendo++;
					continue;
				}
				if (r === null) {
					noFactibles++;
					continue;
				}
				if (r.feasible && r.probability >= 0.9999) {
					garantizados++;
					continue;
				}
				if (r.feasible) {
					factibles++;
					continue;
				}
				noFactibles++;
			}
			const sinDatos = escs.length - resolviendo - noFactibles - garantizados - factibles;
			return { sinDatos, garantizados, factibles, noFactibles, resolviendo };
		})()}
		{@const segments = [
			{ count: counts.garantizados, color: 'bg-success-100', label: 'Garantizado' },
			{ count: counts.factibles, color: 'bg-primary-100', label: 'Factible' },
			{ count: counts.noFactibles, color: 'bg-error-100', label: 'No factible' },
			{ count: counts.sinDatos, color: 'bg-base-300', label: 'Sin datos' },
			{ count: counts.resolviendo, color: 'bg-content/20 animate-pulse', label: 'Resolviendo' }
		].filter((s) => s.count > 0)}
		<div class="bg-base-100 border border-base-400 rounded-xl p-5">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-content/70">Estado</h3>
				<span class="text-sm tabular-nums text-content/50">{total} escenarios</span>
			</div>
			{#if total > 0}
				<div class="h-3 bg-base-300 rounded-full overflow-hidden flex">
					{#each segments as seg (seg.label)}
						<div
							class="{seg.color} h-full transition-all duration-500"
							style="width: {(seg.count / total) * 100}%"
						></div>
					{/each}
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-content/50">
					{#each segments as seg (seg.label)}
						<span class="flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full {seg.color.replace('animate-pulse', '').trim()}"
							></span>
							{seg.count}
							{seg.label.toLowerCase()}{seg.count !== 1 ? 's' : ''}
						</span>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-content/30 italic">Crea un escenario para empezar</p>
			{/if}
		</div>

		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-content/50 uppercase tracking-wider">Escenarios</h3>
			<button
				onclick={() => openCreate()}
				class="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				Nuevo
			</button>
		</div>

		<EscenarioGrid
			results={dashboardResults}
			onSelect={handleSelectEscenario}
			onCreate={openCreate}
			{ramosSinEscenario}
		/>
	{:else}
		{@const ri = escenario ? escenarioRamo(escenario) : null}
		<div class="bg-base-100 border border-base-400 rounded-xl p-4 space-y-3">
			<div class="flex items-center gap-3">
				<button
					onclick={handleBack}
					class="p-1.5 rounded-lg text-content/40 hover:text-content hover:bg-base-200 transition-colors cursor-pointer shrink-0"
					aria-label="Volver"
				>
					<ArrowLeft class="w-5 h-5" />
				</button>
				{#if ri}
					<span class="w-3 h-3 rounded-full shrink-0" style="background: {ri.color}"></span>
				{/if}
				<input
					bind:value={escenarioName}
					placeholder="Nombre del escenario"
					class="flex-1 bg-transparent border-none outline-none text-lg font-bold text-content placeholder-content/20 p-0 min-w-0"
					onblur={() => {
						if (selectedEscenarioId && escenarioName.trim()) {
							semestre.escenarios.update(selectedEscenarioId, { name: escenarioName.trim() });
						}
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
					}}
				/>
				<button
					onclick={() => {
						if (!selectedEscenarioId) return;
						semestre.escenarios.remove(selectedEscenarioId);
						handleBack();
					}}
					class="p-1.5 rounded-lg text-content/40 hover:text-error-100 hover:bg-error-100/10 transition-colors cursor-pointer shrink-0"
					aria-label="Eliminar escenario"
				>
					<Trash2 class="w-5 h-5" />
				</button>
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => {
						if (!selectedEscenarioId) return;
						const next = escenarioRamoId ? '' : escenarioRamoId;
						semestre.escenarios.update(selectedEscenarioId, { ramoId: next || undefined });
						escenarioRamoId = next;
					}}
					class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {!escenarioRamoId
						? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
						: 'text-content/40 border-transparent hover:text-content/70'}"
				>
					<div class="w-2.5 h-2.5 rounded-full bg-base-300 shrink-0"></div>
					Ninguno
				</button>
				{#each semestre.ramos.list as [id, ramo]}
					<button
						onclick={() => {
							if (!selectedEscenarioId) return;
							const next = escenarioRamoId === id ? '' : id;
							semestre.escenarios.update(selectedEscenarioId, { ramoId: next || undefined });
							escenarioRamoId = next;
						}}
						class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium {escenarioRamoId ===
						id
							? 'bg-primary-100/10 text-primary-100 border-primary-100/30'
							: 'text-content/40 border-transparent hover:text-content/70'}"
					>
						<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {ramo.color}"></span>
						{ramo.name}
					</button>
				{/each}
			</div>
		</div>

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

		<ComputedVariables plan={solverResult?.plan ?? null} {assignedVarNames} />
	{/if}
</div>

<CreateEscenarioDrawer
	show={showCreateDrawer}
	preselectRamoId={createPreselectRamoId}
	onCreate={(id) => {
		showCreateDrawer = false;
		handleSelectEscenario(id);
	}}
	onClose={() => (showCreateDrawer = false)}
/>

<ScriptEditor
	escenarioId={selectedEscenarioId || null}
	show={showEditor}
	onClose={() => (showEditor = false)}
/>
