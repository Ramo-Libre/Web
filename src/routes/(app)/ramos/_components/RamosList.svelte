<script lang="ts">
	import { IconButton } from '$lib/components/ui/icon-button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Trash, Plus, Minus } from '@lucide/svelte';
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

	// Estado para confirmación de eliminación
	let deleteConfirmData = $state<{ id: string; name: string } | null>(null);

	// Computed para verificar si hay ramos
	const hasRamos = $derived(db.ramos.list.length > 0);

	// Obtener el ramo seleccionado
	const selectedRamo = $derived(selectedRamoId ? db.ramos.get(selectedRamoId) : null);

	// Auto-expandir cuando no hay ramos
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

		// Seleccionar automáticamente el nuevo ramo
		if (id) {
			onSelectRamo(id);
		}

		// Cerrar formularios
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

		if (selectedRamoId === deleteConfirmData.id) {
			onSelectRamo('');
		}
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

<!-- Versión Desktop (sm y superiores) -->
<div
	class="hidden sm:flex bg-white border border-slate-200 rounded-xl p-6 flex-col h-full min-h-0 overflow-hidden"
>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6 shrink-0">
		<h2 class="text-xl font-bold text-slate-800">Mis Ramos</h2>
		{#if hasRamos}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<IconButton
						onclick={() => (isFormExpanded = !isFormExpanded)}
						class="text-slate-500 hover:text-orange-500 hover:bg-orange-50"
						size="sm"
						aria-label={isFormExpanded ? 'Ocultar formulario' : 'Mostrar formulario'}
					>
						{#if isFormExpanded}
							<Minus class="w-4 h-4" />
						{:else}
							<Plus class="w-4 h-4" />
						{/if}
					</IconButton>
				</Tooltip.Trigger>
				<Tooltip.Content side="top">
					<p>{isFormExpanded ? 'Ocultar formulario' : 'Agregar nuevo ramo'}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>

	<!-- Formulario para agregar ramo -->
	{#if isFormExpanded}
		<div
			transition:slide={{ duration: 300, axis: 'y' }}
			class="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 shrink-0"
		>
			<div class="space-y-2">
				<label for="nombreRamo" class="text-sm font-semibold text-slate-600">
					Nueva Asignatura
				</label>
				<input
					id="nombreRamo"
					type="text"
					bind:value={nombreRamo}
					onkeydown={(e) => e.key === 'Enter' && handleAgregar()}
					placeholder="Ej: Arquitectura de Software"
					class="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
					autocomplete="off"
					enterkeyhint="done"
				/>
			</div>

			<button
				onclick={handleAgregar}
				disabled={!nombreRamo.trim()}
				class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none text-white py-2 px-4 rounded-md active:scale-95 inline-flex items-center justify-center gap-2 font-medium transition-all shadow-sm"
				type="button"
				style="touch-action: manipulation;"
			>
				<Plus class="w-4 h-4" />
				Agregar Ramo
			</button>
		</div>
	{/if}

	<!-- Lista de Ramos -->
	<div class="space-y-3 flex-1 overflow-y-auto min-h-0">
		{#each db.ramos.list as [id, ramo] (id)}
			<div
				class="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer {selectedRamoId ===
				id
					? 'bg-orange-50 border-orange-200 shadow-sm'
					: 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'}"
				onclick={() => onSelectRamo(id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && onSelectRamo(id)}
			>
				<!-- Indicador de color -->
				<div
					class="h-10 w-10 rounded-lg text-white shadow-sm border border-white/20 flex items-center justify-center font-bold text-sm transition-all"
					style="background-color: {ramo.color};"
				>
					{ramo.nombre.substring(0, 2).toUpperCase()}
				</div>

				<div class="flex-1 min-w-0">
					<div class="font-semibold text-slate-800 truncate">{ramo.nombre}</div>
					<div class="text-xs text-slate-400 font-mono">
						{id.slice(0, 8)}
					</div>
				</div>

				<!-- Botón eliminar -->
				<Tooltip.Root>
					<Tooltip.Trigger>
						<IconButton
							onclick={(e) => {
								e.stopPropagation();
								openDeleteConfirm(id);
							}}
							class="text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
							size="sm"
							aria-label="Borrar ramo"
						>
							<Trash class="w-4 h-4" />
						</IconButton>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">
						<p>Eliminar ramo</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		{:else}
			<div class="text-center py-8 text-slate-400">
				<p class="text-sm">No hay ramos registrados.</p>
				<p class="text-xs mt-1">Agrega uno usando el formulario.</p>
			</div>
		{/each}
	</div>
</div>

<!-- Versión Móvil (menores a sm) -->
<div class="sm:hidden space-y-3">
	<!-- Botón selector móvil -->
	<div class="relative z-30">
		<button
			onclick={() => (isMobileDropdownOpen = !isMobileDropdownOpen)}
			class="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between transition-all duration-200 {isMobileDropdownOpen
				? 'border-orange-200 bg-orange-50'
				: 'hover:border-slate-300'}"
		>
			{#if selectedRamo}
				<div class="flex items-center gap-3">
					<!-- Avatar del ramo seleccionado -->
					<div
						class="h-8 w-8 rounded-lg text-white shadow-sm border border-white/20 flex items-center justify-center font-bold text-xs"
						style="background-color: {selectedRamo.color};"
					>
						{selectedRamo.nombre.substring(0, 2).toUpperCase()}
					</div>
					<div class="text-left">
						<div class="font-semibold text-slate-800 truncate">{selectedRamo.nombre}</div>
						<div class="text-xs text-slate-400 font-mono">{selectedRamoId.slice(0, 8)}</div>
					</div>
				</div>
			{:else}
				<div class="flex items-center gap-3 text-slate-500">
					<div class="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							></path>
						</svg>
					</div>
					<span class="font-medium">Seleccionar ramo</span>
				</div>
			{/if}

			<!-- Icono de flecha -->
			<svg
				class="w-5 h-5 text-slate-400 transition-transform duration-200 {isMobileDropdownOpen
					? 'rotate-180'
					: ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
				></path>
			</svg>
		</button>

		<!-- Dropdown con las cartas de ramos -->
		{#if isMobileDropdownOpen}
			<!-- Overlay para cerrar al tocar fuera -->
			<div
				class="fixed inset-0 z-40"
				onclick={closeMobileDropdown}
				onkeydown={(e) => e.key === 'Escape' && closeMobileDropdown()}
				role="button"
				tabindex="-1"
				aria-label="Close dropdown"
			></div>

			<div
				class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
			>
				{#if db.ramos.list.length > 0}
					<div class="p-2">
						<!-- Header con opción de agregar -->
						<div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
							<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
								Mis Ramos ({db.ramos.list.length})
							</div>
							<button
								type="button"
								style="touch-action: manipulation;"
								onclick={(e) => {
									e.stopPropagation();
									isMobileFormVisible = !isMobileFormVisible;
								}}
								class="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 active:scale-95 rounded transition-all {isMobileFormVisible
									? 'rotate-45'
									: ''}"
							>
								<Plus class="w-5 h-5" />
							</button>
						</div>

						<!-- Formulario como carta dentro del dropdown -->
						{#if isMobileFormVisible}
							<div class="mx-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
								<div class="space-y-2">
									<label
										for="nombreRamoMobileDropdown"
										class="block text-xs font-medium text-slate-600"
									>
										Nueva asignatura
									</label>
									<input
										id="nombreRamoMobileDropdown"
										type="text"
										autocomplete="off"
										enterkeyhint="done"
										bind:value={nombreRamo}
										onkeydown={(e) => e.key === 'Enter' && handleAgregar()}
										placeholder="Ej: Arquitectura de Software"
										class="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
									/>
								</div>
								<button
									onclick={handleAgregar}
									disabled={!nombreRamo.trim()}
									class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none text-white text-sm py-2 px-3 rounded-md active:scale-95 inline-flex items-center justify-center gap-2 font-medium transition-all"
									type="button"
									style="touch-action: manipulation;"
								>
									<Plus class="w-3 h-3" />
									Agregar
								</button>
							</div>
						{/if}

						<div class="space-y-1">
							{#each db.ramos.list as [id, ramo] (id)}
								<div
									class="flex items-center gap-2 p-2 rounded-lg {selectedRamoId === id
										? 'bg-orange-50'
										: 'hover:bg-slate-50'} transition-all duration-200"
								>
									<button
										onclick={() => handleMobileSelect(id)}
										class="flex-1 flex items-center gap-3 text-left active:opacity-70"
										type="button"
										style="touch-action: manipulation;"
									>
										<!-- Indicador de color -->
										<div
											class="h-8 w-8 rounded-lg text-white shadow-sm border border-white/20 flex items-center justify-center font-bold text-xs"
											style="background-color: {ramo.color};"
										>
											{ramo.nombre.substring(0, 2).toUpperCase()}
										</div>

										<div class="flex-1 min-w-0">
											<div class="font-semibold text-slate-800 truncate">{ramo.nombre}</div>
											<div class="text-xs text-slate-400 font-mono">
												{id.slice(0, 8)}
											</div>
										</div>

										{#if selectedRamoId === id}
											<svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												></path>
											</svg>
										{/if}
									</button>

									<!-- Botón eliminar -->
									<button
										onclick={(e) => {
											e.stopPropagation();
											openDeleteConfirm(id);
										}}
										class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:text-rose-600 active:bg-rose-100 active:scale-95 rounded transition-all duration-150"
										type="button"
										style="touch-action: manipulation;"
									>
										<Trash class="w-4 h-4" />
									</button>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="p-4">
						<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
							<div class="space-y-2">
								<label for="nombreRamoMobileEmpty" class="block text-xs font-medium text-slate-600">
									Tu primer ramo
								</label>
								<input
									id="nombreRamoMobileEmpty"
									type="text"
									autocomplete="off"
									enterkeyhint="done"
									bind:value={nombreRamo}
									onkeydown={(e) => e.key === 'Enter' && handleAgregar()}
									placeholder="Ej: Arquitectura de Software"
									class="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
								/>
							</div>
							<button
								onclick={handleAgregar}
								disabled={!nombreRamo.trim()}
								class="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none text-white text-sm py-2 px-3 rounded-md active:scale-95 inline-flex items-center justify-center gap-2 font-medium transition-all"
								type="button"
								style="touch-action: manipulation;"
							>
								<Plus class="w-3 h-3" />
								Agregar
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Diálogo de confirmación para eliminar ramo -->
<AlertDialog.Root
	open={deleteConfirmData !== null}
	onOpenChange={(open) => !open && cancelDelete()}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>¿Confirmar eliminación?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if deleteConfirmData}
					Esta acción eliminará permanentemente el ramo <strong>"{deleteConfirmData.name}"</strong>
					y todos los datos asociados (evaluaciones, tags, reglas). Esta acción no se puede deshacer.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={cancelDelete} class="cursor-pointer">
				Cancelar
			</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={confirmDelete}
				class="bg-red-600 hover:bg-red-700 cursor-pointer"
			>
				Eliminar
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
