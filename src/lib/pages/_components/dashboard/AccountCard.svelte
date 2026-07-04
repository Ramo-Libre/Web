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
			class="flex flex-col lg:flex-row lg:items-center gap-4 p-5 bg-linear-to-br from-base-200 to-base-200/90"
		>
			<div class="flex items-center gap-4 flex-1 min-w-0">
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
						{:else if currentProvider === 'google'}<svg class="w-2.5 h-2.5" viewBox="0 0 512 512"
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
						{:else if currentProvider === 'discord'}<svg
								class="w-2.5 h-2.5 fill-current"
								viewBox="0.02 57.8 511.92 396.3"
								><path
									d="M433.7 91a416.5 416.5 0 0 0-105.6-33.2c-4.6 8.2-9.9 19.3-13.5 28.1-39.4-5.9-78.4-5.9-117.1 0-3.7-8.8-9.1-19.9-13.7-28.1-37.1 6.4-72.6 17.7-105.7 33.3-66.8 101-85 199.5-75.9 296.6 44.3 33.1 87.3 53.2 129.6 66.4 10.4-14.4 19.7-29.6 27.7-45.7-15.3-5.8-29.9-13-43.7-21.3 3.7-2.7 7.2-5.6 10.7-8.5 84.2 39.4 175.8 39.4 259 0 3.5 2.9 7.1 5.8 10.7 8.5-13.9 8.3-28.5 15.5-43.8 21.3 8 16 17.3 31.3 27.7 45.7 42.3-13.2 85.3-33.3 129.6-66.4 10.8-112.5-18-210.1-76-296.7M170.9 328c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c.1 28.8-20.2 52.4-46 52.4m170.2 0c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c0 28.8-20.3 52.4-46 52.4"
								/></svg
							>
						{/if}
						<span>{currentProvider}</span>
					</span>
				</div>
			</div>

			<button
				onclick={handleLogout}
				class="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 hover:bg-error-100 text-content rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm hover:text-white"
			>
				<LogOut size={16} />
				Cerrar sesión
			</button>
		</div>
	{:else}
		<div
			class="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-6"
		>
			<div class="flex items-center gap-4 flex-1 min-w-0">
				<CircleUser class="w-12 h-12 text-content/20 shrink-0" />
				<div>
					<h3 class="font-semibold text-content text-sm">Cuenta no conectada</h3>
					<p class="text-xs text-content/50 mt-1">Inicia sesión para respaldar tus datos.</p>
				</div>
			</div>

			<div class="flex flex-col sm:flex-row gap-2 lg:w-auto">
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
					<svg class="w-4 h-4" viewBox="0 0 512 512"
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
					Google
				</button>
				<button
					onclick={() => account.loginWith('discord')}
					class="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5865F2] text-white rounded-lg text-xs font-semibold hover:bg-[#4752c4] transition-all active:scale-95 shadow-sm"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0.02 57.8 511.92 396.3"
						><path
							d="M433.7 91a416.5 416.5 0 0 0-105.6-33.2c-4.6 8.2-9.9 19.3-13.5 28.1-39.4-5.9-78.4-5.9-117.1 0-3.7-8.8-9.1-19.9-13.7-28.1-37.1 6.4-72.6 17.7-105.7 33.3-66.8 101-85 199.5-75.9 296.6 44.3 33.1 87.3 53.2 129.6 66.4 10.4-14.4 19.7-29.6 27.7-45.7-15.3-5.8-29.9-13-43.7-21.3 3.7-2.7 7.2-5.6 10.7-8.5 84.2 39.4 175.8 39.4 259 0 3.5 2.9 7.1 5.8 10.7 8.5-13.9 8.3-28.5 15.5-43.8 21.3 8 16 17.3 31.3 27.7 45.7 42.3-13.2 85.3-33.3 129.6-66.4 10.8-112.5-18-210.1-76-296.7M170.9 328c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c.1 28.8-20.2 52.4-46 52.4m170.2 0c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c0 28.8-20.3 52.4-46 52.4"
						/></svg
					>
					Discord
				</button>
			</div>
		</div>
	{/if}
</div>
