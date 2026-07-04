<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';

	const prefix = $derived(page.url.pathname.startsWith('/old') ? '/old' : '');
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col h-full w-full min-w-0">
	<div class="flex flex-col items-center justify-center h-full w-full gap-4">
		<h1 class="text-4xl font-bold">Pagina no encontrada</h1>
		<p class="text-lg text-gray-600">La pagina que buscas no existe.</p>
		<a href={prefix + '/'} class="text-blue-500 hover:underline">Volver al inicio</a>
	</div>
</div>
