<script lang="ts">
	type LayerMode = boolean;
	interface Props {
		selectedLayer: LayerMode;
	}

	let { selectedLayer = false }: Props = $props();
</script>

<div class="bg-white rounded-2xl border border-gray-200 shadow-sm sm:p-6 p-4 h-full">
    List view Layer: {selectedLayer}
</div>
