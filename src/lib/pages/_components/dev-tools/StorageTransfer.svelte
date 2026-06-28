<script lang="ts">
	import { browser } from '$app/environment';
	import { Download, Upload, FileJson, Save } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let targetKey = $state('db_storage'); // Key por defecto
	let uploadStatus = $state<{ msg: string; error: boolean } | null>(null);
	let fileInput: HTMLInputElement;

	// --- EXPORTAR ---
	function exportKey() {
		if (!browser) return;
		const data = localStorage.getItem(targetKey);

		if (!data) {
			uploadStatus = { msg: `La key "${targetKey}" está vacía`, error: true };
			return;
		}

		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${targetKey}_${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);

		uploadStatus = { msg: 'Archivo exportado con éxito', error: false };
		setTimeout(() => (uploadStatus = null), 3000);
	}

	// --- IMPORTAR ---
	async function handleFileUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				// Validar que sea JSON válido antes de guardar
				JSON.parse(content);

				localStorage.setItem(targetKey, content);
				uploadStatus = { msg: `Importado en "${targetKey}" correctamente`, error: false };

				// Opcional: Recargar para aplicar cambios si es la db principal
				if (targetKey === 'db_storage') {
					if (confirm('Se ha actualizado la base de datos principal. ¿Recargar página?')) {
						window.location.reload();
					}
				}
			} catch {
				uploadStatus = { msg: 'Error: El archivo no es un JSON válido', error: true };
			}
		};
		reader.readAsText(file);
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2 text-config-100">
			<FileJson size={20} />
			<h2 class="font-bold text-content">Import / Export Storage</h2>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<label
				for="target-key"
				class="text-[10px] font-bold text-content/50 uppercase tracking-tighter"
			>
				Key de LocalStorage (Destino/Origen)
			</label>
			<div class="relative">
				<div
					class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-content/30"
				>
					<Save size={14} />
				</div>
				<input
					id="target-key"
					type="text"
					bind:value={targetKey}
					placeholder="Ej: db_storage"
					class="w-full bg-base-200 border border-base-400 rounded-xl pl-9 pr-4 py-2 text-xs text-content font-mono focus:ring-2 focus:ring-config-100 focus:outline-none transition-all"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<button
				onclick={exportKey}
				class="flex flex-col items-center justify-center gap-2 p-4 bg-base-200 border border-base-400 rounded-xl hover:bg-base-300 transition-all group cursor-pointer"
			>
				<Download size={20} class="text-config-100 group-hover:scale-110 transition-transform" />
				<span class="text-[10px] font-bold text-content/60 uppercase">Exportar JSON</span>
			</button>

			<button
				onclick={() => fileInput.click()}
				class="flex flex-col items-center justify-center gap-2 p-4 bg-base-200 border border-base-400 rounded-xl hover:bg-base-300 transition-all group cursor-pointer"
			>
				<Upload size={20} class="text-primary-100 group-hover:scale-110 transition-transform" />
				<span class="text-[10px] font-bold text-content/60 uppercase">Importar JSON</span>
			</button>
		</div>

		<input
			type="file"
			accept=".json"
			bind:this={fileInput}
			onchange={handleFileUpload}
			class="hidden"
		/>

		{#if uploadStatus}
			<div
				transition:slide
				class="p-3 rounded-xl border flex items-center gap-2 {uploadStatus.error
					? 'bg-error-400/10 border-error-100 text-error-100'
					: 'bg-success-400/10 border-success-100 text-success-100'}"
			>
				<span class="text-[11px] font-medium leading-tight">{uploadStatus.msg}</span>
			</div>
		{/if}

		<p class="text-[10px] text-content/30 italic leading-tight text-center px-4">
			Advertencia: Importar un JSON sobre una key existente sobrescribirá los datos actuales
			inmediatamente.
		</p>
	</div>
</div>
