<script lang="ts">
	import { account } from '$lib/infra/sync.svelte';
	import Icon from '@iconify/svelte';
	import { CircleUser, LogOut } from '@lucide/svelte';

	let user = $derived(account.user);
	let userName = $derived(
		user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Invitado'
	);
	let userMail = $derived(user?.email ?? 'Sin sesión activa');
	let currentProvider = $derived((user?.app_metadata?.provider as string) ?? 'github');

	const providerColors: Record<string, string> = {
		github: 'bg-base-200 text-content border border-base-400',
		google: 'bg-base-100 text-content border border-base-400',
		discord: 'bg-[#5865F2] text-white border border-[#4752c4]'
	};

	async function handleLogout() {
		await account.logout();
	}
</script>

<div
	class="bg-base-100 rounded-xl border border-base-400 shadow-sm overflow-hidden transition-all"
>
	{#if account.isLoading}
		<div class="flex items-center gap-4 animate-pulse p-6">
			<div class="w-12 h-12 rounded-full bg-base-200"></div>
			<div class="flex-1 space-y-2">
				<div class="h-4 bg-base-200 rounded w-1/4"></div>
				<div class="h-3 bg-base-200 rounded w-1/3"></div>
			</div>
		</div>
	{:else if user}
		<div
			class="flex flex-row items-center gap-3 p-5 bg-linear-to-br from-base-100 to-base-100/90"
		>
			<div class="flex items-center gap-3 flex-1 min-w-0">
				<div
					class="w-12 h-12 bg-base-300 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0"
				>
					{#if user.user_metadata?.avatar_url}
						<img
							src={user.user_metadata?.avatar_url || '/default-avatar.png'}
							alt="Avatar"
							class="w-11 h-11 rounded-full object-cover"
						/>
					{:else}
						<CircleUser class="w-11 h-11 text-content" />
					{/if}
				</div>
				<div class="min-w-0">
					<div class="font-semibold text-content text-sm truncate">{userName}</div>
					<div class="text-xs text-content/50 truncate">{userMail}</div>
					<span
						class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium {providerColors[
							currentProvider
						] || providerColors.github} gap-1 capitalize shadow-sm mt-1"
					>
					{#if currentProvider === 'github'}<Icon icon="mdi:github" width={10} />
					{:else if currentProvider === 'google'}<Icon icon="mdi:google" width={10} />
					{:else if currentProvider === 'discord'}<Icon icon="ic:baseline-discord" width={10} />
					{/if}
						<span>{currentProvider}</span>
					</span>
				</div>
			</div>

			<button
				onclick={handleLogout}
				class="shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 max-sm:px-2 max-sm:w-10 max-sm:h-10 bg-base-200 hover:bg-error-100 text-content rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm hover:text-white"
				title="Cerrar sesión"
			>
				<LogOut size={16} />
				<span class="hidden sm:inline">Cerrar sesión</span>
			</button>
		</div>
	{:else}
		<div class="p-5">
			<div class="flex flex-col lg:flex-row lg:items-center gap-4">
				<div class="flex items-center gap-3">
					<CircleUser class="w-8 h-8 lg:w-12 lg:h-12 text-content/20 shrink-0" />
					<div>
						<h3 class="font-semibold text-content text-sm">Cuenta no conectada</h3>
						<p class="text-xs text-content/50">Inicia sesión para respaldar tus datos.</p>
					</div>
				</div>

				<div class="flex max-lg:mx-auto flex-row flex-wrap gap-2 lg:ml-auto">
					<button
						onclick={() => account.loginWith('github')}
						class="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-base-200 border border-base-400 text-content rounded-lg text-xs font-semibold hover:bg-base-300 transition-all active:scale-95 shadow-sm"
					>
						<Icon icon="mdi:github" width={16} /> GitHub
					</button>
					<button
						onclick={() => account.loginWith('google')}
						class="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-base-200 border border-base-400 text-content rounded-lg text-xs font-semibold hover:bg-base-300 transition-all active:scale-95 shadow-sm"
					>
						<Icon icon="mdi:google" width={16} /> Google
					</button>
					<button
						onclick={() => account.loginWith('discord')}
						class="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5865F2] text-white rounded-lg text-xs font-semibold hover:bg-[#4752c4] transition-all active:scale-95 shadow-sm"
					>
						<Icon icon="mdi:discord" width={16} /> Discord
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
