<script lang="ts">
	import '@ramo-libre/ui-themes/tailwind.css';
	import './custom.css';
	import { onMount } from 'svelte';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import { PUBLIC_TAURI_BUILD } from '$env/static/public';

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
	let { children } = $props();

	onMount(async () => {
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
							r.update();
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

<div class="">
	{@render children()}
</div>
