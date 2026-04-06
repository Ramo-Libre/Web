<script lang="ts">
	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open = false, onClose }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button class="absolute inset-0 bg-black/40" aria-label="Cerrar" onclick={onClose}></button>
		<div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
			<div class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
				Nuevo evento
			</div>
			<div class="mt-4 flex justify-end">
				<button
					class="px-4 py-2 cursor-pointer rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
					onclick={onClose}
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
{/if}
