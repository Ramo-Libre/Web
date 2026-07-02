<script lang="ts">
	import { Sparkles, Rocket, CalendarPlus } from '@lucide/svelte';

	const actions = [
		{
			icon: Sparkles,
			iconBg: 'bg-primary-400/20 text-primary-100',
			iconHoverBg: 'group-hover:bg-primary-100',
			hoverBg: 'hover:bg-primary-400/5',
			title: 'Vista Previa',
			desc: 'Recorrido rápido por las funcionalidades de la app.',
			id: 'vista-previa'
		},
		{
			icon: Rocket,
			iconBg: 'bg-classes-400/20 text-classes-100',
			iconHoverBg: 'group-hover:bg-classes-100',
			hoverBg: 'hover:bg-classes-400/5',
			title: 'Inicio Guiado',
			desc: 'Deja todo listo para empezar con tu semestre.',
			id: 'inicio-guiado'
		},
		{
			icon: CalendarPlus,
			iconBg: 'bg-calendar-400/20 text-calendar-100',
			iconHoverBg: 'group-hover:bg-calendar-100',
			hoverBg: 'hover:bg-calendar-400/5',
			title: 'Importar Google Calendar',
			desc: 'Agrega tus eventos de Google Calendar.',
			id: 'importar-google'
		}
	];

	function handleClick(id: string) {
		console.log('QuickAction:', id);
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden">
	<div class="flex flex-col divide-y divide-base-400">
		{#each actions as action (action.id)}
			<button
				onclick={() => handleClick(action.id)}
				class="cursor-pointer w-full p-4 sm:p-5 flex items-center justify-between group {action.hoverBg} transition-colors text-left"
			>
				<div class="flex items-center gap-4">
					<div
						class="p-3 {action.iconBg} rounded-xl group-hover:scale-110 transition-transform shrink-0"
					>
						<action.icon class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-content font-bold text-sm lg:text-base leading-tight">{action.title}</h3>
						<p class="text-content/60 text-xs lg:text-sm mt-0.5">{action.desc}</p>
					</div>
				</div>
				<div
					class="p-2 bg-base-200 {action.iconHoverBg} group-hover:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0 0 16 16">
						<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</button>
		{/each}
	</div>
</div>
