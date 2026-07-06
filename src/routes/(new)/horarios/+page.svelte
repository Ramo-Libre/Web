<script lang="ts">
	import { fly } from 'svelte/transition';
	import WeekGrid from './_components/WeekGrid.svelte';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
	<WeekGrid />
</div>
