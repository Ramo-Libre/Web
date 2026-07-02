<script lang="ts">
	import { Rocket } from '@lucide/svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { goto } from '$app/navigation';
	import { getNow } from '$lib/utils/date';

	let semesterName = $state('');

	const now = getNow();
	const year = now.getFullYear();
	const sem = now.getMonth() < 6 ? 1 : 2;
	const placeholder = `Nombre del Semestre (Ej: ${year}-${sem})`;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') start();
	}

	function start() {
		if (!semesterName.trim()) return;
		semestre.add(semesterName.trim());
		goto('/new/ramos#semesters');
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-6 shadow-sm">
	<h2 class="text-sm lg:text-base font-bold text-content mb-4">Inicio Rápido</h2>
	<div class="flex flex-col sm:flex-row gap-3">
		<input
			bind:value={semesterName}
			onkeydown={handleKeydown}
			placeholder={placeholder}
			class="flex-1 h-12 px-4 max-sm:py-2 text-base bg-base-100 text-content placeholder-content/40 border border-base-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
		/>
		<button
			onclick={start}
			class="h-12 cursor-pointer px-8 text-base bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shrink-0"
		>
			Empezar <Rocket class="inline-block w-5 h-5 ml-2" />
		</button>
	</div>
</div>
