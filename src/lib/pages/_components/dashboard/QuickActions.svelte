<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Sparkles, Rocket, CalendarPlus, Bot, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { getNow } from '$lib/utils/date';
	import WizardSemestre from './WizardSemestre.svelte';
	import VistaPreviaWizard from './VistaPreviaWizard.svelte';
	import AIContextDrawer from './AIContextDrawer.svelte';
	import ICSImportModal from './ICSImportModal.svelte';

	const now = getNow();
	const year = now.getFullYear();
	const semestreNum = now.getMonth() < 6 ? 1 : 2;
	const recomendado = `${year}-${semestreNum}`;

	const actions = [
		{
			icon: Sparkles,
			iconBg: 'bg-primary-400/20 text-primary-100',
			iconHoverBg: 'group-hover:bg-primary-100 group-active:bg-primary-100',
			hoverBg: 'hover:bg-primary-400/5 active:bg-primary-400/10',
			title: 'Vista Previa',
			desc: 'Recorrido rápido por las funcionalidades de la app.',
			id: 'vista-previa',
			disabled: false
		},
		{
			icon: Rocket,
			iconBg: 'bg-classes-400/20 text-classes-100',
			iconHoverBg: 'group-hover:bg-classes-100 group-active:bg-classes-100',
			hoverBg: 'hover:bg-classes-400/5 active:bg-classes-400/10',
			title: 'Inicia un semestre',
			desc: 'Deja todo listo para empezar con tu semestre.',
			id: 'inicia-semestre',
			disabled: false
		},
		{
			icon: CalendarPlus,
			iconBg: 'bg-calendar-400/20 text-calendar-100',
			iconHoverBg: 'group-hover:bg-calendar-100 group-active:bg-calendar-100',
			hoverBg: 'hover:bg-calendar-400/5 active:bg-calendar-400/10',
			title: 'Importar Google Calendar',
			desc: 'Importa eventos desde un archivo .ics.',
			id: 'importar-google',
			disabled: false
		},
		{
			icon: Bot,
			iconBg: 'bg-grades-400/20 text-grades-100',
			iconHoverBg: 'group-hover:bg-grades-100 group-active:bg-grades-100',
			hoverBg: 'hover:bg-grades-400/5 active:bg-grades-400/10',
			title: 'Ayuda con IA',
			desc: 'Contextos para que una IA te explique cómo usar la app.',
			id: 'contexto-ia',
			disabled: false
		}
	];

	let openModal = $state<string | null>(null);
	let wizardName = $state('');
	let wizardRamos = $state<{ name: string; color: string }[]>([]);
	let wizardStep = $state(1);
	let previewStep = $state(1);

	function handleClick(id: string) {
		if (id === 'vista-previa') {
			previewStep = 1;
		}
		if (id === 'inicia-semestre') {
			wizardName = '';
			wizardRamos = [];
			wizardStep = 1;
		}
		openModal = id;
	}

	function handleFinish() {
		const name = wizardName.trim() || recomendado;
		semestre.add(name);
		for (const r of wizardRamos) {
			if (r.name.trim()) semestre.ramos.add({ name: r.name.trim(), color: r.color });
		}
		openModal = null;
		goto('/ramos#semesters');
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden">
	<div class="flex flex-col divide-y divide-base-400">
		{#each actions as action (action.id)}
			<button
				onclick={() => !action.disabled && handleClick(action.id)}
				disabled={action.disabled}
				class="cursor-pointer w-full p-4 sm:p-5 flex items-center justify-between group {action.hoverBg} transition-colors text-left {action.disabled
					? 'cursor-not-allowed opacity-50'
					: ''}"
			>
				<div class="flex items-center gap-4">
					<div
						class="p-3 {action.iconBg} rounded-xl group-hover:scale-110 group-active:scale-95 transition-transform shrink-0"
					>
						<action.icon class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-content font-bold text-sm lg:text-base leading-tight">
							{action.title}
						</h3>
						<p class="text-content/60 text-xs lg:text-sm mt-0.5">{action.desc}</p>
					</div>
				</div>
				<div
					class="p-2 bg-base-200 {action.iconHoverBg} group-hover:text-white group-active:text-white text-content rounded-lg transition-all border border-base-400 group-hover:border-transparent group-active:border-transparent"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0 0 16 16">
						<path
							d="M6 3l5 5-5 5"
							stroke="currentColor"
							stroke-width="2"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
			</button>
		{/each}
	</div>
</div>

{#each actions as action (action.id)}
	{#if openModal === action.id}
		<div class="fixed inset-0 z-50" role="dialog" aria-modal="true">
			<button
				class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
				onclick={() => (openModal = null)}
				aria-label="Cerrar"
			></button>
			<!-- Mobile: bottom sheet -->
			<div
				class="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl shadow-xl border border-base-400 lg:hidden {action.id ===
					'inicia-semestre' ||
				action.id === 'vista-previa' ||
				action.id === 'importar-google' ||
				action.id === 'contexto-ia'
					? 'max-h-[85vh] flex flex-col'
					: ''}"
				in:fly={{ y: 100, duration: 250 }}
			>
				<div
					class="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-base-300 shrink-0"
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
				<div
					class="p-6 {action.id === 'inicia-semestre' ||
					action.id === 'vista-previa' ||
					action.id === 'importar-google' ||
					action.id === 'contexto-ia'
						? 'flex-1 overflow-y-auto'
						: ''}"
				>
					{#if action.id === 'inicia-semestre'}
						<WizardSemestre
							bind:semesterName={wizardName}
							bind:ramosList={wizardRamos}
							bind:step={wizardStep}
							onNext={() => wizardStep++}
							onPrev={() => wizardStep--}
							onFinish={handleFinish}
						/>
					{:else if action.id === 'vista-previa'}
						<VistaPreviaWizard
							bind:step={previewStep}
							onNext={() => previewStep++}
							onPrev={() => previewStep--}
							onFinish={() => (openModal = null)}
						/>
					{:else if action.id === 'importar-google'}
						<ICSImportModal onClose={() => (openModal = null)} />
					{:else if action.id === 'contexto-ia'}
						<AIContextDrawer />
					{/if}
				</div>
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
				<div class="p-6 flex-1 overflow-y-auto">
					{#if action.id === 'inicia-semestre'}
						<WizardSemestre
							bind:semesterName={wizardName}
							bind:ramosList={wizardRamos}
							bind:step={wizardStep}
							onNext={() => wizardStep++}
							onPrev={() => wizardStep--}
							onFinish={handleFinish}
						/>
					{:else if action.id === 'vista-previa'}
						<VistaPreviaWizard
							bind:step={previewStep}
							onNext={() => previewStep++}
							onPrev={() => previewStep--}
							onFinish={() => (openModal = null)}
						/>
					{:else if action.id === 'importar-google'}
						<ICSImportModal onClose={() => (openModal = null)} />
					{:else if action.id === 'contexto-ia'}
						<AIContextDrawer />
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/each}
