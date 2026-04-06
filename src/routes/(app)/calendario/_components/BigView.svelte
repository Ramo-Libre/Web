<script lang="ts">
	import Calendar from './views/Calendar.svelte';
	import List from './views/List.svelte';
	import Kanban from './views/Kanban.svelte';
	import Timeline from './views/Timeline.svelte';

	type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';

	interface Props {
		selectedView: ViewMode;
		selectedStatus?: string;
		selectedRamo?: string;
		onEditEvent?: (event: unknown) => void;
		focusEventId?: string;
	}

	let {
		selectedView = 'calendar',
		selectedStatus = 'all',
		selectedRamo = 'all',
		onEditEvent,
		focusEventId
	}: Props = $props();
</script>

<div class="h-full min-h-0">
	{#if selectedView === 'calendar'}
		<Calendar {onEditEvent} {selectedStatus} {selectedRamo} {focusEventId} />
	{:else if selectedView === 'list'}
		<List {onEditEvent} {selectedStatus} {selectedRamo} {focusEventId} />
	{:else if selectedView === 'kanban'}
		<Kanban {onEditEvent} {selectedStatus} {selectedRamo} {focusEventId} />
	{:else}
		<Timeline {onEditEvent} {selectedStatus} {selectedRamo} {focusEventId} />
	{/if}
</div>
