<script lang="ts">
    import { Table2, List, ClockFading, GalleryHorizontalEnd } from '@lucide/svelte';
    type ViewMode = 'table' | 'list' | 'clock' | 'gallery';

    interface Props {
        selectedView: ViewMode;
        onSelectView: (view: ViewMode) => void;
    }

    let { selectedView = 'table', onSelectView = () => {} }: Props = $props();
</script>

<div class="space-y-4">
    <div
        class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-sm"
    >
        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
                onclick={() => onSelectView('table')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full sm:w-auto ${
                    selectedView === 'table'
                        ? 'bg-schedule-100 text-base-100 border-schedule-100 dark:bg-schedule-400 dark:text-schedule-100 dark:border-schedule-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <Table2 class="w-4 h-4" />
                Tabla
            </button>
            <button
                onclick={() => onSelectView('list')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full sm:w-auto ${
                    selectedView === 'list'
                        ? 'bg-schedule-100 text-base-100 border-schedule-100 dark:bg-schedule-400 dark:text-schedule-100 dark:border-schedule-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <List class="w-4 h-4" />
                Lista
            </button>
            <button
                onclick={() => onSelectView('clock')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full sm:w-auto ${
                    selectedView === 'clock'
                        ? 'bg-schedule-100 text-base-100 border-schedule-100 dark:bg-schedule-400 dark:text-schedule-100 dark:border-schedule-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <ClockFading class="w-4 h-4" />
                Reloj
            </button>
            <button
                onclick={() => onSelectView('gallery')}
                class={`cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors w-full sm:w-auto ${
                    selectedView === 'gallery'
                        ? 'bg-schedule-100 text-base-100 border-schedule-100 dark:bg-schedule-400 dark:text-schedule-100 dark:border-schedule-300'
                        : 'border-base-400 text-content/70 hover:bg-base-200 hover:text-content'
                }`}
            >
                <GalleryHorizontalEnd class="w-4 h-4" />
                Galería
            </button>
        </div>

        </div>
</div>
