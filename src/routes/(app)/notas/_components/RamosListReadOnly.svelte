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

<div
	class="hidden sm:flex bg-base-100 border border-base-400 rounded-xl p-6 flex-col h-full min-h-0 overflow-hidden"
>
	<div class="flex items-center justify-between mb-6 shrink-0">
		<h2 class="text-xl font-bold text-content">Mis Ramos</h2>
		<span class="text-sm text-content/50">{db.ramos.list.length} ramos</span>
	</div>

	<div class="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
		{#each db.ramos.list as [id, ramo] (id)}
			<div
				class="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer {selectedRamoId ===
				id
					? 'bg-grades-400 border-grades-300 shadow-sm'
					: 'bg-base-100 border-base-300 hover:border-grades-300 hover:bg-grades-400/50'}"
				onclick={() => onSelectRamo(id)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && onSelectRamo(id)}
			>
				<div
					class="h-10 w-10 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-sm transition-all"
					style="background-color: {ramo.color};"
				>
					{ramo.nombre.substring(0, 2).toUpperCase()}
				</div>

				<div class="flex-1 min-w-0">
					<div class="font-semibold text-content truncate">{ramo.nombre}</div>
					<div class="text-xs text-content/40 font-mono">
						{id.slice(0, 8)}
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-8 text-content/40">
				<div class="mb-4">
					<svg
						class="w-12 h-12 mx-auto opacity-50"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-content/90 mb-2">No tienes ramos</h3>
				<p class="text-sm mb-4 text-content/60">
					Agrega ramos desde la página de Ramos para gestionar tus notas
				</p>
				<a
					href="/ramos"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-base-100 bg-primary-100 hover:opacity-90 transition-opacity"
				>
					Ir a Ramos
				</a>
			</div>
		{/each}
	</div>
</div>

<div class="sm:hidden relative">
	<button
		onclick={() => (isMobileDropdownOpen = !isMobileDropdownOpen)}
		class="w-full bg-base-100 border rounded-xl p-4 flex items-center justify-between transition-all duration-200 {isMobileDropdownOpen
			? 'border-grades-300 bg-grades-400'
			: 'border-base-400 hover:border-base-300'}"
	>
		{#if selectedRamo}
			<div class="flex items-center gap-3">
				<div
					class="h-8 w-8 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-xs"
					style="background-color: {selectedRamo.color};"
				>
					{selectedRamo.nombre.substring(0, 2).toUpperCase()}
				</div>
				<div class="text-left min-w-0">
					<div class="font-semibold text-content truncate">{selectedRamo.nombre}</div>
					<div class="text-xs text-content/40 font-mono">{selectedRamoId.slice(0, 8)}</div>
				</div>
			</div>
		{:else}
			<div class="flex items-center gap-3 text-content/50">
				<div class="h-8 w-8 rounded-lg bg-base-300 flex items-center justify-center">
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

		<svg
			class="w-5 h-5 text-content/40 transition-transform duration-200 shrink-0 {isMobileDropdownOpen
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

	{#if isMobileDropdownOpen}
		<div
			class="fixed inset-0 z-10"
			onclick={closeMobileDropdown}
			onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && closeMobileDropdown()}
			role="button"
			tabindex="0"
			aria-label="Close dropdown"
		></div>

		<div
			class="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-400 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto"
		>
			{#if db.ramos.list.length > 0}
				<div class="p-2">
					<div class="text-xs font-semibold text-content/50 uppercase tracking-wider px-3 py-2">
						Mis Ramos ({db.ramos.list.length})
					</div>
					<div class="space-y-1">
						{#each db.ramos.list as [id, ramo] (id)}
							<button
								onclick={() => handleMobileSelect(id)}
								class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 {selectedRamoId ===
								id
									? 'bg-grades-400 border border-grades-300'
									: 'hover:bg-base-200 border border-transparent'}"
							>
								<div
									class="h-8 w-8 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-xs shrink-0"
									style="background-color: {ramo.color};"
								>
									{ramo.nombre.substring(0, 2).toUpperCase()}
								</div>

								<div class="flex-1 min-w-0 text-left">
									<div class="font-semibold text-content truncate">{ramo.nombre}</div>
									<div class="text-xs text-content/40 font-mono">
										{id.slice(0, 8)}
									</div>
								</div>

								{#if selectedRamoId === id}
									<svg
										class="w-4 h-4 text-grades-100 shrink-0"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
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
				<div class="p-6 text-center text-content/40">
					<div class="mb-3">
						<svg
							class="w-8 h-8 mx-auto opacity-50"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							></path>
						</svg>
					</div>
					<p class="text-sm font-medium text-content/80 mb-2">No tienes ramos</p>
					<p class="text-xs mb-3 text-content/60">Agrega ramos para gestionar tus notas</p>
					<a
						href="/ramos"
						onclick={closeMobileDropdown}
						class="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-base-100 bg-primary-100 hover:opacity-90 transition-opacity"
					>
						Ir a Ramos
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
