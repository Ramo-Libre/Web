<script lang="ts">
	import Table from './views/Table.svelte';
	import List from './views/List.svelte';
	import Clock from './views/Clock.svelte';
	import Gallery from './views/Gallery.svelte';
	import AllHorarios from './views/AllHorarios.svelte';

	type ViewMode = 'table' | 'list' | 'clock' | 'gallery';

	interface Props {
		selectedView: ViewMode;
		showAll: boolean;
	}

	let { selectedView = 'table', showAll = false }: Props = $props();
</script>

<div class="">
	{#if showAll}
		<AllHorarios />
	{:else if selectedView === 'table'}
		<Table />
	{:else if selectedView === 'list'}
		<List />
	{:else if selectedView === 'clock'}
		<Clock />
	{:else if selectedView === 'gallery'}
		<Gallery />
	{/if}
</div>
