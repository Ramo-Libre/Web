<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Sparkles, Rocket, CalendarPlus, X } from '@lucide/svelte';

	const actions = [
		{
			icon: Sparkles,
			iconBg: 'bg-primary-400/20 text-primary-100',
			iconHoverBg: 'group-hover:bg-primary-100 group-active:bg-primary-100',
			hoverBg: 'hover:bg-primary-400/5 active:bg-primary-400/10',
			title: 'Vista Previa',
			desc: 'Recorrido rápido por las funcionalidades de la app.',
			id: 'vista-previa'
		},
		{
			icon: Rocket,
			iconBg: 'bg-classes-400/20 text-classes-100',
			iconHoverBg: 'group-hover:bg-classes-100 group-active:bg-classes-100',
			hoverBg: 'hover:bg-classes-400/5 active:bg-classes-400/10',
			title: 'Inicio Rápido',
			desc: 'Deja todo listo para empezar con tu semestre.',
			id: 'inicio-guiado'
		},
		{
			icon: CalendarPlus,
			iconBg: 'bg-calendar-400/20 text-calendar-100',
			iconHoverBg: 'group-hover:bg-calendar-100 group-active:bg-calendar-100',
			hoverBg: 'hover:bg-calendar-400/5 active:bg-calendar-400/10',
			title: 'Importar Google Calendar',
			desc: 'Agrega tus eventos de Google Calendar.',
			id: 'importar-google'
		}
	];

	let openModal = $state<string | null>(null);

	function handleClick(id: string) {
		openModal = id;
	}

	function getAction(id: string) {
		return actions.find((a) => a.id === id);
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
						class="p-3 {action.iconBg} rounded-xl group-hover:scale-110 group-active:scale-95 transition-transform shrink-0"
					>
						<action.icon class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-content font-bold text-sm lg:text-base leading-tight">{action.title}</h3>
						<p class="text-content/60 text-xs lg:text-sm mt-0.5">{action.desc}</p>
					</div>
				</div>
				<div
					class="p-2 bg-base-200 {action.iconHoverBg} group-hover:text-white group-active:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent group-active:border-transparent"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0 0 16 16">
						<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</button>
		{/each}
	</div>
</div>

{#each actions as action (action.id)}
	{#if openModal === action.id}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<div
			class="fixed inset-0 z-50"
			role="dialog"
			aria-modal="true"
		>
			<button
				class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
				onclick={() => (openModal = null)}
				aria-label="Cerrar"
			></button>
			<!-- Mobile: bottom sheet -->
			<div
				class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 lg:hidden"
				in:fly={{ y: 100, duration: 250 }}
			>
				<div
					class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300"
				>
					<h3 class="text-lg font-bold text-content">{action.title}</h3>
					<button
						onclick={() => (openModal = null)}
						class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
						aria-label="Cerrar"
					>
						<X size={20} />
					</button>
				</div>
				<div class="p-6"></div>
			</div>
			<!-- Desktop: right drawer -->
			<div
				class="absolute top-0 right-0 bottom-0 w-96 max-w-[90vw] bg-base-100 shadow-xl border-l border-base-400 hidden lg:flex lg:flex-col"
				in:fly={{ x: 100, duration: 250 }}
			>
				<div
					class="flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300 shrink-0"
				>
					<h3 class="text-lg font-bold text-content">{action.title}</h3>
					<button
						onclick={() => (openModal = null)}
						class="p-2 rounded-lg text-content/50 hover:text-content hover:bg-base-200 transition-colors cursor-pointer"
						aria-label="Cerrar"
					>
						<X size={20} />
					</button>
				</div>
				<div class="p-6 flex-1 overflow-y-auto"></div>
			</div>
		</div>
	{/if}
{/each}
