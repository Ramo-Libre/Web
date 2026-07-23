<script lang="ts">
	import { account } from '$lib/infra/account.svelte';
	import { clearAllPersistence } from '$lib/infra/persistence.svelte';
	import { Trash, TriangleAlert, UserX } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	let showDeleteLocalModal = $state(false);
	let showDeleteAccountModal = $state(false);
	let isLogedIn = $derived(account.isAuthenticated);

	async function confirmDeleteLocal() {
		await clearAllPersistence();
		window.location.reload();
		showDeleteLocalModal = false;
	}

	async function confirmDeleteAccount() {
		await account.deleteCloudData();
		showDeleteAccountModal = false;
		window.location.reload();
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-2xl overflow-hidden shadow-sm">
	<div class="p-6 border-b border-base-400/50 bg-base-200/30">
		<h2 class="text-sm font-bold text-error-100 uppercase tracking-widest flex items-center gap-2">
			<TriangleAlert size={18} />
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
				disabled={!isLogedIn}
				class="w-full flex gap-2 items-center justify-center sm:w-auto px-4 py-2 rounded-lg bg-error-100 disabled:pointer-events-none disabled:bg-base-200 disabled:text-content/30 text-base-100 font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
			>
				<UserX size={16} />
				Eliminar cuenta
			</button>
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
