<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { semestre } from '$lib/infra/semestres.svelte';

	onMount(() => {
		semestre.preferences.applyTheme();
	});
</script>

<div
	in:fly={{ y: 10, duration: 300, delay: 100 }}
	class="flex flex-col h-dvh w-full min-w-0 text-content"
>
	<div class="flex flex-col items-center justify-center h-full w-full gap-4">
		<h1 class="text-2xl sm:text-4xl font-bold">Pagina no encontrada</h1>
		<p class="text-lg text-gray-600">La pagina que buscas no existe.</p>
		<a href="/" class="text-blue-500 hover:underline">Volver al inicio</a>
	</div>
</div>
