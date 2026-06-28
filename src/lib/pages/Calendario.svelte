<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { db } from '$lib/state/index.svelte';
	import type { Event as CalendarEvent } from '$lib/state/events.svelte';
	import BigView from './_components/calendario/BigView.svelte';
	import ViewBar from './_components/calendario/ViewBar.svelte';
	import EventModal from './_components/shared/EventModal.svelte';

	type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';
	type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

	let selectedView: ViewMode = db.preferences.calendarView;
	let selectedStatus: StatusFilter = db.preferences.calendarStatus;
	let selectedRamo: string = db.preferences.calendarRamo;
	let isEventModalOpen = false;
	let editingEvent: CalendarEvent | null = null;
	let handledHash = false;
	let hashEventId = '';
	let focusEventId: string | undefined = undefined;

	onMount(() => {
		const hash = page.url.hash.slice(1);
		if (!hash) return;
		hashEventId = hash;
		if (handledHash) return;

		const handlers: Record<ViewMode, (id: string) => void> = {
			calendar: (id) => {
				focusEventId = id;
				console.log('calendar handler', id);
			},
			list: (id) => {
				focusEventId = id;
				console.log('list handler', id);
			},
			kanban: (id) => {
				focusEventId = id;
				console.log('kanban handler', id);
			},
			timeline: (id) => {
				focusEventId = id;
				console.log('timeline handler', id);
			}
		};

		const handler = handlers[selectedView];
		handler?.(hashEventId);
		handledHash = true;
	});

	function handleSelectView(view: ViewMode) {
		selectedView = view;
		db.preferences.setCalendarView(view);
	}

	function handleSelectStatus(status: StatusFilter) {
		selectedStatus = status;
		db.preferences.setCalendarStatus(status);
	}

	function handleSelectRamo(ramoId: string) {
		selectedRamo = ramoId;
		db.preferences.setCalendarRamo(ramoId);
	}

	function handleOpenEventModal() {
		editingEvent = null;
		isEventModalOpen = true;
	}

	function handleEditEvent(event: unknown) {
		editingEvent = event as CalendarEvent;
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
			{selectedView}
			{selectedStatus}
			{selectedRamo}
			onSelectView={handleSelectView}
			onSelectStatus={handleSelectStatus}
			onSelectRamo={handleSelectRamo}
			onOpenEventModal={handleOpenEventModal}
		/>
		<BigView
			{selectedView}
			{selectedStatus}
			{selectedRamo}
			onEditEvent={handleEditEvent}
			{focusEventId}
		/>
	</div>
	<EventModal open={isEventModalOpen} onClose={handleCloseEventModal} initialEvent={editingEvent} />
</div>
