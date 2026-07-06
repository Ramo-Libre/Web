<script lang="ts">
	import { fly } from 'svelte/transition';
	import Apariencia from './_components/Apariencia.svelte';
	import About from './_components/About.svelte';
	import Privacidad from './_components/Privacidad.svelte';
	import Account from './_components/Account.svelte';
	import OtherApps from '$lib/pages/_components/dashboard/OtherApps.svelte';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="w-full">
	<div class="columns-1 lg:columns-2 gap-6 space-y-6">
		<div id="apariencia" class="break-inside-avoid">
			<Apariencia />
		</div>
		<div id="otras" class="break-inside-avoid">
			<OtherApps />
		</div>
		<div id="cuenta" class="break-inside-avoid">
			<Account />
		</div>
		<div id="privacidad" class="break-inside-avoid">
			<Privacidad />
		</div>
		<div id="about" class="break-inside-avoid">
			<About />
		</div>
	</div>
</div>
