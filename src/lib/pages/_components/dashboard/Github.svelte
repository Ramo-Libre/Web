<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Heart } from '@lucide/svelte';
</script>

<div
	class="bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg flex flex-col justify-center"
>
	<div class="text-center mb-6">
		<Heart size={48} class="mx-auto mb-4 text-pink-200" />
		<h3 class="font-bold text-2xl mb-2">¿Quieres Contribuir?</h3>
		<p class="text-indigo-100 text-lg">Ayúdanos a hacer RamoLibreWeb aún mejor</p>
	</div>

	<div class="flex justify-center">
		<a
			href="https://github.com/madmti/Ramo-Libre-Web/"
			target="_blank"
			rel="noopener noreferrer"
			class="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 font-semibold"
		>
			<Icon icon="mdi:github" width={24} />
			Contribuir en GitHub
		</a>
	</div>
</div>
