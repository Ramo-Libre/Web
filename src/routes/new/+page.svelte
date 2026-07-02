<script lang="ts">
	import NewDashboard from '$lib/pages/NewDashboard.svelte';
	import { fly } from 'svelte/transition';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
    <NewDashboard />
</div>
