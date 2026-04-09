<script lang="ts">
	import { Trash, Plus, Minus, ChevronRight } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import { db } from '$lib/state/index.svelte.js';
	import { ColorUtils } from '$lib/utils/colors.js';

	interface Props {
		selectedRamoId: string;
		onSelectRamo: (id: string) => void;
	}

	let { selectedRamoId = '', onSelectRamo }: Props = $props();

	// Estado local para el formulario
	let nombreRamo = $state('');
	let isFormExpanded = $state(false);

	// Estado para el selector móvil
	let isMobileDropdownOpen = $state(false);
	let isMobileFormVisible = $state(false);

	// Estado para confirmación de eliminación (Modal manual)
	let deleteConfirmData = $state<{ id: string; name: string } | null>(null);

	const hasRamos = $derived(db.ramos.list.length > 0);
	const selectedRamo = $derived(selectedRamoId ? db.ramos.get(selectedRamoId) : null);

	$effect(() => {
		if (!hasRamos) {
			isFormExpanded = true;
			isMobileFormVisible = true;
		}
	});

	function handleAgregar() {
		if (!nombreRamo.trim()) return;
		const id = db.ramos.add({
			nombre: nombreRamo,
			color: ColorUtils.getRandomColor()
		});
		nombreRamo = '';
		if (id) onSelectRamo(id);
		isFormExpanded = false;
		isMobileFormVisible = false;
	}

	function openDeleteConfirm(id: string) {
		const ramo = db.ramos.get(id);
		if (!ramo) return;
		deleteConfirmData = { id, name: ramo.nombre };
	}

	function confirmDelete() {
		if (!deleteConfirmData) return;
		if (selectedRamoId === deleteConfirmData.id) onSelectRamo('');
		db.removeRamo(deleteConfirmData.id);
		deleteConfirmData = null;
	}

	function cancelDelete() {
		deleteConfirmData = null;
	}

	function handleMobileSelect(id: string) {
		onSelectRamo(id);
		isMobileDropdownOpen = false;
	}

	function closeMobileDropdown() {
		isMobileDropdownOpen = false;
	}
</script>

<div class="hidden sm:flex bg-base-100 border border-base-400 rounded-xl p-6 flex-col h-full min-h-0 overflow-hidden">
	<div class="flex items-center justify-between mb-6 shrink-0">
		<h2 class="text-xl font-bold text-content">Mis Ramos</h2>
		{#if hasRamos}
			<button
				onclick={() => (isFormExpanded = !isFormExpanded)}
				class="p-2 rounded-lg text-content/50 hover:text-classes-100 hover:bg-classes-400 transition-colors cursor-pointer"
				title={isFormExpanded ? 'Ocultar formulario' : 'Agregar nuevo ramo'}
			>
				{#if isFormExpanded}
					<Minus class="w-4 h-4" />
				{:else}
					<Plus class="w-4 h-4" />
				{/if}
			</button>
		{/if}
	</div>

	{#if isFormExpanded}
		<div
			transition:slide={{ duration: 300, axis: 'y' }}
			class="space-y-4 mb-6 p-4 bg-base-200 rounded-lg border border-base-300 shrink-0"
		>
			<div class="space-y-2">
				<label for="nombreRamo" class="text-sm font-semibold text-content/70">
					Nueva Asignatura
				</label>
				<input
					id="nombreRamo"
					type="text"
					bind:value={nombreRamo}
					onkeydown={(e) => e.key === 'Enter' && handleAgregar()}
					placeholder="Ej: Arquitectura de Software"
					class="w-full px-3 py-2 bg-base-100 text-content rounded-lg border border-base-400 focus:outline-none focus:ring-2 focus:ring-classes-100 focus:border-classes-100 transition-all placeholder-content/30"
					autocomplete="off"
				/>
			</div>

			<button
				onclick={handleAgregar}
				disabled={!nombreRamo.trim()}
				class="w-full bg-primary-100 hover:opacity-90 disabled:opacity-50 text-base-100 py-2 px-4 rounded-md active:scale-95 inline-flex items-center justify-center gap-2 font-medium transition-all shadow-sm cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				Agregar Ramo
			</button>
		</div>
	{/if}

	<div class="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
		{#each db.ramos.list as [id, ramo] (id)}
			<div
				class="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer {selectedRamoId === id
					? 'bg-classes-400 border-classes-300 shadow-sm'
					: 'bg-base-100 border-base-400 hover:border-classes-300 hover:bg-classes-400/50'}"
				onclick={() => onSelectRamo(id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && onSelectRamo(id)}
			>
				<div
					class="h-10 w-10 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-sm transition-all shrink-0"
					style="background-color: {ramo.color};"
				>
					{ramo.nombre.substring(0, 2).toUpperCase()}
				</div>

				<div class="flex-1 min-w-0">
					<div class="font-semibold text-content truncate">{ramo.nombre}</div>
					<div class="text-xs text-content/40 font-mono">{id.slice(0, 8)}</div>
				</div>

				<button
					onclick={(e) => { e.stopPropagation(); openDeleteConfirm(id); }}
					class="p-2 text-content/20 hover:text-error-100 hover:bg-error-400 opacity-0 group-hover:opacity-100 rounded transition-all cursor-pointer"
					title="Eliminar ramo"
				>
					<Trash class="w-4 h-4" />
				</button>
			</div>
		{:else}
			<div class="text-center py-8 text-content/40">
				<p class="text-sm">No hay ramos registrados.</p>
			</div>
		{/each}
	</div>
</div>

<div class="sm:hidden space-y-3">
	<div class="relative z-30">
		<button
			onclick={() => (isMobileDropdownOpen = !isMobileDropdownOpen)}
			class="w-full bg-base-100 border rounded-xl p-4 flex items-center justify-between transition-all duration-200 {isMobileDropdownOpen
				? 'border-classes-300 bg-classes-400'
				: 'border-base-400'}"
		>
			{#if selectedRamo}
				<div class="flex items-center gap-3">
					<div class="h-8 w-8 rounded-lg text-base-100 flex items-center justify-center font-bold text-xs" style="background-color: {selectedRamo.color};">
						{selectedRamo.nombre.substring(0, 2).toUpperCase()}
					</div>
					<div class="text-left">
						<div class="font-semibold text-content truncate">{selectedRamo.nombre}</div>
						<div class="text-xs text-content/40 font-mono">{selectedRamoId.slice(0, 8)}</div>
					</div>
				</div>
			{:else}
				<div class="flex items-center gap-3 text-content/50">
					<div class="h-8 w-8 rounded-lg bg-base-300 flex items-center justify-center"><Plus class="w-4 h-4" /></div>
					<span class="font-medium">Seleccionar ramo</span>
				</div>
			{/if}
			<ChevronRight class="w-5 h-5 text-content/40 transition-transform {isMobileDropdownOpen ? 'rotate-90' : ''}" />
		</button>

		{#if isMobileDropdownOpen}
			<div class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onclick={closeMobileDropdown}></div>

			<div class="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-400 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
				<div class="p-2">
					<div class="flex items-center justify-between px-3 py-2 border-b border-base-300 mb-1">
						<div class="text-xs font-semibold text-content/50 uppercase">Mis Ramos ({db.ramos.list.length})</div>
						<button onclick={(e) => { e.stopPropagation(); isMobileFormVisible = !isMobileFormVisible; }} class="p-2 text-content/40 hover:text-classes-100 rounded transition-all {isMobileFormVisible ? 'rotate-45' : ''}">
							<Plus class="w-5 h-5" />
						</button>
					</div>

					{#if isMobileFormVisible}
						<div class="mx-2 mb-2 p-3 bg-base-200 border border-base-300 rounded-lg space-y-3">
							<input bind:value={nombreRamo} placeholder="Nueva asignatura" class="w-full px-3 py-2 bg-base-100 text-content rounded-lg border border-base-400 text-sm focus:ring-2 focus:ring-classes-100" />
							<button onclick={handleAgregar} disabled={!nombreRamo.trim()} class="w-full bg-primary-100 text-base-100 py-2 rounded-md font-medium">Agregar</button>
						</div>
					{/if}

					<div class="space-y-1">
						{#each db.ramos.list as [id, ramo] (id)}
							<div class="flex items-center gap-2 p-2 rounded-lg {selectedRamoId === id ? 'bg-classes-400' : ''}">
								<button onclick={() => handleMobileSelect(id)} class="flex-1 flex items-center gap-3 text-left">
									<div class="h-8 w-8 rounded-lg text-base-100 flex items-center justify-center font-bold text-xs" style="background-color: {ramo.color};">
										{ramo.nombre.substring(0, 2).toUpperCase()}
									</div>
									<div class="flex-1 min-w-0">
										<div class="font-semibold text-content truncate">{ramo.nombre}</div>
										<div class="text-xs text-content/40 font-mono">{id.slice(0, 8)}</div>
									</div>
								</button>
								<button onclick={(e) => { e.stopPropagation(); openDeleteConfirm(id); }} class="p-2 text-content/20 hover:text-error-100">
									<Trash class="w-4 h-4" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if deleteConfirmData !== null}
	<div class="fixed inset-0 z-100 flex items-center justify-center p-4">
		<button class="absolute inset-0 bg-black/40 backdrop-blur-sm" onclick={cancelDelete}></button>
		<div class="relative bg-base-100 border border-base-400 rounded-2xl shadow-xl max-w-md w-full p-6">
			<h3 class="text-lg font-bold text-content mb-2">¿Confirmar eliminación?</h3>
			<p class="text-sm text-content/70 mb-6">
				Esta acción eliminará permanentemente el ramo <strong class="text-content">"{deleteConfirmData.name}"</strong>
				y todos sus datos asociados. No se puede deshacer.
			</p>
			<div class="flex justify-end gap-3">
				<button onclick={cancelDelete} class="px-4 py-2 rounded-lg border border-base-400 text-content/70 font-semibold hover:bg-base-200">Cancelar</button>
				<button onclick={confirmDelete} class="px-4 py-2 rounded-lg bg-error-100 text-base-100 font-semibold hover:opacity-90">Eliminar</button>
			</div>
		</div>
	</div>
{/if}
