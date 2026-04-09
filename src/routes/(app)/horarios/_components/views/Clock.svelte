<script lang="ts">
    import { db } from '$lib/state/index.svelte';
    import type { HorarioDay } from '$lib/state/horarios.svelte';
    import { MapPin, Clock, BookOpen, CheckCircle2, Coffee } from '@lucide/svelte';

    // --- MAPAS Y CONSTANTES ---
    const dayMap: Record<number, HorarioDay> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

    // --- ESTADO DEL RELOJ (Actualización cada segundo) ---
    let now = $state(new Date());
    $effect(() => {
        const interval = setInterval(() => (now = new Date()), 1000);
        return () => clearInterval(interval);
    });

    const currentDayId = $derived(dayMap[now.getDay()]);
    const currentMin = $derived(now.getHours() * 60 + now.getMinutes());
    const currentSec = $derived(now.getSeconds());

    const toMinutes = (t: string) => {
        const [hh, mm] = t.split(':').map(Number);
        return hh * 60 + mm;
    };

    // --- PROCESAMIENTO DE CLASES DEL DÍA ---
    const todayClasses = $derived.by(() => {
        const allHorarios = db.horarios.list.map(([, h]) => h);
        const ramosMap = db.ramos.map;

        return allHorarios
            .filter((h) => h.day === currentDayId)
            .map((h) => {
                const ramo = ramosMap.get(h.ramoId ?? '');
                return {
                    ...h,
                    ramoNombre: ramo?.nombre ?? 'Sin Ramo',
                    color: ramo?.color ?? '#cbd5e1',
                    startMin: toMinutes(h.start),
                    endMin: toMinutes(h.end)
                };
            })
            .sort((a, b) => a.startMin - b.startMin);
    });

    // Detectar estados
    const currentClass = $derived(
        todayClasses.find((c) => currentMin >= c.startMin && currentMin < c.endMin)
    );
    const nextClasses = $derived(todayClasses.filter((c) => c.startMin > currentMin));
    const nextClass = $derived(nextClasses.length > 0 ? nextClasses[0] : null);
    const isDayFinished = $derived(
        todayClasses.length > 0 &&
            !currentClass &&
            !nextClass &&
            currentMin >= todayClasses[todayClasses.length - 1].endMin
    );

    // --- CÁLCULOS DEL RELOJ ---
    const CIRCUMFERENCE = 2 * Math.PI * 120; // Radio 120

    const progressPct = $derived.by(() => {
        if (currentClass) {
            const totalSecs = (currentClass.endMin - currentClass.startMin) * 60;
            const elapsedSecs = (currentMin - currentClass.startMin) * 60 + currentSec;
            return Math.min(100, Math.max(0, (elapsedSecs / totalSecs) * 100));
        }
        return 0; // Si no hay clase, anillo vacío
    });

    const countdownStr = $derived.by(() => {
        let remainingMins = 0;
        let remainingSecs = 59 - currentSec;

        if (currentClass) {
            remainingMins = currentClass.endMin - currentMin - 1;
        } else if (nextClass) {
            remainingMins = nextClass.startMin - currentMin - 1;
        } else {
            return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }

        const hrs = Math.floor(remainingMins / 60);
        const mins = remainingMins % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${hrs > 0 ? pad(hrs) + ':' : ''}${pad(mins)}:${pad(remainingSecs)}`;
    });

    const primaryColor = $derived(
        currentClass ? currentClass.color : nextClass ? nextClass.color : '#cbd5e1'
    );
</script>

<div
    class="bg-base-100 rounded-2xl border border-base-400 shadow-inner flex flex-col overflow-hidden relative isolate"
>
    <div
        class="absolute inset-0 opacity-10 transition-colors duration-1000 -z-10"
        style="background: radial-gradient(circle at center, {primaryColor} 0%, transparent 100%);"
    ></div>

    <div class="p-6 flex-1 flex flex-col items-center justify-center">
        <div class="relative w-[280px] h-[280px] sm:w-[320px] sm:h-80 mb-8 shrink-0">
            <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 256 256">
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    stroke-width="6"
                    fill="none"
                    class="text-base-400 opacity-50"
                />
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke={primaryColor}
                    stroke-width="8"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray={CIRCUMFERENCE}
                    stroke-dashoffset={CIRCUMFERENCE - (CIRCUMFERENCE * progressPct) / 100}
                    class="transition-all duration-1000 ease-linear"
                    style="filter: drop-shadow(0 0 8px {primaryColor}40);"
                />
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                {#if currentClass}
                    <span
                        class="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-content/50 mb-2 flex items-center gap-1.5"
                    >
                        <div
                            class="w-2 h-2 rounded-full animate-pulse"
                            style="background-color: {primaryColor}"
                        ></div>
                        Termina en
                    </span>
                    <h2
                        class="text-4xl sm:text-5xl font-black text-content tabular-nums tracking-tight mb-2"
                    >
                        {countdownStr}
                    </h2>
                    <p class="font-bold text-sm sm:text-base truncate w-full" style="color: {primaryColor}">
                        {currentClass.ramoNombre}
                    </p>
                    {#if currentClass.location}
                        <div class="flex items-center justify-center gap-1 text-xs text-content/60 font-medium mt-1 w-full">
                            <MapPin class="w-3.5 h-3.5 shrink-0" />
                            <span class="truncate">{currentClass.location}</span>
                        </div>
                    {/if}
                {:else if nextClass}
                    <span
                        class="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-content/50 mb-2"
                    >
                        Próxima en
                    </span>
                    <h2
                        class="text-4xl sm:text-5xl font-black text-content tabular-nums tracking-tight mb-2 opacity-80"
                    >
                        {countdownStr}
                    </h2>
                    <p class="font-bold text-sm sm:text-base text-content/70 truncate w-full">
                        {nextClass.ramoNombre}
                    </p>
                    <div
                        class="flex items-center justify-center gap-3 text-xs text-content/60 font-medium mt-1"
                    >
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3 shrink-0" /> {nextClass.start}</span>
                        {#if nextClass.location}
                            <span class="flex items-center gap-1"
                                ><MapPin class="w-3 h-3 shrink-0" /> <span class="truncate">{nextClass.location}</span></span
                            >
                        {/if}
                    </div>
                {:else if isDayFinished}
                    <CheckCircle2 class="w-10 h-10 text-success-100 mb-3" />
                    <h2 class="text-3xl sm:text-4xl font-black text-content tracking-tight mb-1">
                        {countdownStr}
                    </h2>
                    <p class="text-sm font-bold text-content/60 uppercase tracking-wide">Día completado</p>
                {:else}
                    <Coffee class="w-10 h-10 text-content/30 mb-3" />
                    <h2 class="text-3xl sm:text-4xl font-black text-content tracking-tight mb-1">
                        {countdownStr}
                    </h2>
                    <p class="text-sm font-bold text-content/60 uppercase tracking-wide">Día libre</p>
                {/if}
            </div>
        </div>

        <div class="w-full max-w-sm mt-4">
            {#if currentClass}
                <div class="text-center mb-4">
                    <span
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200 border border-base-300 text-xs font-bold text-content/70 shadow-sm"
                    >
                        <BookOpen class="w-3.5 h-3.5" /> En clase ahora
                    </span>
                </div>
            {/if}

            {#if nextClasses.length > 0}
                <div class="space-y-2.5">
                    {#each nextClasses.slice(0, 3) as sch, i (i)}
                        <div
                            class="flex items-center gap-4 p-3 rounded-xl bg-base-200 border border-base-400 shadow-sm transition-transform hover:scale-[1.02]"
                        >
                            <div class="flex flex-col items-center justify-center w-12 shrink-0">
                                <span class="text-xs font-black text-content/90">{sch.start}</span>
                            </div>

                            <div
                                class="w-1 h-8 rounded-full shrink-0"
                                style="background-color: {sch.color}"
                            ></div>

                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-content truncate">{sch.ramoNombre}</h4>
                                <div
                                    class="flex items-center gap-2 text-[10px] text-content/60 font-medium uppercase tracking-wider"
                                >
                                    <span>{sch.end}</span>
                                    {#if sch.location}
                                        <span>•</span>
                                        <span class="truncate">{sch.location}</span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}

                    {#if nextClasses.length > 3}
                        <div class="text-center pt-2">
                            <span class="text-xs font-bold text-content/50"
                                >+{nextClasses.length - 3} clases más hoy</span
                            >
                        </div>
                    {/if}
                </div>
            {:else if currentClass}
                <div class="text-center text-sm font-medium text-content/50 mt-6">
                    Esta es tu última clase del día 🎉
                </div>
            {/if}
        </div>
    </div>
</div>
