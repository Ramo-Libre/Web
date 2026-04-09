<script lang="ts">
    import { resolve } from '$app/paths';
    import { db } from '$lib/state/index.svelte';
    import { CalendarCheck, CalendarPlus, CircleCheck, CircleX } from '@lucide/svelte';

    export interface Props {
        selectedRamoId: string;
        predictedNotas?: Record<string, number> | null;
        ramoProbabilities?: Record<string, number | null>;
        ramoStatuses?: Record<string, 'possible' | 'impossible' | 'guaranteed'>;
        onScheduleEvaluacion?: (payload: {
            ramoId: string;
            evaluacionId: string;
            evaluacionName: string;
            ramoName: string;
        }) => void;
    }

    let {
        selectedRamoId = '',
        predictedNotas = null,
        ramoProbabilities = {},
        ramoStatuses = {},
        onScheduleEvaluacion
    }: Props = $props();

    // Obtener las evaluaciones del ramo seleccionado
    const evaluaciones = $derived.by(() => {
        if (!selectedRamoId) {
            return [];
        }
        const data = db.notas.getEvaluacionesData(selectedRamoId);
        return data.list;
    });

    const selectedRamo = $derived.by(() => (selectedRamoId ? db.ramos.get(selectedRamoId) : null));

    function getEvaluacionEventId(evaluacionId: string) {
        if (!selectedRamoId) return null;
        return db.evaluacionEvents.getEventId(selectedRamoId, evaluacionId);
    }

    function handleScheduleEvaluacion(evaluacionId: string, evaluacionName: string) {
        if (!selectedRamoId) return;
        const ramoName = selectedRamo?.nombre ?? 'Asignatura';
        onScheduleEvaluacion?.({ ramoId: selectedRamoId, evaluacionId, evaluacionName, ramoName });
    }

    const ramosSummary = $derived.by(() => {
        return db.ramos.list.map(([id, ramo]) => {
            const { list } = db.notas.getEvaluacionesData(id);
            const contexto = db.notas.getContexto(id);
            const notaAprobacion = contexto?.nota_aprobacion ?? 0;
            const acumulado = list.reduce((acc, [, evaluacion]) => {
                const nota = evaluacion.valor_actual;
                if (nota === null || nota === undefined) return acc;
                return acc + (nota * evaluacion.peso) / 100;
            }, 0);
            return { id, nombre: ramo.nombre, color: ramo.color, acumulado, notaAprobacion };
        });
    });

    function formatScore(value: number) {
        return value.toFixed(1);
    }

    function formatProbability(value: number | null | undefined) {
        if (value === null || value === undefined) return '--';
        return `${(value * 100).toFixed(1)}%`;
    }

    // Estado local para los valores de los inputs
    let localValues = $state<Record<string, string>>({});

    function updateGrade(evaluacionId: string, value: string) {
        if (!selectedRamoId) return;

        const evaluacionesAPI = db.notas.getEvaluaciones(selectedRamoId);
        const evaluacion = evaluacionesAPI.get(evaluacionId);

        if (evaluacion) {
            const num = parseFloat(value);
            const newValorActual = !isNaN(num) ? num : null;

            evaluacionesAPI.update(evaluacionId, {
                ...evaluacion,
                valor_actual: newValorActual
            });
        }
    }

    function handleInput(evaluacionId: string, value: string) {
        // Solo actualizar el estado local mientras escribe
        localValues[evaluacionId] = value;
    }

    function handleSave(evaluacionId: string) {
        // Guardar cuando pierde foco o presiona Enter
        const value = localValues[evaluacionId] || '';
        updateGrade(evaluacionId, value);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const target = event.target as HTMLInputElement;
            target.blur(); // Esto activará el blur que guardará
        }
    }

    // Inicializar valores locales cuando cambien las evaluaciones
    $effect(() => {
        const newLocalValues: Record<string, string> = {};
        evaluaciones.forEach(([id, evaluacion]) => {
            newLocalValues[id] = evaluacion.valor_actual?.toString() || '';
        });
        localValues = newLocalValues;
    });
</script>

{#if selectedRamoId}
    <div class="space-y-3">
        {#each evaluaciones as [id, evaluacion] (id)}
            {@const eventId = getEvaluacionEventId(id)}
            <div
                class="flex items-center justify-between p-3 bg-base-100 border border-base-400 rounded-lg hover:bg-base-200 transition-colors"
            >
                <div>
                    <div class="font-medium text-content">{evaluacion.id}</div>
                    <div class="text-sm text-content/60">{evaluacion.peso}%</div>
                </div>

                <div class="flex items-center gap-2">
                    {#if eventId}
                        <a
                            href={resolve(`/calendario#${eventId}` as '/calendario')}
                            class="inline-flex items-center gap-1 rounded-md border border-calendar-300 bg-calendar-400 px-2 py-1 text-[11px] font-semibold text-calendar-100 hover:bg-calendar-300 transition-colors cursor-pointer"
                        >
                            <CalendarCheck class="w-3.5 h-3.5" />
                            Agendado
                        </a>
                    {:else}
                        <button
                            type="button"
                            onclick={() => handleScheduleEvaluacion(id, evaluacion.id)}
                            class="inline-flex items-center gap-1 rounded-md border border-base-400 bg-base-100 px-2 py-1 text-[11px] font-semibold text-content/70 hover:bg-base-200 transition-colors cursor-pointer"
                        >
                            <CalendarPlus class="w-3.5 h-3.5" />
                            Agendar
                        </button>
                    {/if}

                    <input
                        type="number"
                        value={localValues[id] || ''}
                        placeholder={evaluacion.valor_actual === null &&
                        predictedNotas?.[evaluacion.id] !== undefined
                            ? predictedNotas[evaluacion.id].toFixed(1)
                            : '0.0'}
                        oninput={(e) => {
                            const target = e.target as HTMLInputElement;
                            handleInput(id, target.value);
                        }}
                        onblur={() => handleSave(id)}
                        onkeydown={(e) => handleKeydown(e)}
                        class="w-16 h-10 text-center font-bold border rounded-md text-content transition-colors focus:outline-none focus:ring-2 focus:ring-grades-100 {evaluacion.valor_actual !==
                        null
                            ? 'border-grades-300 bg-grades-400'
                            : 'border-dashed border-base-400 bg-base-100'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
            </div>
        {:else}
            <div class="text-center py-8">
                <div class="text-content/30 mb-4">
                    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                    </svg>
                </div>
                <p class="text-content/50">No hay evaluaciones configuradas</p>
            </div>
        {/each}
    </div>
{:else}
    <div class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {#each ramosSummary as ramo (ramo.id)}
                <a
                    href={`/notas#${ramo.id}`}
                    class="flex items-center gap-3 p-3 border rounded-lg transition-colors {ramoStatuses[
                        ramo.id
                    ] === 'guaranteed'
                        ? 'bg-success-400 border-success-300 hover:bg-success-300'
                        : ramoStatuses[ramo.id] === 'impossible'
                            ? 'bg-error-400 border-error-300 hover:bg-error-300'
                            : 'bg-base-100 border-base-400 hover:bg-base-200'}"
                >
                    <div
                        class="h-10 w-10 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-sm"
                        style="background-color: {ramo.color};"
                    >
                        {ramo.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <div class="font-medium text-content truncate">{ramo.nombre}</div>
                        <div class="text-xs text-content/60">
                            {formatScore(ramo.acumulado)}/{formatScore(ramo.notaAprobacion)}
                        </div>
                    </div>
                    <div class="ml-auto text-right">
                        {#if ramoStatuses[ramo.id] === 'guaranteed'}
                            <CircleCheck class="text-success-100 ml-auto" size={18} />
                        {:else if ramoStatuses[ramo.id] === 'impossible'}
                            <CircleX class="text-error-100 ml-auto" size={18} />
                        {:else}
                            <div class="text-[10px] text-content/50">Prob.</div>
                            <div class="text-sm font-semibold text-content">
                                {formatProbability(ramoProbabilities[ramo.id])}
                            </div>
                        {/if}
                    </div>
                </a>
            {:else}
                <div class="text-center text-content/50 py-6 sm:col-span-2 lg:col-span-3">No hay ramos registrados.</div>
            {/each}
        </div>
    </div>
{/if}
