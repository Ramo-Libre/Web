<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import {
        GraduationCap,
        CalendarCheck,
        TrendingUp,
        CalendarDays,
        BookMarked,
        Bolt
    } from '@lucide/svelte';

    let { children } = $props();

    // Configuración centralizada de la navegación
    const navItems = [
        { href: '/', label: 'Inicio', icon: GraduationCap, color: 'primary' },
        { href: '/horarios', label: 'Horarios', icon: CalendarCheck, color: 'schedule' },
        { href: '/notas', label: 'Notas', icon: TrendingUp, color: 'grades' },
        { href: '/calendario', label: 'Calendario', icon: CalendarDays, color: 'calendar' },
        { href: '/ramos', label: 'Ramos', icon: BookMarked, color: 'classes' },
        { href: '/configuracion', label: 'Config', icon: Bolt, color: 'config' }
    ];
</script>

<nav class="grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 sm:mb-6 max-sm:pt-2">
    {#each navItems as item (item.href)}
        {@const active = page.url.pathname === item.href}
        {@const Icon = item.icon}

        <div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
            <a
                href={resolve(item.href as '/')}
                data-sveltekit-preload-data="hover"
                class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 shadow-sm border transition-all duration-200 hover:shadow-md block
                {active
                    ? `ring-2 ring-${item.color}-100 bg-${item.color}-400 border-${item.color}-300 text-${item.color}-100`
                    : `border-base-400 text-content hover:border-${item.color}-300 hover:bg-${item.color}-400/50`}"
                aria-current={active ? 'page' : undefined}
            >
                <div class="flex items-center justify-center sm:justify-start gap-3 w-full">
                    <Icon class="w-8 h-8 rounded-md sm:p-1 shrink-0" />
                    <span class="text-lg font-semibold max-sm:hidden truncate">{item.label}</span>
                </div>

                {#if active}
                    <div
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-{item.color}-100 rounded-full"
                    ></div>
                {/if}
            </a>
        </div>
    {/each}
</nav>

<main class="flex-1 overflow-hidden overflow-y-auto max-sm:min-h-0">
    {@render children()}
</main>
