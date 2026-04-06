

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
	}

	let { selectedView = 'calendar', selectedStatus = 'all', selectedRamo = 'all', onEditEvent }: Props = $props();
</script>

<div class="h-full min-h-0">
		{#if selectedView === 'calendar'}
			<Calendar onEditEvent={onEditEvent} selectedStatus={selectedStatus} selectedRamo={selectedRamo} />
		{:else if selectedView === 'list'}
			<List onEditEvent={onEditEvent} selectedStatus={selectedStatus} selectedRamo={selectedRamo} />
		{:else if selectedView === 'kanban'}
			<Kanban onEditEvent={onEditEvent} selectedStatus={selectedStatus} selectedRamo={selectedRamo} />
		{:else}
			<Timeline />
		{/if}
</div>
