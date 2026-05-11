<script lang="ts">
	import { fly } from 'svelte/transition';
	import ViewBar from './_components/ViewBar.svelte';
	import MainView from './_components/MainView.svelte';
	import { db } from '$lib';

	type ViewMode = 'table' | 'list' | 'clock' | 'gallery';
	let selectedView: ViewMode = db.preferences.scheduleView;
	let lastView: ViewMode = selectedView;
	let showAll = false;

	function handleSelectView(view: ViewMode) {
		selectedView = view;
		lastView = view;
		showAll = false;
		db.preferences.setScheduleView(view);
	}

	function handleToggleAll() {
		if (showAll) {
			showAll = false;
			selectedView = lastView;
			return;
		}
		lastView = selectedView;
		showAll = true;
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-6">
	<ViewBar {selectedView} showAll={showAll} onToggleAll={handleToggleAll} onSelectView={handleSelectView} />
	<MainView {selectedView} {showAll} />
</div>
