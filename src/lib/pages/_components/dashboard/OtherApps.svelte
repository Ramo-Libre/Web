<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import { PUBLIC_TAURI_BUILD } from '$env/static/public';
	import { openExternal } from '$lib/utils/openExternal';

	const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in window;

	const apps = [
		{
			icon: SuiteFavicons.lab,
			name: 'Ramo Libre Lab',
			desc: 'Para probar combinaciones de notas.',
			href: 'https://lab.ramolibre.app',
			id: 'lab'
		},
		{
			icon: SuiteFavicons.hub,
			name: 'Ramo Libre Hub',
			desc: 'Busca en tu comunidad informacion de ramos.',
			href: 'https://hub.ramolibre.app',
			id: 'hub'
		}
	];
</script>

<div class="grid lg:grid-cols-2 gap-3">
	{#each apps as app (app.id)}
		<button
			onclick={() => openExternal(app.href)}
			class="group bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm hover:bg-base-200 transition-colors text-left flex items-center gap-3 w-full cursor-pointer"
		>
			<img src={app.icon} alt={app.name} class="w-8 h-8 shrink-0" />
			<div class="min-w-0 flex-1">
				<h3 class="text-sm lg:text-base font-bold text-content truncate">{app.name}</h3>
				<p class="text-xs text-content/60 mt-0.5 line-clamp-2">{app.desc}</p>
			</div>
			<ExternalLink
				class="w-4 h-4 text-content/30 group-hover:text-primary-100 shrink-0 transition-colors"
			/>
		</button>
	{/each}
</div>
