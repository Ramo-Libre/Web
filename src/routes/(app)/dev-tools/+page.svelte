<script lang="ts">
	import { fly } from 'svelte/transition';
	import DataGenerator from './_components/DataGenerator.svelte';
	import LocalStorageStatus from './_components/LocalStorageStatus.svelte';
	import WriteLatency from './_components/WriteLatency.svelte';
</script>

<div in:fly={{ y: 10, duration: 300 }} class="w-full space-y-8">
	<div class="columns-1 md:columns-2 gap-6 space-y-6">
		<div class="break-inside-avoid">
			<DataGenerator />
		</div>

		<div class="break-inside-avoid">
			<LocalStorageStatus />
		</div>

		<div class="break-inside-avoid">
			<WriteLatency />
		</div>
	</div>
</div>

<style>
	/* Esto evita que un componente se "corte" a la mitad entre dos columnas */
	.break-inside-avoid {
		break-inside: avoid;
	}
</style>
