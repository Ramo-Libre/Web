<script lang="ts">
	import { fly } from 'svelte/transition';
	import ViewBar from './_components/ViewBar.svelte';
	import MainView from './_components/MainView.svelte';
	import { db } from '$lib';

	type ViewMode = 'table' | 'list' | 'clock' | 'gallery';
	type LayerMode = boolean;
	let selectedView: ViewMode = db.preferences.scheduleView;
	let selectedLayer: LayerMode = db.preferences.scheduleLayer;

	function handleSelectView(view: ViewMode) {
		selectedView = view;
		db.preferences.setScheduleView(view);
	}

	function handleSelectLayer(layer: LayerMode) {
		selectedLayer = layer;
		db.preferences.setScheduleLayer(layer);
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-6">
	<ViewBar
		{selectedView}
		{selectedLayer}
		onSelectView={handleSelectView}
		onSelectLayer={handleSelectLayer}
	/>
	<MainView {selectedView} {selectedLayer} />
</div>
