<script lang="ts">
	import { Download, AlertTriangle, UserX, Trash } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	// --- ESTADOS ---
	let showDeleteLocalModal = $state(false);
	let showDeleteAccountModal = $state(false);
	let isExporting = $state(false);

	// --- ACCIONES ---
	function handleExportData() {
		isExporting = true;
		setTimeout(() => {
			isExporting = false;
			// Aquí iría tu lógica de descarga
		}, 1000);
	}

	function confirmDeleteLocal() {
		// db.nukeLocal();
		showDeleteLocalModal = false;
	}

	function confirmDeleteAccount() {
		// auth.deleteAccount();
		showDeleteAccountModal = false;
	}
</script>

<div class="w-full space-y-6">
    <div class="bg-base-100 border border-base-400 rounded-2xl overflow-hidden shadow-sm">
		<div class="p-6 border-b border-base-400/50 bg-base-200/30">
			<h2 class="text-lg font-bold text-content flex items-center gap-2">
				Privacidad y datos
			</h2>
			<p class="text-xs text-content/50 mt-1">Gestiona tu información personal y copias de seguridad.</p>
		</div>

		<div class="divide-y divide-base-400/30">
			<div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
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
						<div class="animate-spin h-3 w-3 border-2 border-content border-t-transparent rounded-full"></div>
						Exportando...
					{:else}
						<Download size={14} />
						Exportar JSON
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="bg-base-100 border border-base-400 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
		<div class="flex items-center gap-2 text-error-100 mb-2">
			<AlertTriangle size={18} />
			<h2 class="text-sm font-bold uppercase tracking-widest">Zona de Peligro</h2>
		</div>

		<div class="divide-y divide-base-300">
			<div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0">
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Limpiar navegador</div>
					<p class="text-xs text-content/50 max-w-sm">
						Elimina todos los datos guardados en este dispositivo.
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

			<div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 last:pb-0">
				<div class="space-y-1">
					<div class="text-sm font-bold text-content">Eliminar cuenta de la nube</div>
					<p class="text-xs text-content/50 max-w-sm">
						Borra permanentemente tu cuenta y todos los respaldos online.
					</p>
				</div>
				<button
					onclick={() => (showDeleteAccountModal = true)}
					class="w-full sm:w-auto px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
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
			onclick={() => (showDeleteLocalModal = false)}>
		</button>
		<div class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6" in:fade={{duration: 200}}>
			<h3 class="text-lg font-bold text-content mb-2">¿Limpiar datos locales?</h3>
			<p class="text-sm text-content/70 mb-6 leading-relaxed">
				Todos los semestres guardados en este navegador serán eliminados. Si no has sincronizado con la nube, perderás esta información.
			</p>
			<div class="flex justify-end gap-3">
				<button onclick={() => (showDeleteLocalModal = false)} class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 cursor-pointer">Cancelar</button>
				<button onclick={confirmDeleteLocal} class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 cursor-pointer">Limpiar</button>
			</div>
		</div>
	</div>
{/if}

{#if showDeleteAccountModal}
	<div class="fixed inset-0 z-100 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			onclick={() => (showDeleteAccountModal = false)}>
		</button>
		<div class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6" in:fade={{duration: 200}}>
			<h3 class="text-lg font-bold text-content mb-2 text-error-100">¿Confirmar eliminación de cuenta?</h3>
			<p class="text-sm text-content/70 mb-6 leading-relaxed">
				Estás a punto de borrar tu cuenta y <strong class="text-content">todos los datos sincronizados</strong>. Esta acción no se puede deshacer.
			</p>
			<div class="flex justify-end gap-3">
				<button onclick={() => (showDeleteAccountModal = false)} class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200 cursor-pointer">Cancelar</button>
				<button onclick={confirmDeleteAccount} class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90 cursor-pointer">Eliminar Cuenta</button>
			</div>
		</div>
	</div>
{/if}
