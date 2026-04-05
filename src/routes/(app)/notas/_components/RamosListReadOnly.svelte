<script lang="ts">
	import { db } from '$lib/state/index.svelte.js';

	interface Props {
		selectedRamoId: string;
		onSelectRamo: (id: string) => void;
	}

	let { selectedRamoId = '', onSelectRamo }: Props = $props();

	// Estado para el selector móvil
	let isMobileDropdownOpen = $state(false);

	// Obtener el ramo seleccionado
	const selectedRamo = $derived(selectedRamoId ? db.ramos.get(selectedRamoId) : null);

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
		<span class="text-sm text-slate-500">{db.ramos.list.length} ramos</span>
	</div>

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
			</div>
		{:else}
			<div class="text-center py-8 text-slate-400">
				<div class="mb-4">
					<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-slate-800 mb-2">No tienes ramos</h3>
				<p class="text-sm mb-4">Agrega ramos desde la página de Ramos para gestionar tus notas</p>
				<a
					href="/ramos"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
				>
					Ir a Ramos
				</a>
			</div>
		{/each}
	</div>
</div>

<!-- Versión Móvil (menores a sm) -->
<div class="sm:hidden relative">
	<!-- Botón selector móvil -->
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
			class="fixed inset-0 z-10"
			onclick={closeMobileDropdown}
			onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && closeMobileDropdown()}
			role="button"
			tabindex="0"
			aria-label="Close dropdown"
		></div>

		<div
			class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto"
		>
			{#if db.ramos.list.length > 0}
				<div class="p-2">
					<div class="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
						Mis Ramos ({db.ramos.list.length})
					</div>
					<div class="space-y-1">
						{#each db.ramos.list as [id, ramo] (id)}
							<button
								onclick={() => handleMobileSelect(id)}
								class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 {selectedRamoId ===
								id
									? 'bg-orange-50 border border-orange-200'
									: 'hover:bg-slate-50 border border-transparent'}"
							>
								<!-- Indicador de color -->
								<div
									class="h-8 w-8 rounded-lg text-white shadow-sm border border-white/20 flex items-center justify-center font-bold text-xs"
									style="background-color: {ramo.color};"
								>
									{ramo.nombre.substring(0, 2).toUpperCase()}
								</div>

								<div class="flex-1 min-w-0 text-left">
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
						{/each}
					</div>
				</div>
			{:else}
				<div class="p-6 text-center text-slate-400">
					<div class="mb-3">
						<svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							></path>
						</svg>
					</div>
					<p class="text-sm font-medium text-slate-700 mb-2">No tienes ramos</p>
					<p class="text-xs mb-3">Agrega ramos para gestionar tus notas</p>
					<a
						href="/ramos"
						onclick={closeMobileDropdown}
						class="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
					>
						Ir a Ramos
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
