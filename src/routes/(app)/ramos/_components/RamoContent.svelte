<script lang="ts">
	import { db } from '$lib/state/index.svelte.js';
	import { BookOpen, Calculator, Clock, Shield } from '@lucide/svelte';
	import Ecuacion from './tabs/Ecuacion.svelte';
	import Horarios from './tabs/Horarios.svelte';
	import Reglas from './tabs/Reglas.svelte';

	type ComponentType = typeof Ecuacion | typeof Horarios | typeof Reglas;

	interface Props {
		selectedRamoId: string;
	}

	let { selectedRamoId = '' }: Props = $props();

	const selectedRamo = $derived(selectedRamoId ? db.ramos.get(selectedRamoId) : null);

	let activeTab = $state('ecuacion');

	const tabs = [
		{
			id: 'horarios',
			label: 'Horarios',
			icon: Clock,
			component: Horarios as ComponentType
		},
		{
			id: 'ecuacion',
			label: 'Ecuación de Nota',
			icon: Calculator,
			component: Ecuacion as ComponentType
		},
		{
			id: 'reglas',
			label: 'Reglas de Aprobación',
			icon: Shield,
			component: Reglas as ComponentType
		}
	];

	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	const activeComponent = $derived(tabs.find((tab) => tab.id === activeTab)?.component);
</script>

{#if selectedRamo}
	<div class="bg-base-100 border border-base-400 rounded-xl h-full flex flex-col transition-colors">
		<div class="px-6 pt-4">
			<nav class="flex space-x-1 bg-base-200 p-1 rounded-lg border border-base-300">
				{#each tabs as tab (tab.id)}
					<button
						onclick={() => setActiveTab(tab.id)}
						class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex-1 justify-center cursor-pointer
							{activeTab === tab.id
							? 'bg-classes-400 text-classes-100 shadow-sm ring-1 ring-classes-300'
							: 'text-content/60 hover:text-content hover:bg-base-300'}"
					>
						{#if tab.icon}
							{@const IconComponent = tab.icon}
							<IconComponent size={16} />
						{/if}
						<span class="hidden sm:inline">{tab.label}</span>
					</button>
				{/each}
			</nav>
		</div>

		<div class="flex-1 p-6 overflow-y-auto">
			{#if activeComponent}
				{@const Component = activeComponent}
				<Component {selectedRamoId} />
			{/if}
		</div>
	</div>
{:else}
	<div class="bg-base-200 border border-base-400 shadow-inner rounded-xl p-6 h-full transition-colors">
		<div class="text-center text-content/40 h-full flex items-center justify-center">
			<div>
				<BookOpen class="w-12 h-12 mx-auto mb-4 text-content/20" />
				<p class="text-lg font-medium text-content/60">Contenido del ramo</p>
				<p class="text-sm mt-2">Selecciona un ramo para ver su contenido</p>
			</div>
		</div>
	</div>
{/if}
