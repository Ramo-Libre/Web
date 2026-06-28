<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Plus, X } from '@lucide/svelte';
	import SemestreManager from './_components/SemestreManager.svelte';
	import RamoListManager from './_components/RamoListManager.svelte';
	import RamoDetail from './_components/RamoDetail.svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ramoDrawer } from '$lib/features/ramosDrawer.svelte';
	import { ColorUtils } from '$lib/utils/colors';

	let showCreateModal = $state(false);

	const selectedRamoId = $derived(ramoDrawer.id ?? '');

	function handleSelectRamo(id: string) {
		if (ramoDrawer.id === id) {
			ramoDrawer.close();
		} else {
			ramoDrawer.open(id);
		}
	}

	let createName = $state('');
	let createColor = $state(ColorUtils.getRandomColor());

	function openCreateModal() {
		createName = '';
		createColor = ColorUtils.getRandomColor();
		showCreateModal = true;
	}

	function handleCreate() {
		if (!createName.trim()) return;
		semestre.ramos.add({ name: createName.trim(), color: createColor });
		showCreateModal = false;
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
	<div class="flex flex-col lg:grid grid-cols-1 lg:grid-cols-12 gap-6">
		<div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
			<div>
				<SemestreManager />
			</div>
			<div>
				<RamoListManager {selectedRamoId} onSelectRamo={handleSelectRamo} onRequestAdd={openCreateModal} />
			</div>
		</div>

		<!-- Desktop: inline detail -->
		<div class="hidden lg:block lg:col-span-7 xl:col-span-8">
			{#if selectedRamoId}
				<div class="relative">
					<button
						onclick={() => ramoDrawer.close()}
						class="absolute top-4 right-4 z-10 p-2 rounded-lg text-content/30 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
						aria-label="Cerrar detalle"
					>
						<X size={20} />
					</button>
					<RamoDetail {selectedRamoId} />
				</div>
			{:else}
				<div
					class="bg-base-200 border border-base-400 shadow-inner rounded-xl p-6 h-full flex items-center justify-center"
				>
					<div class="text-center text-content/40">
						<p class="text-lg font-medium text-content/60">Detalle del Ramo</p>
						<p class="text-sm mt-2">Selecciona un ramo para ver y editar sus propiedades</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Mobile: create ramo modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50"
		role="dialog"
		aria-modal="true"
	>
		<button
			class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
			onclick={() => (showCreateModal = false)}
			aria-label="Cancelar"
		></button>
		<div
			class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400"
			in:fly={{ y: 100, duration: 250 }}
		>
			<div
				class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
			>
				<h3 class="text-lg font-bold text-content">Nuevo Ramo</h3>
				<button
					onclick={() => (showCreateModal = false)}
					class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
					aria-label="Cerrar"
				>
					<X size={20} />
				</button>
			</div>
			<div class="p-6 space-y-6">
				<div class="space-y-2">
					<label for="create-ramo-name" class="text-sm font-semibold text-content/70">Nombre</label>
					<input
						id="create-ramo-name"
						type="text"
						bind:value={createName}
						onkeydown={(e) => e.key === 'Enter' && handleCreate()}
						placeholder="Ej: Arquitectura de Software"
						class="w-full px-3 py-2 bg-base-200 text-content rounded-lg border border-base-400 focus:outline-none focus:ring-2 focus:ring-classes-100 focus:border-classes-100 transition-all placeholder-content/30"
						autocomplete="off"
					/>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-semibold text-content/70">Color</label>
					<div class="flex flex-wrap gap-3">
						{#each ColorUtils.COLORS as color (color)}
							<button
								class="w-10 h-10 rounded-lg border border-base-100/20 shadow-sm transition-all hover:scale-110 cursor-pointer {createColor ===
								color
									? 'ring-2 ring-content/80 scale-110'
									: ''}"
								style="background-color: {color}"
								title={color}
								onclick={() => (createColor = color)}
								aria-label="Elegir color {color}"
							></button>
						{/each}
					</div>
				</div>
				<button
					onclick={handleCreate}
					disabled={!createName.trim()}
					class="w-full bg-primary-100 hover:opacity-90 disabled:opacity-50 text-base-100 py-3 px-4 rounded-xl active:scale-95 inline-flex items-center justify-center gap-2 font-semibold transition-all shadow-sm cursor-pointer"
				>
					<Plus size={20} />
					Crear Ramo
				</button>
			</div>
		</div>
	</div>
{/if}
