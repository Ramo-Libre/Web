<script lang="ts">
	import { cloud } from '$lib/state/cloud.svelte';
	import { RAMOLIBE_KEY_PREFIX } from '$lib/state/index.svelte';
	import { Download, Upload, AlertTriangle, UserX, Trash } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	// --- ESTADOS ---
	let showDeleteLocalModal = $state(false);
	let showDeleteAccountModal = $state(false);
	let isExporting = $state(false);
	let isImporting = $state(false);
	let fileInput: HTMLInputElement;

	// --- ACCIONES ---
	function handleExportData() {
		isExporting = true;
		let data: Record<string, unknown> = {};
		for (const key in localStorage) {
			if (key.startsWith(RAMOLIBE_KEY_PREFIX)) {
				const key_data = localStorage.getItem(key);
				if (key_data) {
					data[key] = JSON.parse(key_data);
				}
			}
		}
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `ramolibre_backup_${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);

		isExporting = false;
	}

	function handleImportData(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				isImporting = true;
				const content = e.target?.result as string;
				const data = JSON.parse(content);

				// 1. Eliminar de localStorage todo lo que tenga el prefijo
				const keysToRemove: string[] = [];
				for (let i = 0; i < localStorage.length; i++) {
					const key = localStorage.key(i);
					if (key && key.startsWith(RAMOLIBE_KEY_PREFIX)) {
						keysToRemove.push(key);
					}
				}
				keysToRemove.forEach((k) => localStorage.removeItem(k));

				// 2. Cargar a localStorage SOLO las keys que se subieron con el prefijo
				for (const key in data) {
					if (key.startsWith(RAMOLIBE_KEY_PREFIX)) {
						localStorage.setItem(key, JSON.stringify(data[key]));
					}
				}

				// 3. Recargar para reflejar los cambios
				window.location.reload();
			} catch (error) {
				console.error('Error al importar el JSON:', error);
				alert('Hubo un error al leer el archivo JSON. Verifica que sea un archivo válido.');
			} finally {
				isImporting = false;
				if (fileInput) fileInput.value = '';
			}
		};

		reader.readAsText(file);
	}

	function confirmDeleteLocal() {
		localStorage.clear();
		window.location.reload();
		showDeleteLocalModal = false;
	}

	async function confirmDeleteAccount() {
		await cloud.deleteCloudData();
		showDeleteAccountModal = false;
		window.location.reload();
	}
</script>

<div class="w-full space-y-6">
	<div class="bg-base-100 border border-base-400 rounded-2xl overflow-hidden shadow-sm">
		<div class="p-6 border-b border-base-400/50 bg-base-200/30">
			<h2 class="text-lg font-bold text-content flex items-center gap-2">Privacidad y datos</h2>
			<p class="text-xs text-content/50 mt-1">
				Gestiona tu información personal y copias de seguridad.
			</p>
		</div>

		<div class="divide-y divide-base-400/30">
			<div
				class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
			>
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Importar datos locales</div>
					<p class="text-xs text-content/50 max-w-sm leading-relaxed">
						Restaura un respaldo en JSON. Esto reemplazará tus datos locales actuales.
					</p>
				</div>
				<button
					onclick={() => fileInput.click()}
					disabled={isImporting}
					class="w-full flex gap-2 items-center justify-center sm:w-auto px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 transition-all cursor-pointer"
				>
					{#if isImporting}
						<div
							class="animate-spin h-3 w-3 border-2 border-content border-t-transparent rounded-full"
						></div>
						Importando...
					{:else}
						<Upload size={14} />
						Importar JSON
					{/if}
				</button>
				<input
					type="file"
					accept=".json"
					class="hidden"
					bind:this={fileInput}
					onchange={handleImportData}
				/>
			</div>

			<div
				class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
			>
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Exportar datos locales</div>
					<p class="text-xs text-content/50 max-w-sm leading-relaxed">
						Descarga un respaldo en JSON con tus semestres, ramos y calificaciones.
					</p>
				</div>
				<button
					onclick={handleExportData}
					disabled={isExporting}
					class="w-full flex gap-2 items-center justify-center sm:w-auto px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 transition-all cursor-pointer"
				>
					{#if isExporting}
						<div
							class="animate-spin h-3 w-3 border-2 border-content border-t-transparent rounded-full"
						></div>
						Exportando...
					{:else}
						<Download size={14} />
						Exportar JSON
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="bg-base-100 border border-base-400 rounded-2xl overflow-hidden shadow-sm">
		<div class="p-6 border-b border-base-400/50 bg-base-200/30">
			<h2
				class="text-sm font-bold text-error-100 uppercase tracking-widest flex items-center gap-2"
			>
				<AlertTriangle size={18} />
				Zona de Peligro
			</h2>
			<p class="text-xs text-content/50 mt-1">
				Acciones destructivas e irreversibles sobre tu cuenta y tus datos.
			</p>
		</div>

		<div class="divide-y divide-base-400/30">
			<div
				class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
			>
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Limpiar navegador</div>
					<p class="text-xs text-content/50 max-w-sm leading-relaxed">
						Elimina todos los datos guardados localmente en este dispositivo.
					</p>
				</div>
				<button
					onclick={() => (showDeleteLocalModal = true)}
					class="w-full flex gap-2 items-center justify-center sm:w-auto px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 transition-all cursor-pointer"
				>
					<Trash size={16} />
					Limpiar datos
				</button>
			</div>

			<div
				class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
			>
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Eliminar cuenta de la nube</div>
					<p class="text-xs text-content/50 max-w-sm leading-relaxed">
						Borra permanentemente tu cuenta y todos los respaldos online.
					</p>
				</div>
				<button
					onclick={() => (showDeleteAccountModal = true)}
					class="w-full flex gap-2 items-center justify-center sm:w-auto px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
				>
					<UserX size={16} />
					Eliminar cuenta
				</button>
			</div>
		</div>
	</div>
</div>

{#if showDeleteLocalModal}
	<div class="fixed inset-0 z-100 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			aria-label="Cerrar modal de limpieza de datos"
			onclick={() => (showDeleteLocalModal = false)}
		>
		</button>
		<div
			class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6"
			in:fade={{ duration: 200 }}
		>
			<h3 class="text-lg font-bold text-content mb-2">¿Limpiar datos locales?</h3>
			<p class="text-sm text-content/70 mb-6 leading-relaxed">
				Todos los semestres guardados en este navegador serán eliminados. Si no has sincronizado con
				la nube, perderás esta información.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (showDeleteLocalModal = false)}
					class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 cursor-pointer"
					>Cancelar</button
				>
				<button
					onclick={confirmDeleteLocal}
					class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 cursor-pointer"
					>Limpiar</button
				>
			</div>
		</div>
	</div>
{/if}

{#if showDeleteAccountModal}
	<div class="fixed inset-0 z-100 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			aria-label="Cerrar modal de eliminación de cuenta"
			onclick={() => (showDeleteAccountModal = false)}
		>
		</button>
		<div
			class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6"
			in:fade={{ duration: 200 }}
		>
			<h3 class="text-lg font-bold mb-2 text-error-100">¿Confirmar eliminación de cuenta?</h3>
			<p class="text-sm text-content/70 mb-6 leading-relaxed">
				Estás a punto de borrar tu cuenta y <strong class="text-content"
					>todos los datos sincronizados</strong
				>. Esta acción no se puede deshacer.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (showDeleteAccountModal = false)}
					class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 cursor-pointer"
					>Cancelar</button
				>
				<button
					onclick={confirmDeleteAccount}
					class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 cursor-pointer"
					>Eliminar Cuenta</button
				>
			</div>
		</div>
	</div>
{/if}
