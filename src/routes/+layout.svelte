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
			const [{ onOpenUrl, getCurrent }, { listen }] = await Promise.all([
				import('@tauri-apps/plugin-deep-link'),
				import('@tauri-apps/api/event')
			]);

			let processingCode: string | null = null;

			async function handleAuthCallback(url: string) {
				const code = new URL(url).searchParams.get('code');
				if (!code || code === processingCode) return;
				processingCode = code;
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				processingCode = null;
				if (error) console.error('[deep-link] exchangeCodeForSession error:', error);
			}

			const startUrls = await getCurrent();
			if (startUrls) handleAuthCallback(startUrls[0]).catch(console.error);

			await onOpenUrl((urls) => {
				handleAuthCallback(urls[0]).catch(console.error);
			});
			await listen<string>('deep-link-received', (event) => {
				handleAuthCallback(event.payload).catch(console.error);
			});
		}

		if (!isTauri) {
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
