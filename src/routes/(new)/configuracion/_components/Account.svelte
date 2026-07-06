<script lang="ts">
	import { account } from '$lib/infra/account.svelte';
	import { syncRouter } from '$lib/infra/sync-router.svelte';
	import Icon from '@iconify/svelte';
	import {
		Cloud,
		CloudOff,
		LogOut,
		CircleCheck,
		CircleAlert,
		CircleUser,
		WifiOff,
		RefreshCw,
		type LucideProps
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	// --- DERIVADOS (Estado Global) ---
	let user = $derived(account.user);
	let isLoading = $derived(account.isLoading);
	let userName = $derived(
		user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuario'
	);
	let userMail = $derived(user?.email ?? '');
	let currentProvider = $derived((user?.app_metadata?.provider as string) ?? 'github');

	// --- ESTADO LOCAL ---
	let lastSync = $derived(syncRouter.lastSyncAt);
	let syncStatus = $derived(syncRouter.status);
	const statusConfig: Record<
		string,
		{ label: string; class: string; icon: Component<LucideProps> }
	> = {
		offline: {
			label: 'Sin conexión',
			class: 'bg-warning-200 border-warning-400',
			icon: WifiOff
		},
		disconnected: {
			label: 'No sincronizado',
			class: 'bg-base-200 border-base-400',
			icon: CircleAlert
		},
		connecting: {
			label: 'Conectando...',
			class: 'bg-warning-200 border-warning-400',
			icon: RefreshCw
		},
		syncing: {
			label: 'Sincronizando...',
			class: 'bg-warning-200 border-warning-400',
			icon: RefreshCw
		},
		idle: {
			label: 'Sincronizado',
			class: 'bg-success-200 border-success-400',
			icon: CircleCheck
		},
		error: {
			label: 'Error',
			class: 'bg-error-200 border-error-300',
			icon: CircleAlert
		}
	};

	let currentStatus = $derived(statusConfig[syncStatus] ?? statusConfig.disconnected);

	// --- ACCIONES ---
	async function handleLogout() {
		await account.logout();
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
				class="relative bg-linear-to-r p-6 sm:p-8 transition-all group/hero border-b border-base-400 overflow-hidden text-content/70 {currentStatus.class}"
			>
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2 opacity-80">
						{#if currentStatus.icon === WifiOff}
							<WifiOff size={20} />
						{:else if currentStatus.icon === CircleCheck}
							<CircleCheck size={20} />
						{:else if currentStatus.icon === CircleAlert}
							<CircleAlert size={20} />
						{:else}
							<RefreshCw
								size={20}
								class={syncStatus === 'syncing' || syncStatus === 'connecting'
									? 'animate-spin'
									: ''}
							/>
						{/if}
						<span class="text-xs font-bold uppercase tracking-widest">{currentStatus.label}</span>
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
						class="w-14 h-14 bg-base-300 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
					>
						{#if user.user_metadata?.avatar_url}
							<img
								src={user.user_metadata?.avatar_url || '/default-avatar.png'}
								alt="Avatar"
								class="w-13 h-13 rounded-full object-cover"
							/>
						{:else}
							<CircleUser class="w-13 h-13 text-content" />
						{/if}
					</div>
					<div>
						<div class="text-2xl sm:text-3xl font-bold text-content leading-tight">{userName}</div>
						<div class="text-sm font-medium text-content/90 mt-0.5">{userMail}</div>
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
							Última sincronización: {lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}
						</div>
					</div>
				</div>

				<div class="flex-1 bg-base-100/50"></div>

				<div class="p-6 bg-base-100 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="flex items-center gap-2 text-xs text-content/40 w-full sm:w-auto">
						<CircleAlert size={14} class="shrink-0" />
						<span>Tus datos locales no se borrarán al salir.</span>
					</div>
					<button
						onclick={handleLogout}
						class="w-full sm:w-auto inline-flex items-center justify-center bg-base-200 gap-2 px-4 py-2 hover:bg-error-100 text-content rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm hover:text-white"
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
						onclick={() => account.loginWith('github')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-base-200 border border-base-400 text-content rounded-lg text-sm font-semibold hover:bg-base-300 transition-all shadow-sm"
					>
						<Icon icon="mdi:github" width={20} /> Continuar con GitHub
					</button>

					<button
						onclick={() => account.loginWith('google')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-base-200 border border-base-400 text-content rounded-lg text-sm font-semibold hover:bg-base-300 transition-all shadow-sm"
					>
						<Icon icon="mdi:google" width={20} />
						Continuar con Google
					</button>

					<button
						onclick={() => account.loginWith('discord')}
						class="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] text-white rounded-lg text-sm font-semibold hover:bg-[#4752c4] transition-all shadow-sm border border-[#4752c4]/50"
					>
						<Icon icon="ic:baseline-discord" width={20} />
						Continuar con Discord
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
