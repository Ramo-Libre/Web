<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { db } from '$lib/state/index.svelte';
	import { Activity, Dices, Sparkles, Pencil } from '@lucide/svelte';

	interface Perfil {
		mode: 'auto' | 'manual';
		simulaciones: number;
		media_historica: number;
		desviacion_estandar: number;
	}

	let selectedRamoId = $state('');

	$effect(() => {
		if (!browser) return;
		const fragment = page.url.hash.slice(1);
		if (fragment && db.ramos.has(fragment)) {
			selectedRamoId = fragment;
		}
	});

	const contexto = $derived.by(() => {
		if (!selectedRamoId) return null;
		return db.notas.getContexto(selectedRamoId);
	});

	let perfil = $state<Perfil | null>(null);
	let modalOpen = $state(false);

	$effect(() => {
		if (!selectedRamoId) {
			perfil = null;
			return;
		}
		perfil = db.notas.getPerfil(selectedRamoId) as Perfil;
	});

	const getCurrentPerfil = () => (perfil ?? db.notas.getPerfilRecomendado()) as Perfil;

	const getAutoPerfil = (base: Perfil) => {
		const mediaBase = contexto?.nota_aprobacion ?? base.media_historica;
		const notaMaxima = contexto?.nota_maxima ?? mediaBase;
		const media = Math.min(mediaBase * 1.1, notaMaxima);
		const desviacion = mediaBase * 0.2;
		return {
			media_historica: media,
			desviacion_estandar: desviacion,
			simulaciones: 1000
		};
	};

	const getPerfilDisplay = () => {
		const base = getCurrentPerfil();
		if (base.mode === 'auto') {
			const auto = getAutoPerfil(base);
			return { ...base, ...auto };
		}
		return base;
	};

	let draft = $state<Perfil>(getCurrentPerfil());

	$effect(() => {
		if (modalOpen) {
			draft = { ...getCurrentPerfil() };
		}
	});

	function updateDraft(partial: Partial<Perfil>) {
		draft = { ...draft, ...partial };
	}

	function openModal() {
		if (!selectedRamoId) return;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function applyPerfil(next: Perfil) {
		if (!selectedRamoId) return;
		db.notas.setPerfil(selectedRamoId, next);
		perfil = db.notas.getPerfil(selectedRamoId) as Perfil;
		modalOpen = false;
	}

	function applyPerfilAll(next: Perfil) {
		db.notas.setPerfilForAll(next);
		if (selectedRamoId) {
			perfil = db.notas.getPerfil(selectedRamoId) as Perfil;
		}
		modalOpen = false;
	}
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm {selectedRamoId ? '' : 'hidden'}">
	<!-- Barra del perfil (botón completo) -->
	<button
		onclick={openModal}
		class="w-full px-4 py-4 text-left rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex flex-wrap items-center gap-4"
	>
		<div class="flex items-center gap-2 text-xs text-slate-600">
			<Sparkles size={14} class="text-slate-400" />
			<span class="font-semibold">Perfil estadístico</span>
			<span class="text-[11px] text-slate-400">
				{getCurrentPerfil().mode === 'auto' ? 'Automático' : 'Manual'}
			</span>
		</div>

		<div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
			<div class="flex items-center gap-1">
				<Activity size={14} class="text-slate-400" />
				<span class="font-semibold text-slate-700">
					{getPerfilDisplay().media_historica.toFixed(1)}
				</span>
			</div>
			<div class="flex items-center gap-1">
				<Activity size={14} class="text-slate-400" />
				<span class="font-semibold text-slate-700">
					{getPerfilDisplay().desviacion_estandar.toFixed(1)}
				</span>
			</div>
			<div class="flex items-center gap-1">
				<Dices size={14} class="text-slate-400" />
				<span class="font-semibold text-slate-700">
					{getPerfilDisplay().simulaciones}
				</span>
			</div>
		</div>

		<div class="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-600">
			<Pencil size={14} class="text-slate-400" />
			<span class="max-sm:hidden">Editar perfil</span>
		</div>
	</button>

	{#if modalOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<button
				class="absolute inset-0 bg-black/40 cursor-pointer"
				aria-label="Cerrar"
				onclick={closeModal}
			></button>

			<div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
				<div class="px-6 py-4 border-b border-gray-100">
					<h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
						Editar perfil estadístico
					</h3>
				</div>

				<div class="px-6 py-5 space-y-4">
					<div class="flex gap-2">
						<button
							onclick={() => updateDraft({ mode: 'auto' })}
							class="px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer
							{draft.mode === 'auto'
								? 'border-emerald-500 bg-emerald-50 text-emerald-700'
								: 'border-gray-200 bg-white text-gray-600'}"
						>
							Automático
						</button>
						<button
							onclick={() => updateDraft({ mode: 'manual' })}
							class="px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer
							{draft.mode === 'manual'
								? 'border-emerald-500 bg-emerald-50 text-emerald-700'
								: 'border-gray-200 bg-white text-gray-600'}"
						>
							Manual
						</button>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Media histórica</span>
						<input
							type="number"
							value={draft.mode === 'auto'
								? Number(getAutoPerfil(draft).media_historica.toFixed(2))
								: draft.media_historica}
							disabled={draft.mode === 'auto'}
							oninput={(e) =>
								updateDraft({ media_historica: Number((e.target as HTMLInputElement).value || 0) })}
							class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Desviación estándar</span>
						<input
							type="number"
							value={draft.mode === 'auto'
								? Number(getAutoPerfil(draft).desviacion_estandar.toFixed(2))
								: draft.desviacion_estandar}
							disabled={draft.mode === 'auto'}
							oninput={(e) =>
								updateDraft({
									desviacion_estandar: Number((e.target as HTMLInputElement).value || 0)
								})}
							class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Simulaciones</span>
						<input
							type="number"
							value={draft.simulaciones}
							disabled={draft.mode === 'auto'}
							oninput={(e) =>
								updateDraft({ simulaciones: Number((e.target as HTMLInputElement).value || 0) })}
							class="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>
				</div>

				<div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
					<button
						onclick={closeModal}
						class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
					>
						Cancelar
					</button>
					<button
						onclick={() => applyPerfilAll({ ...draft })}
						class="px-3 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
					>
						Aplicar a Todos
					</button>
					<button
						onclick={() => applyPerfil({ ...draft })}
						class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
					>
						Aplicar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
