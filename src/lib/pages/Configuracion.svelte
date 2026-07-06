<script>
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Semestres from './_components/configuracion/Semestres.svelte';
	import Aparicencia from './_components/configuracion/Apariencia.svelte';
	import About from './_components/configuracion/About.svelte';
	import Resumen from './_components/shared/Resumen.svelte';

	let highlightedComponent = $state('');

	onMount(() => {
		const hash = page.url.hash.slice(1);
		if (hash) {
			highlightedComponent = hash;
			setTimeout(() => {
				highlightedComponent = '';
			}, 1500);
		}
	});
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="w-full">
	<div class="columns-1 lg:columns-2 gap-6 space-y-6">
		<div
			id="semestres"
			class="break-inside-avoid transition-all duration-500 {highlightedComponent === 'semesters'
				? 'shine-effect'
				: ''}"
		>
			<Semestres />
		</div>

		<div
			id="apariencia"
			class="break-inside-avoid transition-all duration-500 {highlightedComponent === 'theme'
				? 'shine-effect'
				: ''}"
		>
			<Aparicencia />
		</div>

		<div
			id="tutorials"
			class="break-inside-avoid transition-all duration-500 {highlightedComponent === 'tutorials'
				? 'shine-effect'
				: ''}"
		>
			<Resumen />
		</div>

		<div
			id="about"
			class="break-inside-avoid transition-all duration-500 {highlightedComponent === 'about'
				? 'shine-effect'
				: ''}"
		>
			<About />
		</div>
	</div>
</div>
