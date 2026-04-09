<script lang="ts">
    import {
        CalendarDays,
        List,
        ArrowRightLeft,
        ChevronsRight,
        KanbanSquare,
        AlertTriangle,
        CheckCircle2,
        BarChart3
    } from '@lucide/svelte';
    import { db } from '$lib/state/index.svelte';

    type ViewMode = 'calendar' | 'list' | 'kanban' | 'timeline';
    type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

    interface Props {
        selectedView: ViewMode;
        onSelectView: (view: ViewMode) => void;
        onOpenEventModal: () => void;
        selectedStatus?: StatusFilter;
        selectedRamo?: string;
        onSelectStatus?: (value: StatusFilter) => void;
        onSelectRamo?: (value: string) => void;
    }

    let {
        selectedView = 'calendar',
        onSelectView,
        onOpenEventModal,
        selectedStatus = 'all',
        selectedRamo = 'all',
        onSelectStatus = () => {},
        onSelectRamo = () => {}
    }: Props = $props();

    const ramos = $derived.by(() => db.ramos.list);
    const todayKey = new Date().toISOString().slice(0, 10);

    const stats = $derived.by(() => {
        let upcoming = 0;
        let overdue = 0;
        let completed = 0;
        let total = 0;

        for (const [, event] of db.events.list) {
            if (selectedRamo !== 'all' && event.ramoId !== selectedRamo) continue;
            total += 1;
            if (event.completed) {
                completed += 1;
                continue;
            }
            if (event.dueDate < todayKey) {
                overdue += 1;
            } else {
                upcoming += 1;
            }
        }

        return { upcoming, overdue, completed, total };
    });
</script>

<div class="space-y-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-base-100">
            <div class="flex items-center justify-between rounded-xl border border-warning-300 bg-warning-400 px-4 py-3 text-warning-100">
                <div>
                    <div class="text-xs uppercase tracking-wider text-warning-100/80 font-bold">Próximos</div>
                    <div class="sm:text-2xl text-md font-semibold">{stats.upcoming}</div>
                </div>
                <ChevronsRight class="sm:w-6 sm:h-6 w-5 h-5 text-warning-100" />
            </div>
        </div>

        <div class="bg-base-100">
            <div class="flex items-center justify-between rounded-xl border border-error-300 bg-error-400 px-4 py-3 text-error-100">
                <div>
                    <div class="text-xs uppercase tracking-wider text-error-100/80 font-bold">Vencidos</div>
                    <div class="sm:text-2xl text-md font-semibold">{stats.overdue}</div>
                </div>
                <AlertTriangle class="sm:w-6 sm:h-6 w-5 h-5 text-error-100" />
            </div>
        </div>

        <div class="bg-base-100">
            <div class="flex items-center justify-between rounded-xl border border-success-300 bg-success-400 px-4 py-3 text-success-100">
                <div>
                    <div class="text-xs uppercase tracking-wider text-success-100/80 font-bold">Completados</div>
                    <div class="sm:text-2xl text-md font-semibold">{stats.completed}</div>
                </div>
                <CheckCircle2 class="sm:w-6 sm:h-6 w-5 h-5 text-success-100" />
            </div>
        </div>

        <div class="bg-base-100">
            <div class="flex items-center justify-between rounded-xl border border-base-400 bg-base-200 px-4 py-3 text-content">
                <div>
                    <div class="text-xs uppercase tracking-wider text-content/60 font-bold">Total</div>
                    <div class="sm:text-2xl text-md font-semibold">{stats.total}</div>
                </div>
                <BarChart3 class="sm:w-6 sm:h-6 w-5 h-5 text-content/50" />
            </div>
        </div>
    </div>

    <div
        class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
                onclick={() => onSelectView('calendar')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto transition-colors ${
                    selectedView === 'calendar'
                        ? 'bg-calendar-100 text-base-100 border-calendar-100 dark:bg-calendar-400 dark:text-calendar-100 dark:border-calendar-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <CalendarDays class="w-4 h-4" />
                Calendario
            </button>
            <button
                onclick={() => onSelectView('list')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto transition-colors ${
                    selectedView === 'list'
                        ? 'bg-calendar-100 text-base-100 border-calendar-100 dark:bg-calendar-400 dark:text-calendar-100 dark:border-calendar-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <List class="w-4 h-4" />
                Lista
            </button>
            <button
                onclick={() => onSelectView('kanban')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto transition-colors ${
                    selectedView === 'kanban'
                        ? 'bg-calendar-100 text-base-100 border-calendar-100 dark:bg-calendar-400 dark:text-calendar-100 dark:border-calendar-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <KanbanSquare class="w-4 h-4" />
                Kanban
            </button>
            <button
                onclick={() => onSelectView('timeline')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto transition-colors ${
                    selectedView === 'timeline'
                        ? 'bg-calendar-100 text-base-100 border-calendar-100 dark:bg-calendar-400 dark:text-calendar-100 dark:border-calendar-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <ArrowRightLeft class="w-4 h-4" />
                Timeline
            </button>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <label
                class="flex items-center gap-2 text-sm text-content/70 w-full justify-between sm:w-auto sm:justify-start"
            >
                <span class="font-medium">Estado:</span>
                <select
                    class="rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-calendar-100"
                    value={selectedStatus}
                    onchange={(e) => onSelectStatus((e.target as HTMLSelectElement).value as StatusFilter)}
                >
                    <option value="all">Todos</option>
                    <option value="upcoming">Próximos</option>
                    <option value="overdue">Vencidos</option>
                    <option value="completed">Completados</option>
                </select>
            </label>
            <label
                class="flex items-center gap-2 text-sm text-content/70 w-full justify-between sm:w-auto sm:justify-start"
            >
                <span class="font-medium">Materia:</span>
                <select
                    class="rounded-lg border border-base-400 bg-base-200 px-3 py-2 text-sm text-content w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-calendar-100"
                    value={selectedRamo}
                    onchange={(e) => onSelectRamo((e.target as HTMLSelectElement).value)}
                >
                    <option value="all">Todas</option>
                    {#each ramos as [id, ramo] (id)}
                        <option value={id}>{ramo.nombre}</option>
                    {/each}
                </select>
            </label>

            <button
                onclick={onOpenEventModal}
                class="cursor-pointer inline-flex items-center justify-center max-sm:mt-2 gap-2 px-4 py-2 rounded-lg bg-calendar-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
                <span class="text-base leading-none">+</span>
                <span>Agregar evento</span>
            </button>
        </div>
    </div>
</div>
