<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Dev Tools</h1>

</div>
