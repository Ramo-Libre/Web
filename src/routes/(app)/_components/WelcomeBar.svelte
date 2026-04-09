<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { GithubIcon, RefreshCw } from '@lucide/svelte';

    let userName = 'Usuario';
    let userMail = 'usuario@ramolibre.cl';
    let syncStatus = 'Synced';

    const provider = 'Github';

    // Mapeamos los proveedores a la escala semántica y al token primary
    const providerColors = {
        // Github se adapta al tema base (claro/oscuro)
        Github: 'bg-base-200 text-content border border-base-400 hover:bg-base-300',
        // Google usa la escala de error (por el tono rojo)
        Google: 'bg-error-400 text-error-100 border border-error-300 hover:bg-error-300',
        // Facebook usa la escala primaria (por el tono azul/morado)
        Facebook: 'bg-primary-400 text-primary-100 border border-primary-300 hover:bg-primary-300'
    };

    const providerIcons = {
        Github: GithubIcon,
        Google: null,
        Facebook: null
    };

    // Mapeamos los estados de sincronización a los indicadores
    const syncStatusColors = {
        Synced: 'bg-success-400 text-success-100 border border-success-300 hover:bg-success-300',
        Syncing: 'bg-warning-400 text-warning-100 border border-warning-300 hover:bg-warning-300',
        Error: 'bg-error-400 text-error-100 border border-error-300 hover:bg-error-300'
    };

    function handleProviderClick() {
        console.log('Provider badge clicked');
    }

    function handleSyncClick() {
        goto(resolve('/configuracion#sync' as '/configuracion'));
    }
</script>

<div
    class="bg-base-100 rounded-lg border border-base-400 p-6 shadow-sm flex items-center justify-between"
>
    <div>
        <h1 class="text-xl sm:text-2xl font-bold text-content">Hola, {userName} 👋</h1>
        <p class="text-content/50 text-sm">Aquí está tu resumen de hoy.</p>
    </div>
    <div class="flex items-center space-x-3 justify-end">
        <div class="text-sm text-right">
            <div class="font-medium text-content">{userMail}</div>
            <div class="text-content/50 flex items-center justify-end space-x-1 mt-1">
                <button
                    onclick={handleSyncClick}
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 {syncStatusColors[
                        syncStatus as keyof typeof syncStatusColors
                    ]} gap-1"
                >
                    <RefreshCw size={12} />
                    {syncStatus}
                </button>
                <button
                    onclick={handleProviderClick}
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 {providerColors[
                        provider as keyof typeof providerColors
                    ]} gap-1"
                >
                    {#if providerIcons[provider as keyof typeof providerIcons]}
                        <svelte:component this={providerIcons[provider as keyof typeof providerIcons]} size={12} />
                    {/if}
                    <span>{provider}</span>
                </button>
            </div>
        </div>

        <div
            class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-base-100 font-semibold shadow-sm"
        >
            {userName.charAt(0).toUpperCase()}
        </div>
    </div>
</div>
