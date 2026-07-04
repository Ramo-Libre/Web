<script lang="ts">
	import { fly } from 'svelte/transition';
	import LocalStorageStatus from './_components/dev-tools/LocalStorageStatus.svelte';
	import TimeTravel from './_components/dev-tools/TimeTravel.svelte';
	import StorageTransfer from './_components/dev-tools/StorageTransfer.svelte';
	import GeneratorV2 from './_components/dev-tools/GeneratorV2.svelte';
	import DevSyncPanel from './_components/dev-tools/DevSyncPanel.svelte';
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="w-full space-y-8">
	<div class="columns-1 md:columns-2 gap-6 space-y-6">
		<div class="break-inside-avoid">
			<TimeTravel />
		</div>

		<div class="break-inside-avoid">
			<LocalStorageStatus />
		</div>

		<div class="break-inside-avoid">
			<StorageTransfer />
		</div>

		<div class="break-inside-avoid">
			<GeneratorV2 />
		</div>

		<div class="break-inside-avoid">
			<DevSyncPanel />
		</div>
	</div>
</div>

<style>
	.break-inside-avoid {
		break-inside: avoid;
	}
</style>
