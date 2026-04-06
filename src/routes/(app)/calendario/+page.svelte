<script>
	import { fly } from 'svelte/transition';
	import BigView from './_components/BigView.svelte';
	import ViewBar from './_components/ViewBar.svelte';
	import EventModal from './_components/EventModal.svelte';

	let selectedView = 'calendar';
	let selectedStatus = 'all';
	let selectedRamo = 'all';
	let isEventModalOpen = false;
	let editingEvent = null;

	function handleSelectView(view) {
		selectedView = view;
	}

	function handleSelectStatus(status) {
		selectedStatus = status;
	}

	function handleSelectRamo(ramoId) {
		selectedRamo = ramoId;
	}

	function handleOpenEventModal() {
		editingEvent = null;
		isEventModalOpen = true;
	}

	function handleEditEvent(event) {
		editingEvent = event;
		isEventModalOpen = true;
	}

	function handleCloseEventModal() {
		isEventModalOpen = false;
		editingEvent = null;
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="sm:h-full">
	<div class="flex flex-col gap-6">
		<ViewBar
			selectedView={selectedView}
			selectedStatus={selectedStatus}
			selectedRamo={selectedRamo}
			onSelectView={handleSelectView}
			onSelectStatus={handleSelectStatus}
			onSelectRamo={handleSelectRamo}
			onOpenEventModal={handleOpenEventModal}
		/>
		<BigView
			selectedView={selectedView}
			selectedStatus={selectedStatus}
			selectedRamo={selectedRamo}
			onEditEvent={handleEditEvent}
		/>
	</div>
	<EventModal open={isEventModalOpen} onClose={handleCloseEventModal} initialEvent={editingEvent} />
</div>
