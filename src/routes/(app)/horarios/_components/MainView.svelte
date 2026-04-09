<script lang="ts">
	import Table from './views/Table.svelte';
	import List from './views/List.svelte';
	import Clock from './views/Clock.svelte';
	import Gallery from './views/Gallery.svelte';

	type ViewMode = 'table' | 'list' | 'clock' | 'gallery';
	type LayerMode = boolean;

	interface Props {
		selectedView: ViewMode;
		selectedLayer: LayerMode;
	}

	let { selectedView = 'table', selectedLayer = false }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm h-[700px]">
	{#if selectedView === 'table'}
		<Table selectedLayer={selectedLayer} />
	{:else if selectedView === 'list'}
		<List selectedLayer={selectedLayer} />
	{:else if selectedView === 'clock'}
		<Clock selectedLayer={selectedLayer} />
	{:else if selectedView === 'gallery'}
		<Gallery selectedLayer={selectedLayer} />
	{/if}
</div>
