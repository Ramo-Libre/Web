<script lang="ts">
    import { db } from '$lib/state/index.svelte';
    import type { Event as CalendarEvent } from '$lib/state/events.svelte';

    type Prefill = Partial<
        Pick<CalendarEvent, 'title' | 'description' | 'dueDate' | 'location' | 'priority' | 'ramoId'>
    > | null;

    interface Props {
        open: boolean;
        onClose: () => void;
        initialEvent?: CalendarEvent | null;
        prefill?: Prefill;
        lockRamo?: boolean;
        onCreated?: (eventId: string) => void;
    }

    let {
        open = false,
        onClose,
        initialEvent = null,
        prefill = null,
        lockRamo = false,
        onCreated
    }: Props = $props();

    const isEditing = $derived.by(() => Boolean(initialEvent));
    const isRamoLocked = $derived.by(() => !isEditing && lockRamo);

    const ramos = $derived.by(() => db.ramos.list);

    let title = $state('');
    let description = $state('');
    let dueDate = $state('');
    let location = $state('');
    let priority = $state<'low' | 'medium' | 'high'>('medium');
    let ramoId = $state('');
    let lastInitKey = $state<string | null>(null);

    function resetForm() {
        title = '';
        description = '';
        dueDate = '';
        location = '';
        priority = 'medium';
        ramoId = '';
    }

    const prefillKey = $derived.by(() => (open ? JSON.stringify(prefill ?? {}) : null));

    $effect(() => {
        if (!open) {
            lastInitKey = null;
            return;
        }

        const nextKey = initialEvent?.id ? `edit:${initialEvent.id}` : `new:${prefillKey ?? ''}`;
        if (lastInitKey === nextKey) return;
        lastInitKey = nextKey;

        if (initialEvent) {
            title = initialEvent.title ?? '';
            description = initialEvent.description ?? '';
            dueDate = initialEvent.dueDate ?? '';
            location = initialEvent.location ?? '';
            priority = initialEvent.priority ?? 'medium';
            ramoId = initialEvent.ramoId ?? '';
        } else {
            resetForm();
            if (prefill) {
                title = prefill.title ?? title;
                description = prefill.description ?? description;
                dueDate = prefill.dueDate ?? dueDate;
                location = prefill.location ?? location;
                priority = prefill.priority ?? priority;
                ramoId = prefill.ramoId ?? ramoId;
            }
        }
    });

    function handleCancel() {
        resetForm();
        onClose();
    }

    function handleSubmit(event: Event) {
        event.preventDefault();
        if (!title.trim() || !dueDate) return;

        if (isEditing && initialEvent) {
            db.events.update(initialEvent.id, {
                id: initialEvent.id,
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate,
                location: location.trim() || undefined,
                priority,
                ramoId: ramoId || undefined,
                completed: initialEvent.completed ?? false
            });
        } else {
            const newId = db.events.add({
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate,
                location: location.trim() || undefined,
                priority,
                ramoId: ramoId || undefined,
                completed: false
            });
            onCreated?.(newId);
        }

        resetForm();
        onClose();
    }
</script>

{#if open}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
        <button class="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm cursor-pointer transition-all" aria-label="Cerrar" onclick={handleCancel}
        ></button>

        <div
            class="relative z-10 w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
        >
            <div class="text-sm font-semibold text-content uppercase tracking-wide">
                {isEditing ? 'Editar evento' : 'Nuevo evento'}
            </div>

            <form class="mt-4 space-y-4" onsubmit={handleSubmit}>
                <div>
                    <label for="event-title" class="text-sm font-medium text-content/80">Título</label>
                    <input
                        id="event-title"
                        type="text"
                        bind:value={title}
                        placeholder="Ej: Control 2"
                        class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content placeholder-content/40 focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 transition-colors"
                        required
                    />
                </div>

                <div>
                    <label for="event-description" class="text-sm font-medium text-content/80"
                        >Descripción</label
                    >
                    <textarea
                        id="event-description"
                        bind:value={description}
                        placeholder="Detalles del evento..."
                        rows="3"
                        class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content placeholder-content/40 focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 transition-colors"
                    ></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="event-date" class="text-sm font-medium text-content/80">Fecha</label>
                        <input
                            id="event-date"
                            type="date"
                            bind:value={dueDate}
                            class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label for="event-location" class="text-sm font-medium text-content/80">Lugar</label>
                        <input
                            id="event-location"
                            type="text"
                            bind:value={location}
                            placeholder="Ej: Sala A"
                            class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content placeholder-content/40 focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 transition-colors"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="event-priority" class="text-sm font-medium text-content/80">Prioridad</label>
                        <select
                            id="event-priority"
                            bind:value={priority}
                            class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 transition-colors cursor-pointer"
                        >
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                    <div>
                        <label for="event-ramo" class="text-sm font-medium text-content/80">Ramo</label>
                        <select
                            id="event-ramo"
                            bind:value={ramoId}
                            disabled={isRamoLocked}
                            class="mt-1 w-full rounded-lg border border-base-400 bg-base-100 px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-calendar-100 focus:border-calendar-100 disabled:bg-base-200 disabled:cursor-not-allowed disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            <option value="">Sin ramo</option>
                            {#each ramos as [id, ramo] (id)}
                                <option value={id}>{ramo.nombre}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        class="px-4 py-2 cursor-pointer rounded-lg border border-base-400 text-content/70 text-sm font-semibold hover:bg-base-200 hover:text-content transition-colors"
                        onclick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 cursor-pointer rounded-lg bg-primary-100 text-base-100 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
