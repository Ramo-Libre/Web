<script lang="ts">
    import { PUBLIC_SHOW_DEV_TOOLS } from '$env/static/public';
    const showDevTools = PUBLIC_SHOW_DEV_TOOLS === 'true';
	let { children } = $props();
</script>

{#if showDevTools}
	{@render children()}
{/if}
