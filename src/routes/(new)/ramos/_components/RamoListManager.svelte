<script lang="ts">
	import { Trash, Plus } from '@lucide/svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ramoDrawer } from '$lib/features/ramosDrawer.svelte';
	import { ColorUtils } from '$lib/utils/colors';

	interface Props {
		onRequestAdd?: () => void;
	}

	let { onRequestAdd }: Props = $props();

	let ramoInput = $state('');
	let deleteConfirmData = $state<{ id: string; name: string } | null>(null);

	const ramos = $derived(semestre.ramos.list);
	const hasRamos = $derived(ramos.length > 0);

	function handleAdd() {
		if (!ramoInput.trim()) return;
		semestre.ramos.add({ name: ramoInput.trim(), color: ColorUtils.getRandomColor() });
		ramoInput = '';
	}

	function handleInputKey(e: KeyboardEvent) {
		if (e.key === 'Enter') handleAdd();
	}

	function openDeleteConfirm(id: string) {
		const ramo = semestre.ramos.get(id);
		if (!ramo) return;
		deleteConfirmData = { id, name: ramo.name };
	}

	function confirmDelete() {
		if (!deleteConfirmData) return;
		semestre.ramos.remove(deleteConfirmData.id);
		deleteConfirmData = null;
	}

	function cancelDelete() {
		deleteConfirmData = null;
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl p-6 flex flex-col min-h-0">
	<div class="flex items-center justify-between mb-4 shrink-0">
		<h2 class="text-xl font-bold text-content">Mis Ramos</h2>
		{#if hasRamos}
			<span class="text-xs text-content/40 font-mono">{ramos.length}</span>
		{/if}
	</div>

	<div class="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
		{#each ramos as [id, ramo] (id)}
			<div
				class="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer {ramoDrawer.id ===
				id
					? 'bg-classes-400 border-classes-300 shadow-sm'
					: 'bg-base-100 border-base-400 hover:border-classes-300 hover:bg-classes-400/50'}"
				onclick={() => ramoDrawer.open(id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && ramoDrawer.open(id)}
			>
				<div
					class="h-10 w-10 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-sm transition-all shrink-0"
					style="background-color: {ramo.color};"
				>
					{ramo.name.substring(0, 2).toUpperCase()}
				</div>

				<div class="flex-1 min-w-0">
					<div class="font-semibold text-content truncate">{ramo.name}</div>
				</div>

				<button
					onclick={(e) => {
						e.stopPropagation();
						openDeleteConfirm(id);
					}}
					class="p-2 text-content/20 hover:text-error-100 hover:bg-error-400 group-hover:opacity-100 rounded transition-all cursor-pointer"
					title="Eliminar ramo"
				>
					<Trash class="w-4 h-4" />
				</button>
			</div>
		{:else}
			<div class="text-center py-16 text-content/40">
				<p class="text-sm">No hay ramos registrados.</p>
				<p class="text-xs mt-1">Escribe el nombre abajo para agregar tu primer ramo.</p>
			</div>
		{/each}
	</div>

	<!-- Desktop: inline input -->
	<div class="hidden lg:block shrink-0 pt-4 border-t border-base-300 mt-4">
		<div
			class="flex items-center gap-3 text-content/50 focus-within:text-primary-100 transition-colors"
		>
			<Plus size={20} />
			<input
				type="text"
				bind:value={ramoInput}
				onkeydown={handleInputKey}
				placeholder="Agregar ramo..."
				class="flex-1 bg-transparent border-none outline-none text-base text-content placeholder-content/40 focus:ring-0 p-0"
			/>
		</div>
	</div>

	<!-- Mobile: button opens create modal -->
	{#if onRequestAdd}
		<div class="lg:hidden shrink-0 pt-4 border-t border-base-300 mt-4">
			<button
				onclick={onRequestAdd}
				class="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-base-400 text-content/50 hover:text-primary-100 hover:border-primary-100 transition-colors cursor-pointer font-medium"
			>
				<Plus size={20} />
				Agregar Ramo
			</button>
		</div>
	{/if}
</div>

{#if deleteConfirmData !== null}
	<div class="fixed inset-0 z-100 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			aria-label="Cancelar eliminación de ramo"
			onclick={cancelDelete}
		></button>
		<div
			class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6"
		>
			<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
			<p class="text-sm text-content/70 mb-6">
				Esta acción eliminará permanentemente el ramo <strong class="text-content"
					>"{deleteConfirmData.name}"</strong
				> y todos sus datos asociados (horarios, eventos, escenarios). No se puede deshacer.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={cancelDelete}
					class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200"
					>Cancelar</button
				>
				<button
					onclick={confirmDelete}
					class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90"
					>Eliminar</button
				>
			</div>
		</div>
	</div>
{/if}
