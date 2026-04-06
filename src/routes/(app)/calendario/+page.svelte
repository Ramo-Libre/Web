<script>
	import { fly } from 'svelte/transition';
	import BigView from './_components/BigView.svelte';
	import ViewBar from './_components/ViewBar.svelte';
	import EventModal from './_components/EventModal.svelte';

	let selectedView = 'calendar';
	let isEventModalOpen = false;

	function handleSelectView(view) {
		selectedView = view;
	}

	function handleOpenEventModal() {
		isEventModalOpen = true;
	}

	function handleCloseEventModal() {
		isEventModalOpen = false;
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="sm:h-full sm:overflow-hidden">
	<div class="flex flex-col gap-6">
		<ViewBar
			selectedView={selectedView}
			onSelectView={handleSelectView}
			onOpenEventModal={handleOpenEventModal}
		/>
		<BigView selectedView={selectedView} />
	</div>
	<EventModal open={isEventModalOpen} onClose={handleCloseEventModal} />
</div>
