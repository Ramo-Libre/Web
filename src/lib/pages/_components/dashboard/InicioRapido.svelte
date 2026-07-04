<script lang="ts">
	import { Rocket } from '@lucide/svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { goto } from '$app/navigation';
	import { getNow } from '$lib/utils/date';

	let semesterName = $state('');

	const now = getNow();
	const year = now.getFullYear();
	const sem = now.getMonth() < 6 ? 1 : 2;
	const recomendado = `${year}-${sem}`;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') start();
	}

	function start() {
		const name = semesterName.trim() || recomendado;
		semestre.add(name);
		goto('/ramos#semesters');
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
	<div class="flex items-center gap-2 shrink-0">
		<Rocket class="w-5 h-5 text-primary-100 shrink-0" />
		<span class="text-sm lg:text-base font-bold text-content whitespace-nowrap">Inicio Rápido</span>
	</div>
	<input
		bind:value={semesterName}
		onkeydown={handleKeydown}
		placeholder={recomendado}
		class="w-full sm:flex-1 h-11 px-4 text-sm bg-base-100 text-content placeholder-content/40 border border-base-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
	/>
	<button
		onclick={start}
		class="w-full sm:w-auto h-11 cursor-pointer px-6 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shrink-0"
	>
		Empezar
	</button>
</div>
