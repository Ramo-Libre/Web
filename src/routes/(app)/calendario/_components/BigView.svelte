

<script lang="ts">
	import Calendar from './views/Calendar.svelte';
	import List from './views/List.svelte';
	import Kanban from './views/Kanban.svelte';
	import Timeline from './views/Timeline.svelte';

	type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';

	interface Props {
		selectedView: ViewMode;
	}

	let { selectedView = 'calendar' }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm h-full min-h-0">
		{#if selectedView === 'calendar'}
			<Calendar />
		{:else if selectedView === 'list'}
			<List />
		{:else if selectedView === 'kanban'}
			<Kanban />
		{:else}
			<Timeline />
		{/if}
</div>
