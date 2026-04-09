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

<div class="bg-base-100 rounded-lg border border-base-400 shadow-sm {selectedRamoId ? '' : 'hidden'}">
    <button
        onclick={openModal}
        class="w-full px-4 py-4 text-left rounded-lg hover:bg-base-200 transition-colors cursor-pointer flex flex-wrap items-center gap-4"
    >
        <div class="flex items-center gap-2 text-xs text-content/70">
            <Sparkles size={14} class="text-grades-100" />
            <span class="font-semibold text-content">Perfil estadístico</span>
            <span class="text-[11px] text-content/50">
                {getCurrentPerfil().mode === 'auto' ? 'Automático' : 'Manual'}
            </span>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-content/70">
            <div class="flex items-center gap-1">
                <Activity size={14} class="text-content/50" />
                <span class="font-semibold text-content/90">
                    {getPerfilDisplay().media_historica.toFixed(1)}
                </span>
            </div>
            <div class="flex items-center gap-1">
                <Activity size={14} class="text-content/50" />
                <span class="font-semibold text-content/90">
                    {getPerfilDisplay().desviacion_estandar.toFixed(1)}
                </span>
            </div>
            <div class="flex items-center gap-1">
                <Dices size={14} class="text-content/50" />
                <span class="font-semibold text-content/90">
                    {getPerfilDisplay().simulaciones}
                </span>
            </div>
        </div>

        <div class="ml-auto flex items-center gap-1 text-xs font-semibold text-content/60 hover:text-primary-100 transition-colors">
            <Pencil size={14} class="text-content/50 group-hover:text-primary-100" />
            <span class="max-sm:hidden">Editar perfil</span>
        </div>
    </button>

    {#if modalOpen}
        <div class="fixed inset-0 z-50 flex items-center justify-center">
            <button
                class="absolute inset-0 bg-black/40 cursor-pointer backdrop-blur-sm"
                aria-label="Cerrar"
                onclick={closeModal}
            ></button>

            <div class="relative w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 m-4">
                <div class="px-6 py-4 border-b border-base-300">
                    <h3 class="text-sm font-semibold text-content uppercase tracking-wide">
                        Editar perfil estadístico
                    </h3>
                </div>

                <div class="px-6 py-5 space-y-4">
                    <div class="flex gap-2">
                        <button
                            onclick={() => updateDraft({ mode: 'auto' })}
                            class="px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors
                            {draft.mode === 'auto'
                                ? 'border-grades-300 bg-grades-400 text-grades-100'
                                : 'border-base-400 bg-base-100 text-content/60 hover:bg-base-200'}"
                        >
                            Automático
                        </button>
                        <button
                            onclick={() => updateDraft({ mode: 'manual' })}
                            class="px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors
                            {draft.mode === 'manual'
                                ? 'border-grades-300 bg-grades-400 text-grades-100'
                                : 'border-base-400 bg-base-100 text-content/60 hover:bg-base-200'}"
                        >
                            Manual
                        </button>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-content/80">Media histórica</span>
                        <input
                            type="number"
                            value={draft.mode === 'auto'
                                ? Number(getAutoPerfil(draft).media_historica.toFixed(2))
                                : draft.media_historica}
                            disabled={draft.mode === 'auto'}
                            oninput={(e) =>
                                updateDraft({ media_historica: Number((e.target as HTMLInputElement).value || 0) })}
                            class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 disabled:opacity-50 disabled:bg-base-200 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-content/80">Desviación estándar</span>
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
                            class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 disabled:opacity-50 disabled:bg-base-200 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-content/80">Simulaciones</span>
                        <input
                            type="number"
                            value={draft.simulaciones}
                            disabled={draft.mode === 'auto'}
                            oninput={(e) =>
                                updateDraft({ simulaciones: Number((e.target as HTMLInputElement).value || 0) })}
                            class="w-24 px-2 py-2 border border-base-400 bg-base-100 rounded-lg text-sm text-center text-content focus:ring-2 focus:ring-grades-100 focus:border-grades-100 disabled:opacity-50 disabled:bg-base-200 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-base-300 flex items-center justify-end gap-2 bg-base-100 rounded-b-2xl">
                    <button
                        onclick={closeModal}
                        class="px-3 py-2 text-sm font-medium text-content/60 hover:text-content cursor-pointer transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onclick={() => applyPerfilAll({ ...draft })}
                        class="px-3 py-2 text-sm font-semibold text-primary-100 hover:opacity-80 cursor-pointer transition-opacity"
                    >
                        Aplicar a Todos
                    </button>
                    <button
                        onclick={() => applyPerfil({ ...draft })}
                        class="px-4 py-2 text-sm font-semibold bg-primary-100 text-base-100 rounded-lg hover:opacity-90 cursor-pointer transition-opacity"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
