<script lang="ts">
	import { PUBLIC_VERSION } from '$env/static/public';
	import { Github, Globe, Heart, Code2, GraduationCap } from '@lucide/svelte';
</script>

<div
	class="bg-base-100 border border-base-400 rounded-xl overflow-hidden shadow-sm flex flex-col h-full"
>
	<div
		class="p-8 flex flex-col items-center text-center border-b border-base-400/50 bg-base-200/20"
	>
		<div
			class="h-20 w-20 bg-white rounded-2xl shadow-lg shadow-primary-100/20 flex items-center justify-center mb-4 rotate-3 group hover:rotate-0 transition-transform duration-300"
		>
			<img src="/favicon.webp" alt="Ramo Libre Logo" class="w-12 h-12" />
		</div>
		<h1 class="text-2xl font-black text-content uppercase tracking-tight">Ramo Libre</h1>
		<p class="text-xs font-mono text-content/40 mt-1">{PUBLIC_VERSION} • Open Source</p>
	</div>

	<div class="p-6 space-y-8">
		<div class="space-y-3">
			<h3 class="text-sm font-bold text-content flex items-center gap-2">
				<Heart size={14} class="text-error-100" />
				El proyecto
			</h3>
			<p class="text-sm text-content/60 leading-relaxed">
				Ramo Libre es un gestor académico de <span class="text-content font-medium"
					>alto rendimiento</span
				>
				diseñado para estudiantes que buscan control total sobre su progreso. Construido con una arquitectura
				<span class="italic">local-first</span> para garantizar privacidad y velocidad.
			</p>
		</div>

		<div class="space-y-3">
			<h3
				class="text-[10px] font-black text-content/30 uppercase tracking-widest flex items-center gap-2"
			>
				<Code2 size={12} />
				Powered by
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each ['Svelte 5', 'SvelteKit', 'C++20', 'WebAssembly', 'Tailwind', 'Supabase'] as tech (tech)}
					<span
						class="px-2.5 py-1 bg-base-200 text-content/70 rounded-md text-[10px] font-bold border border-base-400/50"
					>
						{tech}
					</span>
				{/each}
			</div>
		</div>

		<div class="p-4 bg-base-200 rounded-xl border border-base-300 flex items-center gap-4">
			<div class="h-12 w-12 rounded-full overflow-hidden shrink-0">
				<div
					class="h-full w-full bg-primary-100 text-base-100 flex items-center justify-center text-sm font-bold uppercase"
				>
					MP
				</div>
			</div>

			<div class="flex-1 min-w-0">
				<div class="text-sm font-bold text-content truncate">Matías Peñaloza</div>
				<div class="flex items-center gap-1.5 text-[11px] text-content/50">
					<GraduationCap size={12} />
					<span class="truncate">Ing. Civil Informática</span>
				</div>
			</div>

			<a
				href="https://github.com/madmti"
				target="_blank"
				rel="noopener noreferrer"
				class="p-2.5 rounded-lg text-content/40 hover:text-content hover:bg-base-300 transition-all active:scale-90 cursor-pointer"
				title="Ver perfil de GitHub"
			>
				<Github size={18} />
			</a>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<a
				href="https://github.com/madmti/Ramo-Libre-Web"
				target="_blank"
				class="flex items-center justify-center gap-2 py-2.5 bg-base-100 text-content border border-base-400 rounded-xl text-xs font-bold hover:bg-base-200 transition-colors"
			>
				<Github size={14} />
				Source Code
			</a>
			<a
				href="https://madmti.github.io/"
				target="_blank"
				class="flex items-center justify-center gap-2 py-2.5 bg-base-100 text-content border border-base-400 rounded-xl text-xs font-bold hover:bg-base-200 transition-colors"
			>
				<Globe size={14} />
				Portafolio
			</a>
		</div>
	</div>
</div>
