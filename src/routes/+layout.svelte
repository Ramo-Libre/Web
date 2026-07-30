<script lang="ts">
	import '@ramo-libre/ui-themes/tailwind.css';
	import './custom.css';
	import { onMount } from 'svelte';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import { PUBLIC_TAURI_BUILD } from '$env/static/public';
	import { initApp } from '$lib/infra/semestres.svelte';
	import { supabase } from '$lib/supabase/client';

	const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in window;

	type PWAInfo =
		| {
				webManifest: {
					href: string;
					linkTag: string;
				};
		  }
		| undefined;

	let pwaInfo = $state<PWAInfo>(undefined);
	let ready = $state(false);
	let { children } = $props();

	onMount(async () => {
		await initApp();
		ready = true;

		if (isTauri) {
			const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
			await onOpenUrl(async (urls) => {
				await supabase.auth.exchangeCodeForSession(urls[0]).then(({ error }) => {
					if (error) console.error('Error completando sesión OAuth:', error);
				});
			});
		} else {
			const { pwaInfo: info } = await import('virtual:pwa-info');
			pwaInfo = info;

			if (pwaInfo) {
				const { registerSW } = await import('virtual:pwa-register');
				registerSW({
					immediate: true,
					onRegistered(r: ServiceWorkerRegistration | undefined) {
						if (!r) return;

						const interval = setInterval(() => {
							console.log('Checking for SW update...');
							void r.update();
						}, 3600000);

						console.log(`SW Registered`);

						return () => clearInterval(interval);
					},
					onRegisterError(error: Error) {
						console.error('SW registration error', error);
					}
				});
			}
		}
	});

	let webManifest = $derived(!isTauri && pwaInfo ? pwaInfo.webManifest.linkTag : '');

	$effect(() => {
		const root = document.documentElement;
		requestAnimationFrame(() => {
			const bgColor = getComputedStyle(root).getPropertyValue('--color-base-100');
			const meta = document.querySelector('meta[name="theme-color"]');
			if (meta) meta.setAttribute('content', bgColor);
		});
	});
</script>

<svelte:head>
	{@html webManifest}
	<title>Ramo Libre</title>
	<meta name="theme-color" content="#ffffff" id="theme-meta" />
	<link rel="icon" href={SuiteFavicons.web} />
</svelte:head>

{#if ready}
	<div class="">
		{@render children()}
	</div>
{:else}
	<div class="flex items-center justify-center h-screen">
		<div class="animate-pulse text-content/40 text-sm">Cargando...</div>
	</div>
{/if}
