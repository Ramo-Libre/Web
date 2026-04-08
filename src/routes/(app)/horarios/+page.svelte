<script>
	import { fly } from 'svelte/transition';
	import ViewBar from './_components/ViewBar.svelte';
	import MainView from './_components/MainView.svelte';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-6">
	<ViewBar />
	<MainView />
</div>