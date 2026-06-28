<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div
	class="bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg flex flex-col justify-center"
>
	<div class="flex items-center justify-between mb-4">
		<h3 class="font-bold text-2xl">Motor de Cálculo</h3>
		<div class="flex gap-2">
			<div class="w-3 h-3 rounded-full bg-red-400"></div>
			<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
			<div class="w-3 h-3 rounded-full bg-green-400"></div>
		</div>
	</div>

	<p class="text-white/90 mb-6 leading-relaxed">
		El corazón de Ramo Libre es nuestro motor de cálculo inteligente, diseñado para ayudarte a
		planificar tu carrera universitaria de manera óptima. Calcula automáticamente las notas que
		necesitas obtener en tus próximos ramos para alcanzar tus metas académicas.
	</p>

	<div class="flex items-center justify-center">
		<a
			href="https://github.com/madmti/GradeSolver"
			target="_blank"
			rel="noopener noreferrer"
			class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
		>
			<Icon icon="mdi:github" width={28} />
			Ver código fuente
		</a>
	</div>
</div>
