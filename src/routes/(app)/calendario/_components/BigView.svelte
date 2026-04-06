

<script lang="ts">
	import Calendar from './views/Calendar.svelte';
	import List from './views/List.svelte';
	import Kanban from './views/Kanban.svelte';
	import Timeline from './views/Timeline.svelte';

	type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';

	interface Props {
		selectedView: ViewMode;
		onEditEvent?: (event: unknown) => void;
	}

	let { selectedView = 'calendar', onEditEvent }: Props = $props();
</script>

<div class="h-full min-h-0">
		{#if selectedView === 'calendar'}
			<Calendar />
		{:else if selectedView === 'list'}
			<List onEditEvent={onEditEvent} />
		{:else if selectedView === 'kanban'}
			<Kanban />
		{:else}
			<Timeline />
		{/if}
</div>
