<script lang="ts">
	import MockDataGenerator, { type MockDataOutput } from '$lib/dev-tools/gen';
	import {
		Database,
		Check,
		RefreshCw,
		Code2,
		Copy,
		AlertCircle,
		Trash2,
		PartyPopper
	} from '@lucide/svelte';
	import { db } from '$lib';
	import { slide, fade } from 'svelte/transition';

	let params = $state({
		semestres: 2,
		ramos: 5,
		eventos: 10,
		horarios: 3,
		notas: 4
	});

	let generatedData = $state<MockDataOutput | null>(null);
	let jsonString = $state('');
	let isValidJson = $state(true);
	let isCopied = $state(false);
	let isApplied = $state(false); // Estado para el feedback de inyección

	function handleGenerate() {
		generatedData = MockDataGenerator.generate({ ...params });
		jsonString = JSON.stringify(generatedData, null, 2);
		isValidJson = true;
		isApplied = false; // Resetear éxito al generar nuevo
	}

	function handleClear() {
		generatedData = null;
		jsonString = '';
		isValidJson = true;
		isApplied = false;
	}

	function handleApply() {
		try {
			const dataToApply = JSON.parse(jsonString) as MockDataOutput;
			db.fromMock(dataToApply);
			isValidJson = true;

			// Feedback visual de éxito
			isApplied = true;
			setTimeout(() => {
				isApplied = false;
			}, 4000);
		} catch {
			isValidJson = false;
		}
	}

	function copyToClipboard() {
		if (!jsonString) return;
		navigator.clipboard.writeText(jsonString);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 2000);
	}

	function handleJsonInput(e: Event) {
		const value = (e.target as HTMLTextAreaElement).value;
		jsonString = value;
		isApplied = false; // Si edita, el mensaje de "aplicado" desaparece
		try {
			JSON.parse(value);
			isValidJson = true;
		} catch {
			isValidJson = false;
		}
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 text-config-100">
			<Database size={20} />
			<h2 class="font-bold text-content">Generador de Datos</h2>
		</div>
		{#if isApplied}
			<div in:fade out:fade class="flex items-center gap-1.5 text-success-100">
				<PartyPopper size={14} />
				<span class="text-[10px] font-bold uppercase tracking-wider">¡Datos Inyectados!</span>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
		{#each Object.keys(params) as key (key)}
			<div class="flex flex-col gap-1">
				<label for={key} class="text-[10px] font-bold text-content/50 uppercase tracking-tighter">
					{key}
				</label>
				<input
					id={key}
					type="number"
					bind:value={params[key as keyof typeof params]}
					class="bg-base-200 border border-base-400 rounded-lg px-2 py-1.5 text-sm text-content focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
				/>
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<button
			onclick={handleGenerate}
			class="flex-1 flex items-center justify-center gap-2 bg-primary-100 text-base-100 py-2 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
		>
			<RefreshCw size={16} />
			Generar
		</button>

		{#if jsonString}
			<button
				onclick={handleClear}
				class="px-4 flex items-center justify-center border border-base-400 text-content/40 hover:text-error-100 hover:border-error-100/30 py-2 rounded-xl transition-all cursor-pointer"
				title="Limpiar salida"
			>
				<Trash2 size={18} />
			</button>
		{/if}

		<button
			onclick={handleApply}
			disabled={!jsonString || !isValidJson}
			class="px-4 flex items-center justify-center {isApplied
				? 'bg-success-300'
				: 'bg-success-400'} border border-success-300 text-success-100 py-2 rounded-xl font-bold hover:bg-success-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer relative overflow-hidden"
		>
			{#if isApplied}
				<div
					in:slide={{ axis: 'y' }}
					class="absolute inset-0 flex items-center justify-center bg-success-100 text-base-100"
				>
					<Check size={20} strokeWidth={3} />
				</div>
			{/if}
			<Check size={18} />
		</button>
	</div>

	{#if jsonString}
		<div class="space-y-2 mt-2">
			{#if isApplied}
				<div
					transition:slide
					class="bg-success-400/10 border border-success-100/20 rounded-lg p-2 flex items-center gap-2 text-success-100 text-[11px] font-medium"
				>
					<Check size={14} />
					<span>Todos los semestres han sido sobrescritos con éxito en LocalStorage.</span>
				</div>
			{/if}

			<div class="flex items-center justify-between">
				<div
					class="flex items-center gap-2 text-xs font-mono {isValidJson
						? 'text-content/50'
						: 'text-error-100'}"
				>
					{#if !isValidJson}
						<AlertCircle size={14} />
						<span class="font-bold">JSON Inválido</span>
					{:else}
						<Code2 size={14} />
						<span>Editor de salida</span>
					{/if}
				</div>
				<button
					onclick={copyToClipboard}
					class="flex items-center gap-1 transition-all cursor-pointer {isCopied
						? 'text-success-100'
						: 'text-content/40 hover:text-content'}"
				>
					{#if isCopied}
						<span class="text-[10px] font-bold uppercase tracking-wider">Copiado</span>
						<Check size={14} />
					{:else}
						<Copy size={14} />
					{/if}
				</button>
			</div>

			<div class="relative group">
				<textarea
					value={jsonString}
					oninput={handleJsonInput}
					spellcheck="false"
					class="w-full bg-base-400/20 p-3 rounded-xl overflow-auto text-[11px] font-mono text-content/70 h-64 border transition-all custom-scroll resize-none focus:outline-none
					{isValidJson ? 'border-base-400 focus:border-config-100' : 'border-error-100 bg-error-400/10'}"
				></textarea>

				{#if isValidJson}
					<div
						class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
					>
						<span class="text-[9px] font-bold text-config-100 uppercase tracking-widest"
							>Editable</span
						>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scroll::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: var(--color-base-400);
		border-radius: 4px;
	}
	input[type='number'] {
		-webkit-appearance: textfield !important;
		appearance: textfield !important;
		margin: 0;
		-moz-appearance: textfield !important;
	}
</style>
