<script lang="ts">
    import type { Estrategia } from '@madmti/gradesolver';
    import { ShieldCheck, ShieldX, Shield, Activity } from '@lucide/svelte';

    interface Props {
        selectedRamoId: string;
        summaryStats?: {
            pendientes: number;
            buenas: number;
            malas: number;
            total: number;
        };
        globalStats?: {
            media: number;
            desviacion: number;
            total: number;
        };
        selectedProbGeneral?: number | null;
        strategies: Estrategia[];
        selectedStrategy: Estrategia | null;
        probabilities: Record<string, number>;
        onSelectStrategy: (strategy: Estrategia) => void;
        isSolving: boolean;
        error: string | null;
        isPossible: boolean | null;
        impossibleReasons: string[];
        approvalStatus?: 'GARANTIZADO' | 'POSIBLE' | 'NO_POSIBLE' | null;
    }

    let {
        selectedRamoId = '',
        summaryStats = { pendientes: 0, buenas: 0, malas: 0, total: 0 },
        globalStats = { media: 0, desviacion: 0, total: 0 },
        selectedProbGeneral = null,
        strategies = [],
        selectedStrategy = null,
        probabilities = {},
        onSelectStrategy,
        isSolving = false,
        error = null,
        isPossible = null,
        impossibleReasons = [],
        approvalStatus = null
    }: Props = $props();

    function labelFor(strategy: Estrategia) {
        switch (strategy) {
            case 'MINIMUM':
                return 'Mínimo';
            case 'BALANCED':
                return 'Balanceado';
            case 'MAX_WEIGHT_FIRST':
                return 'Peso Mayor';
            case 'MIN_WEIGHT_FIRST':
                return 'Peso Menor';
        }
    }

    function probLabel(strategy: Estrategia) {
        const value = probabilities[strategy];
        if (value === undefined) return '--';
        return `${(value * 100).toFixed(1)}%`;
    }

    let bannerLabel = $state('Predicción');
    let bannerTitle = $state('Predicción');
    let bannerSubtitle = $state('Esperando datos para calcular.');
    // Estado inicial: usando Primary para la espera
    let bannerClasses = $state('bg-primary-100 text-base-100');
    let BannerIcon = $state(Shield);

    $effect(() => {
        bannerLabel = 'Predicción';
        if (!selectedRamoId) {
            bannerLabel = 'Resumen';
            bannerTitle = 'General';
            bannerSubtitle = 'Resumen general de tus notas.';
            // Resumen general usa color base
            bannerClasses = 'bg-base-400 text-content';
            BannerIcon = Shield;
            return;
        }
        if (isSolving) {
            bannerTitle = 'Calculando…';
            bannerSubtitle = 'Generando predicciones para el ramo.';
            // Calculando usa Primary
            bannerClasses = 'bg-primary-100 text-base-100';
            BannerIcon = Shield;
            return;
        }

        const status =
            approvalStatus ??
            (isPossible === false ? 'NO_POSIBLE' : isPossible === true ? 'POSIBLE' : null);

        if (status === 'NO_POSIBLE') {
            bannerTitle = 'No es posible';
            bannerSubtitle = 'Las restricciones actuales no se pueden cumplir.';
            // Imposible usa Error
            bannerClasses = 'bg-error-100 text-base-100';
            BannerIcon = ShieldX;
            return;
        }
        if (status === 'GARANTIZADO') {
            bannerTitle = 'Garantizado';
            bannerSubtitle = 'Las notas mínimas aseguran la aprobación.';
            // Garantizado usa Success
            bannerClasses = 'bg-success-100 text-base-100';
            BannerIcon = ShieldCheck;
            return;
        }
        if (status === 'POSIBLE') {
            bannerTitle = 'Es posible aprobar';
            bannerSubtitle = 'Puedes cumplir las restricciones actuales.';
            // Posible usa Grades (ya que es para pasar el ramo)
            bannerClasses = 'bg-warning-100 text-base-100';
            BannerIcon = ShieldCheck;
            return;
        }

        bannerTitle = 'Predicción';
        bannerSubtitle = 'Esperando datos para calcular.';
        bannerClasses = 'bg-primary-100 text-base-100';
        BannerIcon = Shield;
    });
</script>

<div class="bg-base-100 rounded-2xl border border-base-400 shadow-sm overflow-hidden">
    <div class={`relative p-6 sm:p-8 ${bannerClasses} transition-all overflow-hidden`}>
        <div class="text-xs font-semibold uppercase tracking-wider opacity-80">{bannerLabel}</div>
        <div class="text-2xl font-semibold mt-1">{bannerTitle}</div>
        <div class="text-sm opacity-90 mt-1">{bannerSubtitle}</div>
        <BannerIcon
            class="absolute -right-5 -bottom-5 opacity-10 rotate-12 pointer-events-none"
            size={160}
        />
    </div>

    <div class="p-6 space-y-4">
        {#if selectedRamoId}
            {#if selectedProbGeneral !== null}
                <div class="flex items-center gap-2 text-xs text-content/70">
                    <Activity size={14} class="text-content/50" />
                    <span class="font-semibold text-content/80"> Probabilidad general: </span>
                    <span class="font-semibold text-content">
                        {(selectedProbGeneral * 100).toFixed(1)}%
                    </span>
                </div>
            {/if}

            {#if isPossible === false && impossibleReasons.length > 0}
                <div class="text-xs text-error-100">
                    <div class="font-semibold mb-1">Restricciones incumplibles</div>
                    <ul class="list-disc list-inside space-y-1">
                        {#each impossibleReasons as reason (reason)}
                            <li>{reason}</li>
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if isPossible !== false}
                {#if strategies.length > 0}
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {#each strategies as strategy (strategy)}
                            <button
                                onclick={() => onSelectStrategy(strategy)}
                                class="text-left px-3 py-3 rounded-lg border transition-all cursor-pointer
                                {selectedStrategy === strategy
                                    ? 'border-grades-300 bg-grades-400 shadow-sm'
                                    : 'border-base-400 bg-base-100 hover:border-grades-300 hover:bg-grades-400/50'}"
                            >
                                <div class="text-xs text-content/50">Estrategia</div>
                                <div class="font-semibold text-content">{labelFor(strategy)}</div>
                                <div class="text-xs text-content/60 mt-1">Éxito: {probLabel(strategy)}</div>
                            </button>
                        {/each}
                    </div>
                {:else}
                    <p class="text-content/50 text-sm">No hay estrategias disponibles todavía.</p>
                {/if}
            {/if}

            {#if error}
                <div class="text-sm text-error-100 font-medium">{error}</div>
            {/if}

        {:else}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="rounded-lg border border-base-400 bg-base-200 px-4 py-3">
                    <div class="text-xs text-content/70">Pendientes</div>
                    <div class="text-xl font-semibold text-content">{summaryStats?.pendientes ?? 0}</div>
                </div>
                <div class="rounded-lg border border-base-400 bg-base-200 px-4 py-3">
                    <div class="text-xs text-content/70">Buenas notas</div>
                    <div class="text-xl font-semibold text-content">{summaryStats?.buenas ?? 0}</div>
                </div>
                <div class="rounded-lg border border-base-400 bg-base-200 px-4 py-3">
                    <div class="text-xs text-content/70">Malas notas</div>
                    <div class="text-xl font-semibold text-content">{summaryStats?.malas ?? 0}</div>
                </div>
                <div class="rounded-lg border border-base-400 bg-base-200 px-4 py-3">
                    <div class="text-xs text-content/70">Total</div>
                    <div class="text-xl font-semibold text-content">{summaryStats?.total ?? 0}</div>
                </div>
            </div>

            <div class="mt-4 -mb-2 flex items-center justify-center gap-4 text-xs text-content/80">
                <div class="flex items-center gap-1">
                    <Activity size={14} class="text-content/50" />
                    <span class="font-semibold text-content/90">{globalStats?.media?.toFixed(1) ?? '0.0'}</span>
                    <span class="text-[11px] text-content/50">Media</span>
                </div>
                <div class="flex items-center gap-1">
                    <Activity size={14} class="text-content/50" />
                    <span class="font-semibold text-content/90"
                        >{globalStats?.desviacion?.toFixed(1) ?? '0.0'}</span
                    >
                    <span class="text-[11px] text-content/50">Desviación</span>
                </div>
            </div>
        {/if}
    </div>
</div>
