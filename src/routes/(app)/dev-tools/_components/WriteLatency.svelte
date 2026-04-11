<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Zap, Activity, AlertCircle, RefreshCw } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	// --- ESTADOS ---
	let keys = $state<string[]>([]);
	let selectedKey = $state('');
	let iterations = $state(50);

	let isRunning = $state(false);
	let results = $state<{
		mean: number;
		variance: number;
		stdev: number;
		sizeKB: number;
		samples: number[];
	} | null>(null);

	// --- LÓGICA ---

	// Usamos onMount para cargar las keys al inicio sin causar bucles de efectos
	onMount(() => {
		refreshKeys();
	});

	function refreshKeys() {
		if (!browser) return;
		const currentKeys = Object.keys(localStorage);
		keys = currentKeys;

		// Si la key seleccionada ya no existe o no hay ninguna, resetear
		if (keys.length > 0 && (!selectedKey || !keys.includes(selectedKey))) {
			selectedKey = keys[0];
		}
	}

	function runBenchmark() {
		if (!selectedKey || isRunning) return;

		const dataToTest = localStorage.getItem(selectedKey) || '';
		if (!dataToTest) return;

		isRunning = true;
		const samples: number[] = [];
		const testKey = '__bench_test_v2__';

		// Pequeño timeout para permitir que la UI muestre el estado "Procesando"
		setTimeout(() => {
			try {
				for (let i = 0; i < iterations; i++) {
					const start = performance.now();
					localStorage.setItem(testKey, dataToTest);
					const end = performance.now();
					samples.push(end - start);

					localStorage.removeItem(testKey);
				}

				// Cálculos estadísticos
				const n = samples.length;
				const mean = samples.reduce((a, b) => a + b, 0) / n;
				const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;

				results = {
					mean,
					variance,
					stdev: Math.sqrt(variance),
					sizeKB: (dataToTest.length * 2) / 1024,
					samples
				};
			} catch (e) {
				console.error('Benchmark failed:', e);
				alert('Error al escribir en LocalStorage. ¿Quizás excediste el cupo de 5MB?');
			} finally {
				isRunning = false;
			}
		}, 50);
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 text-config-100">
			<Activity size={20} />
			<h2 class="font-bold text-content">Benchmark de Escritura</h2>
		</div>
		<button
			onclick={refreshKeys}
			class="flex items-center gap-1 text-[10px] font-bold text-config-100 hover:text-config-100/70 transition-colors uppercase tracking-wider cursor-pointer"
		>
			<RefreshCw size={10} />
			Refrescar
		</button>
	</div>

	<div class="flex flex-col gap-4">
		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1">
				<label
					for="source-key"
					class="text-[10px] font-bold text-content/50 uppercase tracking-tighter"
				>
					Key de origen
				</label>
				<select
					id="source-key"
					bind:value={selectedKey}
					class="bg-base-200 border border-base-400 rounded-lg px-2 py-2 text-xs text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all cursor-pointer"
				>
					{#each keys as key (key)}
						<option value={key}>{key}</option>
					{:else}
						<option value="">No hay llaves</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<label
					for="iterations"
					class="text-[10px] font-bold text-content/50 uppercase tracking-tighter"
				>
					Iteraciones
				</label>
				<input
					id="iterations"
					type="number"
					bind:value={iterations}
					min="1"
					max="100"
					class="bg-base-200 border border-base-400 rounded-lg px-2 py-2 text-xs text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
				/>
			</div>
		</div>

		<button
			onclick={runBenchmark}
			disabled={isRunning || !selectedKey}
			class="w-full bg-primary-100 text-base-100 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-config-100/10"
		>
			{#if isRunning}
				<div
					class="animate-spin h-4 w-4 border-2 border-base-100 border-t-transparent rounded-full"
				></div>
				<span>Procesando Benchmark...</span>
			{:else}
				<Zap size={16} />
				<span>Correr Test de Latencia</span>
			{/if}
		</button>

		{#if results}
			<div transition:slide class="space-y-4 pt-2">
				<div class="grid grid-cols-2 gap-3">
					<div class="p-3 bg-base-200 border border-base-300 rounded-xl">
						<span class="text-[10px] font-bold text-content/40 uppercase block mb-1">Media (μ)</span
						>
						<div class="flex items-baseline gap-1">
							<span class="text-xl font-black text-content">{results.mean.toFixed(3)}</span>
							<span class="text-[10px] font-bold text-content/40">ms</span>
						</div>
					</div>
					<div class="p-3 bg-base-200 border border-base-300 rounded-xl">
						<span class="text-[10px] font-bold text-content/40 uppercase block mb-1"
							>Varianza (σ²)</span
						>
						<span class="text-xl font-black text-content">{results.variance.toFixed(4)}</span>
					</div>
				</div>

				<div
					class="flex items-center justify-between px-2 text-[10px] font-mono text-content/40 bg-base-200/50 py-2 rounded-lg border border-base-300/50"
				>
					<div class="flex flex-col">
						<span class="text-[8px] uppercase font-bold opacity-50">Tamaño Data</span>
						<span class="text-content/70">{results.sizeKB.toFixed(2)} KB</span>
					</div>
					<div class="flex flex-col text-right">
						<span class="text-[8px] uppercase font-bold opacity-50">Desviación (σ)</span>
						<span class="text-content/70">±{results.stdev.toFixed(3)} ms</span>
					</div>
				</div>

				{#if results.variance > 1}
					<div
						transition:slide
						class="flex items-start gap-2 p-3 bg-error-400/10 border border-error-100/30 rounded-xl text-error-100"
					>
						<AlertCircle size={14} class="shrink-0 mt-0.5" />
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] font-bold leading-none">Inestabilidad detectada</span>
							<span class="text-[10px] opacity-80 leading-tight"
								>La varianza es alta. El Main Thread o el disco están ocupados.</span
							>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Quitamos las flechitas del input number para que se vea más limpio */
	input[type='number'] {
		-webkit-appearance: textfield !important;
		appearance: textfield !important;
		margin: 0;
		-moz-appearance: textfield !important;
	}
</style>
