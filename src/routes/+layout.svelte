<script lang="ts">
	import './layout.css';
	import './custom.css';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r: ServiceWorkerRegistration | undefined) {
					// uncomment following code if you want check for updates
					r && setInterval(() => {
					   console.log('Checking for sw update')
					   r.update()
					}, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error: Error) {
					console.log('SW registration error', error);
				}
			});
		}
	});

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
	let { children } = $props();

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
</svelte:head>

<div class="h-[calc(100dvh-4rem)] max-sm:h-dvh w-full flex flex-col max-sm:flex-col-reverse max-sm:p-4">
	{@render children()}
</div>
