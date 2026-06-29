<script lang="ts">
	import Apariencia from './_components/Apariencia.svelte';
	import About from './_components/About.svelte';
</script>

<div class="w-full">
	<div class="columns-1 lg:columns-2 gap-6 space-y-6">
		<div id="apariencia" class="break-inside-avoid">
			<Apariencia />
		</div>
		<div id="about" class="break-inside-avoid">
			<About />
		</div>
	</div>
</div>
