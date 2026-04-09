<script lang="ts">
    import { db } from '$lib/state/index.svelte';
    import { Trash2, Plus, Calendar, CircleCheck, History } from '@lucide/svelte';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';

    let newSemesterName = $state('');
    let deleteConfirmData = $state<{ type: 'index' | 'active'; index?: number; name: string } | null>(
        null
    );

    function handleAddKey(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            db.semestres.add(newSemesterName);
            newSemesterName = '';
        }
    }

    function handleEditKey(e: KeyboardEvent) {
        // @ts-expect-error TS doesn't know about e.currentTarget.blur()
        if (e.key === 'Enter') e.currentTarget.blur();
    }

    function openDeleteConfirm(index: number) {
        const name = db.semestres.list[index];
        deleteConfirmData = { type: 'index', index, name };
    }

    function openDeleteActiveConfirm() {
        if (db.semestres.active === null) return;
        const name = db.semestres.activeName;
        deleteConfirmData = { type: 'active', name };
    }

    function confirmDelete() {
        if (!deleteConfirmData) return;

        if (deleteConfirmData.type === 'index' && deleteConfirmData.index !== undefined) {
            db.deleteSemesterData(deleteConfirmData.name);
        } else if (deleteConfirmData.type === 'active') {
            db.deleteSemesterData(deleteConfirmData.name);
        }

        deleteConfirmData = null;
    }

    function cancelDelete() {
        deleteConfirmData = null;
    }
</script>

<div class="w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
    <div class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div
            class="relative bg-linear-to-r from-primary-100 to-primary-100/90 p-6 sm:p-8 text-base-100 transition-all group/hero"
        >
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 opacity-80">
                    <CircleCheck size={16} class="text-success-100" />
                    <span class="text-xs font-bold uppercase tracking-widest text-base-100">Periodo Actual</span>
                </div>

                {#if db.semestres.active !== null}
                    <button
                        onclick={openDeleteActiveConfirm}
                        class="p-2 rounded-lg bg-base-100/10 text-base-100/60 hover:bg-error-100 hover:text-base-100 transition-all backdrop-blur-sm z-20 cursor-pointer"
                        title="Eliminar semestre actual"
                    >
                        <Trash2 size={18} />
                    </button>
                {/if}
            </div>

            {#if db.semestres.active !== null && db.semestres.list[db.semestres.active] !== undefined}
                <input
                    type="text"
                    value={db.semestres.list[db.semestres.active]}
                    oninput={(e) => db.semestres.update(db.semestres.active!, e.currentTarget.value)}
                    onkeydown={handleEditKey}
                    class="block w-full bg-transparent border-none outline-none text-4xl sm:text-5xl font-bold text-base-100 placeholder-base-100/40 focus:ring-0 p-0 leading-tight relative z-10"
                />
            {:else}
                <div class="text-base-100/50 text-3xl font-bold italic relative z-10">Sin selección</div>
                <p class="text-sm text-base-100/80 mt-2 relative z-10">
                    Selecciona un semestre abajo para activarlo.
                </p>
            {/if}

            <Calendar
                class="absolute -right-5 -bottom-5 text-base-100/10 rotate-12 pointer-events-none"
                size={160}
            />
        </div>

        <div class="bg-base-200 flex flex-col divide-y divide-base-300">
            {#if db.semestres.list.length > 0}
                <div
                    class="px-6 py-3 text-xs font-bold text-content/50 uppercase tracking-wider flex items-center gap-2"
                >
                    <History size={12} />
                    Biblioteca ({db.semestres.list.length - 1}) + 1 actual
                </div>
            {/if}
            <div class="max-h-56 overflow-y-auto">
                {#each db.semestres.list as semestre, index (index)}
                    {#if index !== db.semestres.active}
                        <div
                            class="group flex items-center justify-between px-6 py-3 hover:bg-base-100 transition-colors cursor-pointer"
                            onclick={() => db.semestres.setActive(index)}
                            onkeydown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') db.semestres.setActive(index);
                            }}
                            role="button"
                            tabindex="0"
                        >
                            <div class="flex items-center gap-4 flex-1">
                                <div
                                    class="w-5 h-5 rounded-full border-2 border-base-400 group-hover:border-primary-100 group-hover:scale-110 transition-all shrink-0"
                                ></div>
                                <input
                                    type="text"
                                    value={semestre}
                                    onclick={(e) => e.stopPropagation()}
                                    oninput={(e) => db.semestres.update(index, e.currentTarget.value)}
                                    class="bg-transparent border-none outline-none text-content/80 font-medium group-hover:text-primary-100 focus:ring-0 p-0 flex-1 cursor-text"
                                />
                            </div>

                            <button
                                onclick={(e) => {
                                    e.stopPropagation();
                                    openDeleteConfirm(index);
                                }}
                                class="opacity-0 group-hover:opacity-100 p-2 text-content/30 hover:text-error-100 transition-opacity cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    {/if}
                {/each}
            </div>

            <div class="px-6 py-4 bg-base-100 border-t border-base-300">
                <div
                    class="flex items-center gap-3 text-content/50 focus-within:text-primary-100 transition-colors"
                >
                    <Plus size={20} />
                    <input
                        type="text"
                        bind:value={newSemesterName}
                        onkeydown={handleAddKey}
                        placeholder="Crear nuevo semestre..."
                        class="flex-1 bg-transparent border-none outline-none text-base text-content placeholder-content/40 focus:ring-0 p-0"
                    />
                </div>
            </div>
        </div>

        <AlertDialog.Root
            open={deleteConfirmData !== null}
            onOpenChange={(open) => !open && cancelDelete()}
        >
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>¿Confirmar eliminación?</AlertDialog.Title>
                    <AlertDialog.Description>
                        {#if deleteConfirmData}
                            Esta acción eliminará permanentemente el semestre <strong
                                >"{deleteConfirmData.name}"</strong
                            > y todos los datos asociados a él. Esta acción no se puede deshacer.
                        {/if}
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel onclick={cancelDelete} class="cursor-pointer"
                        >Cancelar</AlertDialog.Cancel
                    >
                    <AlertDialog.Action
                        onclick={confirmDelete}
                        class="bg-error-100 text-base-100 hover:opacity-90 cursor-pointer"
                    >
                        Eliminar
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>
</div>
