<script lang="ts">
	import { Rocket, BookOpen, Calendar, Target, Zap } from '@lucide/svelte';

	// Migración a Svelte 5 (Runes)
	let {
		semesterName = $bindable(''),
		onStart
	}: {
		semesterName: string;
		onStart: () => void;
	} = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			start();
		}
	}

	function start() {
		if (semesterName.trim() !== '') {
			onStart();
		}
		semesterName = '';
	}
</script>

<div
	class="bg-base-100 border border-base-400 rounded-xl p-8 flex flex-col justify-center shadow-sm"
>
	<div class="mb-6 flex justify-between items-center">
		<div>
			<div class="flex gap-2 items-center">
				<img src="/favicon.webp" alt="Ramo Libre Logo" class="w-15 h-15" />
				<h1 class="text-4xl font-bold tracking-tight mb-2 text-content">Ramo Libre</h1>
			</div>
			<p class="text-content/80 text-lg">Tu nueva herramienta favorita para no reprobar.</p>
		</div>
		<div>
			<div class="text-right max-sm:hidden">
				<p class="text-sm text-content/60 font-medium flex items-center justify-end">
					Tutorial Rápido
					<Zap class="inline-block w-4 h-4 ml-1" />
				</p>
				<p class="text-xs text-content/50">Sigue estos pasos para comenzar</p>
			</div>
		</div>
	</div>

	<div class="mb-6">
		<h2 class="text-lg font-semibold text-content/90 mb-4">¿Cómo empezar?</h2>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
			<div class="flex items-center gap-2 text-content/80">
				<Calendar class="w-4 h-4 text-calendar-100" />
				<span>1. Ingresa el nombre del semestre</span>
			</div>
			<div class="flex items-center gap-2 text-content/80">
				<BookOpen class="w-4 h-4 text-classes-100" />
				<span>2. Configura tus ramos y notas</span>
			</div>
			<div class="flex items-center gap-2 text-content/80">
				<Target class="w-4 h-4 text-grades-100" />
				<span>3. Establece tus metas académicas</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col sm:flex-row gap-3">
		<input
			bind:value={semesterName}
			onkeydown={handleKeydown}
			placeholder="Nombre del Semestre (Ej: 2025-1)"
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
