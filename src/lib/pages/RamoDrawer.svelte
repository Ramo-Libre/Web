<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ramoDrawer } from '$lib/features/ramosDrawer.svelte';
	import { ColorUtils } from '$lib/utils/colors';

	const selectedRamo = $derived(ramoDrawer.id ? semestre.ramos.get(ramoDrawer.id) : null);

	beforeNavigate(() => {
		ramoDrawer.close();
	});

	function handleNameChange(e: Event) {
		if (!ramoDrawer.id || !selectedRamo) return;
		const newName = (e.currentTarget as HTMLInputElement).value.trim();
		if (newName) semestre.ramos.update(ramoDrawer.id, { ...selectedRamo, name: newName });
	}

	function handleColorChange(color: string) {
		if (!ramoDrawer.id || !selectedRamo) return;
		semestre.ramos.update(ramoDrawer.id, { ...selectedRamo, color });
	}

	function handleNameKey(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
	}
</script>

{#snippet detailContent()}
	{#if selectedRamo}
		<div class="flex items-center gap-4 mb-6">
			<div
				class="w-14 h-14 rounded-xl text-base-100 shadow-md flex items-center justify-center font-bold text-lg shrink-0"
				style="background-color: {selectedRamo.color};"
			>
				{selectedRamo.name.substring(0, 2).toUpperCase()}
			</div>
			<div class="flex-1 min-w-0">
				<div class="text-xs font-semibold text-content/50 uppercase tracking-wider mb-1">
					Nombre del Ramo
				</div>
				<input
					type="text"
					value={selectedRamo.name}
					onchange={handleNameChange}
					onkeydown={handleNameKey}
					class="w-full bg-transparent border-none outline-none text-2xl font-bold text-content focus:ring-0 p-0"
				/>
			</div>
		</div>
		<div class="border-t border-base-300 pt-4">
			<h3 class="text-xs font-semibold text-content/50 mb-3 uppercase tracking-wider">Color</h3>
			<div class="flex flex-wrap gap-2">
				{#each ColorUtils.COLORS as color (color)}
					<button
						class="w-6 h-6 rounded-sm border border-base-100/20 shadow-sm transition-all hover:scale-110 cursor-pointer {selectedRamo.color ===
						color
							? 'ring-2 ring-content/80 scale-110'
							: ''}"
						style="background-color: {color}"
						title={color}
						onclick={() => handleColorChange(color)}
						aria-label="Elegir color {color}"
					></button>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

{#if ramoDrawer.id !== null}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
		in:fly={{ duration: 200 }}
	>
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={() => ramoDrawer.close()}
			aria-label="Cerrar"
		></button>

		<!-- Desktop: right panel -->
		<div
			class="hidden sm:block absolute top-0 right-0 bottom-0 w-[500px] bg-base-100 border-l border-base-400 shadow-2xl overflow-y-auto"
			in:fly={{ x: 380, duration: 250 }}
			out:fly={{ x: 380, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-3 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">Detalle del Ramo</h3>
				<button
					onclick={() => ramoDrawer.close()}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="p-6">
				{@render detailContent()}
			</div>
		</div>

		<!-- Mobile: bottom sheet -->
		<div
			class="sm:hidden absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 max-h-[85vh] overflow-y-auto"
			in:fly={{ y: 100, duration: 250 }}
			out:fly={{ y: 100, duration: 200 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">Detalle del Ramo</h3>
				<button
					onclick={() => ramoDrawer.close()}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="p-6">
				{@render detailContent()}
			</div>
		</div>
	</div>
{/if}
