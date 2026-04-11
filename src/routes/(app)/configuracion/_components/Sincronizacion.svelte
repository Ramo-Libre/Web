<script lang="ts">
	import { cloud } from '$lib/state/cloud.svelte';
	import {
		Cloud,
		CloudOff,
		LogOut,
		RefreshCw,
		CheckCircle2,
		GithubIcon,
		AlertCircle
	} from '@lucide/svelte';

	// --- DERIVADOS (Estado Global) ---
	let user = $derived(cloud.user);
	let isLoading = $derived(cloud.isLoading);
	let userName = $derived(
		user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuario'
	);
	let userMail = $derived(user?.email ?? '');
	let currentProvider = $derived((user?.app_metadata?.provider as string) ?? 'github');

	// --- ESTADO LOCAL ---
	let isSyncing = $state(false);
	let lastSync = $derived(cloud.lastSync);
	let isAutoSyncEnabled = $derived(cloud.autoSync);

	// --- ACCIONES ---
	async function handleLogout() {
		await cloud.logout();
	}

	function handleSync() {
		isSyncing = true;
		cloud.sync().finally(() => {
            isSyncing = false;
        });
	}

	function toggleAutoSync() {
	    cloud.autoSync = !isAutoSyncEnabled;
	}
</script>

<div class="w-full mx-auto">
	<div
		class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-all"
	>
		{#if isLoading}
			<div class="flex-1 flex flex-col gap-4 animate-pulse p-6">
				<div class="h-24 bg-base-200 rounded-lg w-full"></div>
				<div class="h-16 bg-base-200 rounded-lg w-full mt-4"></div>
			</div>
		{:else if user}
			<div
				class="relative bg-linear-to-r from-grades-100 to-grades-100/90 p-6 sm:p-8 text-content transition-all group/hero border-b border-base-400 overflow-hidden"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2 opacity-80">
						<CheckCircle2 size={16} class="text-base-100" />
						<span class="text-xs font-bold uppercase tracking-widest text-base-100"
							>Cuenta Sincronizada</span
						>
					</div>

					<div
						class="px-3 py-1 hidden bg-base-100/50 backdrop-blur-sm border border-base-400 rounded-full text-xs font-semibold capitalize sm:flex items-center gap-2 shadow-sm z-20"
					>
						Conectado vía {currentProvider}
					</div>
					<div
						class="px-3 py-1 sm:hidden bg-base-100/50 backdrop-blur-sm border border-base-400 rounded-full text-xs font-semibold capitalize flex items-center gap-2 shadow-sm z-20"
					>
						{currentProvider}
					</div>
				</div>

				<div class="flex items-center gap-4 relative z-10">
					<div
						class="w-14 h-14 bg-primary-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md border-2 border-base-100"
					>
						{userName.charAt(0).toUpperCase()}
					</div>
					<div>
						<div class="text-2xl sm:text-3xl font-bold text-content leading-tight">{userName}</div>
						<div class="text-sm font-medium text-content/60 mt-0.5">{userMail}</div>
					</div>
				</div>

				<Cloud
					class="absolute -right-5 -bottom-5 text-base-400/30 pointer-events-none"
					size={160}
				/>
			</div>

			<div class="bg-base-100 flex flex-col flex-1 divide-y divide-base-300">
				<div
					class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4"
				>
					<div>
						<div class="font-semibold text-content text-sm">Estado de los datos</div>
						<div class="text-xs text-content/50 mt-1">
							Última sincronización: Hoy a las {lastSync}
						</div>
					</div>
					<button
						onclick={handleSync}
						disabled={isSyncing}
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-base-200 border border-base-400 text-content text-sm font-semibold rounded-lg hover:bg-base-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
					>
						<RefreshCw size={16} class={isSyncing ? 'animate-spin text-primary-400' : ''} />
						{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
					</button>
				</div>

				<div class="flex flex-row items-center justify-between p-6 gap-4">
					<div>
						<div class="font-semibold text-content text-sm">Sincronización automática</div>
						<div class="text-xs text-content/50 mt-1">
							Respalda tus cambios en la nube al instante.
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={isAutoSyncEnabled}
						onclick={toggleAutoSync}
						class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {isAutoSyncEnabled
							? 'bg-grades-100'
							: 'bg-grades-400'}"
					>
						<span class="sr-only">Activar sincronización automática</span>
						<span
							aria-hidden="true"
							class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-base-100 shadow-sm ring-0 transition duration-200 ease-in-out {isAutoSyncEnabled
								? 'translate-x-5'
								: 'translate-x-0'}"
						></span>
					</button>
				</div>

				<div class="flex-1 bg-base-100/50"></div>

				<div class="p-6 bg-base-100 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="flex items-center gap-2 text-xs text-content/40 w-full sm:w-auto">
						<AlertCircle size={14} class="shrink-0" />
						<span>Tus datos locales no se borrarán al salir.</span>
					</div>
					<button
						onclick={handleLogout}
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 hover:bg-error-100 text-content rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm hover:text-white"
					>
						<LogOut size={16} />
					</button>
				</div>
			</div>
		{:else}
			<div
				class="relative bg-linear-to-r from-base-200 to-base-300 p-6 sm:p-8 text-content transition-all border-b border-base-400 overflow-hidden"
			>
				<div class="flex items-center gap-2 mb-4 opacity-80">
					<CloudOff size={16} class="text-content/50" />
					<span class="text-xs font-bold uppercase tracking-widest text-content/50"
						>Cuenta no conectada</span
					>
				</div>

				<div class="text-3xl font-bold text-content relative z-10">Respaldo en la nube</div>
				<p class="text-sm text-content/70 mt-2 max-w-sm relative z-10">
					Inicia sesión para respaldar tu progreso y acceder a Ramo Libre desde cualquier lugar.
				</p>

				<CloudOff
					class="absolute -right-5 -bottom-5 text-base-400/30 pointer-events-none"
					size={160}
				/>
			</div>

			<div class="bg-base-100 flex-1 flex flex-col items-center justify-center p-8">
				<div class="flex flex-wrap gap-3 w-full">
					<button
						onclick={() => cloud.loginWith('github')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-base-200 border border-base-400 text-content rounded-lg text-sm font-semibold hover:bg-base-300 transition-all shadow-sm"
					>
						<GithubIcon size={18} /> Continuar con GitHub
					</button>

					<button
						onclick={() => cloud.loginWith('google')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-base-200 border border-base-400 text-content rounded-lg text-sm font-semibold hover:bg-base-300 transition-all shadow-sm"
					>
						<svg class="w-4.5 h-4.5" viewBox="0 0 512 512"
							><path
								d="M501.8 261.8c0-18.2-1.6-35.6-4.7-52.4H256v99.1h137.8c-6.1 31.9-24.2 58.9-51.4 77V450h83.1c48.3-44.6 76.3-110.2 76.3-188.2"
								fill="#4285f4"
							/><path
								d="M256 512c69.1 0 127.1-22.8 169.4-61.9l-83.1-64.5c-22.8 15.4-51.9 24.7-86.3 24.7-66.6 0-123.1-44.9-143.4-105.4H27.5V371C69.6 454.5 155.9 512 256 512"
								fill="#34a853"
							/><path
								d="M112.6 304.6c-5.1-15.4-8.1-31.7-8.1-48.6s3-33.3 8.1-48.6v-66.1H27.5C10 175.7 0 214.6 0 256s10 80.3 27.5 114.7L93.8 319c0 .1 18.8-14.4 18.8-14.4"
								fill="#fbbc05"
							/><path
								d="M256 101.9c37.7 0 71.2 13 98 38.2l73.3-73.3C382.8 25.4 325.1 0 256 0 155.9 0 69.6 57.5 27.5 141.3l85.2 66.1c20.2-60.5 76.7-105.5 143.3-105.5"
								fill="#ea4335"
							/></svg
						>
						Continuar con Google
					</button>

					<button
						onclick={() => cloud.loginWith('discord')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] text-white rounded-lg text-sm font-semibold hover:bg-[#4752c4] transition-all shadow-sm border border-[#4752c4]/50"
					>
						<svg class="w-5 h-5 fill-current" viewBox="0.02 57.8 511.92 396.3"
							><path
								d="M433.7 91a416.5 416.5 0 0 0-105.6-33.2c-4.6 8.2-9.9 19.3-13.5 28.1-39.4-5.9-78.4-5.9-117.1 0-3.7-8.8-9.1-19.9-13.7-28.1-37.1 6.4-72.6 17.7-105.7 33.3-66.8 101-85 199.5-75.9 296.6 44.3 33.1 87.3 53.2 129.6 66.4 10.4-14.4 19.7-29.6 27.7-45.7-15.3-5.8-29.9-13-43.7-21.3 3.7-2.7 7.2-5.6 10.7-8.5 84.2 39.4 175.8 39.4 259 0 3.5 2.9 7.1 5.8 10.7 8.5-13.9 8.3-28.5 15.5-43.8 21.3 8 16 17.3 31.3 27.7 45.7 42.3-13.2 85.3-33.3 129.6-66.4 10.8-112.5-18-210.1-76-296.7M170.9 328c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c.1 28.8-20.2 52.4-46 52.4m170.2 0c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c0 28.8-20.3 52.4-46 52.4"
							/></svg
						>
						Continuar con Discord
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
