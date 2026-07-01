<script lang="ts">
	import { tick } from 'svelte';
	import { Database, RefreshCw, Trash2, Check, PartyPopper } from '@lucide/svelte';
	import type { LogEntry, MockDataOutputV2 } from '$lib/dev-tools/simulate';
	import { semestre } from '$lib/infra/semestres.svelte';

	let params = $state({
		semestres: 1,
		ramos: 7,
		oneoff: 100,
		recurrent: 10,
		escenarios: 10
	});

	let logs = $state<LogEntry[]>([]);
	let generatedData = $state<MockDataOutputV2 | null>(null);
	let loading = $state(false);
	let applied = $state(false);
	let logContainer = $state<HTMLDivElement>();

	async function handleGenerate() {
		loading = true;
		logs = [];
		generatedData = null;
		applied = false;
		await tick();
		const mod = await import('$lib/dev-tools/simulate');
		const result = await mod.simulate({ ...params });
		logs = result.logs;
		generatedData = result.data;
		loading = false;
		requestAnimationFrame(() => {
			if (logContainer) logContainer.scrollTop = 0;
		});
	}

	function handleApply() {
		if (!generatedData) return;
		semestre.applyMock(generatedData);
		applied = true;
	}

	function handleClear() {
		logs = [];
		generatedData = null;
		applied = false;
	}
</script>

<div class="bg-base-200 border border-base-300 rounded-xl overflow-hidden shadow-sm">
	<div class="bg-base-100 px-3 py-2 border-b border-base-300 flex items-center justify-between">
		<div class="flex items-center gap-1.5">
			<Database class="h-3.5 w-3.5 text-primary-100" />
			<span class="text-[10px] font-bold text-content/50 uppercase tracking-widest">Generador de Datos</span>
		</div>
		{#if logs.length > 0}
			<button onclick={handleClear} class="flex items-center gap-1 text-[9px] font-bold text-content/30 hover:text-error-100 uppercase tracking-wider cursor-pointer transition-colors">
				<Trash2 size={11} />
				Limpiar
			</button>
		{/if}
	</div>

	<div class="p-3 space-y-2.5">
		<div class="grid grid-cols-5 gap-2">
			{#each Object.keys(params) as key (key)}
				<div class="flex flex-col gap-0.5">
					<label for="v2-{key}" class="text-[9px] font-bold text-content/40 uppercase tracking-wider">
						{key}
					</label>
					<input
						id="v2-{key}"
						type="number"
						bind:value={params[key as keyof typeof params]}
						class="bg-base-300 border border-base-400 rounded-md px-2 py-1 text-[11px] text-content focus:ring-2 focus:ring-primary-100/30 focus:border-primary-100 focus:outline-none transition-all w-full"
					/>
				</div>
			{/each}
		</div>

		<button
			onclick={handleGenerate}
			disabled={loading}
			class="w-full flex items-center justify-center gap-2 bg-primary-100 text-base-100 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
		>
			<RefreshCw size={14} class={loading ? 'animate-spin' : ''} />
			{loading ? 'Generando…' : 'Generar y simular'}
		</button>

		{#if logs.length > 0}
			<div
				bind:this={logContainer}
				class="bg-base-300/60 border border-base-400 rounded-lg overflow-y-auto max-h-[400px] custom-scroll"
			>
				<div class="p-2 space-y-0.5">
					{#each logs as log (log.id)}
						<div
							class="flex items-start gap-2 px-2 py-1 rounded text-[11px] leading-snug"
							style="padding-left: {8 + log.indent * 16}px"
						>
							<span class="shrink-0 w-4 text-center text-[11px]">{log.icon}</span>
							{#if log.label}<span class="font-semibold text-content/70 shrink-0">{log.label}:</span>{/if}
							<span class="text-content/50 break-all">{log.detail}</span>
						</div>
					{/each}
				</div>
			</div>

			<button
				onclick={handleApply}
				disabled={applied}
				class="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed {applied
					? 'bg-success-100/20 text-success-100 border border-success-200/30'
					: 'bg-success-400 text-success-100 hover:opacity-90 active:scale-95 border border-success-300'}"
			>
				{#if applied}
					<PartyPopper size={14} />
					¡Datos Aplicados!
				{:else}
					<Check size={14} />
					Aplicar a LocalStorage
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	input[type='number'] {
		-webkit-appearance: textfield !important;
		appearance: textfield !important;
		margin: 0;
		-moz-appearance: textfield !important;
	}
	.custom-scroll::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: var(--color-base-400);
		border-radius: 4px;
	}
</style>
