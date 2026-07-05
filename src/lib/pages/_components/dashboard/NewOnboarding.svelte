<script lang="ts">
	import { Rocket } from '@lucide/svelte';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
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
		goto('/ramos#semesters');
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-8 shadow-sm">
	<div class="mb-8 flex items-center gap-3">
		<img src={SuiteFavicons.web} alt="Ramo Libre Logo" class="w-15 h-15" />
		<h1 class="text-lg lg:text-xl font-bold tracking-tight text-content">Ramo Libre</h1>
	</div>

	<div class="flex flex-col sm:flex-row gap-3">
		<input
			bind:value={semesterName}
			onkeydown={handleKeydown}
			{placeholder}
			class="flex-1 h-12 px-4 max-sm:py-2 text-lg bg-base-100 text-content placeholder-content/40 border border-base-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
		/>
		<button
			onclick={start}
			class="h-12 cursor-pointer px-8 text-lg bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
		>
			Empezar <Rocket class="inline-block w-5 h-5 ml-2" />
		</button>
	</div>
</div>
