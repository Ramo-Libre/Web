<script lang="ts">
	import NewLayout from '$lib/layouts/NewLayout.svelte';
	let { children } = $props();
</script>

<NewLayout>{@render children()}</NewLayout>
