<script lang="ts">
	import OldLayout from '$lib/layouts/OldLayout.svelte';
	let { children } = $props();
</script>

<OldLayout>{@render children()}</OldLayout>
