<script lang="ts">
	import {
		GraduationCap,
		CalendarCheck,
		TrendingUp,
		CalendarDays,
		BookMarked,
		Bolt,
		PanelLeftClose,
		PanelLeftOpen,
		Ellipsis,
		X,
		Bone
	} from '@lucide/svelte';
	import type { LucideIcon } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { ramoDrawer } from '$lib/features/ramosDrawer.svelte';
	import RamoDrawer from '$lib/pages/RamoDrawer.svelte';
	import { PUBLIC_SHOW_DEV_TOOLS } from '$env/static/public';
	import { onMount } from 'svelte';

	const showDevTools = PUBLIC_SHOW_DEV_TOOLS === 'true';
	let { children } = $props();

	type Section = {
		id: string;
		label: string;
		color: string;
		icon: LucideIcon;
		path: string;
	};

	const prefix = '/new';

	const sections: Section[] = [
		{
			id: 'ramolibre',
			label: 'RamoLibre',
			color: 'var(--color-primary-100)',
			icon: GraduationCap,
			path: `${prefix}/`
		},
		{
			id: 'horarios',
			label: 'Horarios',
			color: 'var(--color-schedule-100)',
			icon: CalendarCheck,
			path: `${prefix}/horarios/`
		},
		{
			id: 'notas',
			label: 'Notas',
			color: 'var(--color-grades-100)',
			icon: TrendingUp,
			path: `${prefix}/notas/`
		},
		{
			id: 'calendario',
			label: 'Calendario',
			color: 'var(--color-calendar-100)',
			icon: CalendarDays,
			path: `${prefix}/calendario/`
		},
		{
			id: 'ramos',
			label: 'Ramos',
			color: 'var(--color-classes-100)',
			icon: BookMarked,
			path: `${prefix}/ramos/`
		},
		{
			id: 'config',
			label: 'Config',
			color: 'var(--color-config-100)',
			icon: Bolt,
			path: `${prefix}/configuracion/`
		},
		...(showDevTools
			? [
					{
						id: 'dev-tools',
						label: 'Dev Tools',
						color: 'var(--color-config-100)',
						icon: Bone,
						path: `${prefix}/dev-tools/`
					}
				]
			: [])
	];

	const bottomNavIds = ['ramolibre', 'horarios', 'notas', 'calendario'];
	const sheetIds = ['ramos', 'config'];

	const bottomNav = sections.filter((s) => bottomNavIds.includes(s.id));
	const sheetSections = sections.filter((s) => sheetIds.includes(s.id));

	let sidebarCollapsed = $state(false);
	let sheetOpen = $state(false);

	function isActive(path: string) {
		return page.url.pathname === path;
	}

	const sheetActive = $derived(
		sheetSections.find((s) => isActive(s.path) || (s.id === 'ramos' && page.url.pathname.startsWith(`${prefix}/ramos/`)))
	);

	function navigate(path: string) {
		goto(path);
		sheetOpen = false;
	}

	onMount(() => {
		semestre.preferences.applyTheme();
	});
</script>

<div class="flex h-dvh overflow-hidden relative text-content">
	<!-- ── SIDEBAR (desktop) ── -->
	<aside
		class="hidden sm:flex flex-col bg-base-200 border-r border-base-400 overflow-hidden transition-all duration-200 ease-linear {sidebarCollapsed
			? 'w-[60px] min-w-[60px]'
			: 'w-[220px] min-w-[220px]'}"
	>
		<div
			class="flex items-center {sidebarCollapsed
				? 'justify-center p-3 pb-1'
				: 'justify-between p-3 pb-1'}"
		>
			{#if !sidebarCollapsed}
				<span class="text-xs font-semibold tracking-widest uppercase text-content/35"
					>Secciones</span
				>
			{/if}
			<button
				class="bg-transparent border-0 cursor-pointer text-content/50 p-1 rounded-md hover:bg-base-300"
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
			>
				{#if sidebarCollapsed}
					<PanelLeftOpen class="w-5 h-5" />
				{:else}
					<PanelLeftClose class="w-5 h-5" />
				{/if}
			</button>
		</div>

		<nav class="flex-1 flex flex-col gap-0.5 p-1 px-2">
			{#each sections.filter((s) => s.id !== 'config') as section (section.id)}
				{@const active = isActive(section.path) || (section.id === 'ramos' && page.url.pathname.startsWith(`${prefix}/ramos/`))}
				<button
					class="flex items-center rounded-[10px] border-0 bg-transparent cursor-pointer text-content/60 whitespace-nowrap w-full relative transition-[background,opacity] duration-100 hover:bg-base-300 hover:opacity-90 {sidebarCollapsed
						? 'justify-center p-2 px-0'
						: 'gap-2.5 p-2 px-2.5 text-left'} {active ? 'opacity-100' : ''}"
					onclick={() => navigate(section.path)}
				>
					{#if active}
						<span
							class="absolute -left-2 w-[3px] h-[18px] rounded-r-[3px]"
							style="background: {section.color}"
						></span>
					{/if}
					<span
						class="inline-flex items-center justify-center w-7 h-7 rounded-[7px] text-[10px] font-bold text-white shrink-0"
						style="background: {section.color}"
					>
						<section.icon size="16" />
					</span>
					{#if !sidebarCollapsed}
						<span class="text-sm font-medium">{section.label}</span>
					{/if}
				</button>
			{/each}

			{#if semestre.ramos.list.length > 0}
				{#if !sidebarCollapsed}
					<span class="text-xs font-semibold tracking-widest uppercase text-content/35 px-2.5 pt-3 pb-1"
						>Tus Ramos</span
					>
				{/if}
				{#each semestre.ramos.list as [id, ramo] (id)}
					<button
						class="flex items-center rounded-[10px] border-0 bg-transparent cursor-pointer text-content/60 whitespace-nowrap w-full relative transition-[background,opacity] duration-100 hover:bg-base-300 hover:opacity-90 {sidebarCollapsed
							? 'justify-center p-2 px-0'
							: 'gap-2.5 p-2 px-2.5 text-left'} {ramoDrawer.id === id ? 'opacity-100' : ''}"
						onclick={() => ramoDrawer.open(id)}
					>
						{#if ramoDrawer.id === id}
							<span
								class="absolute -left-2 w-[3px] h-[18px] rounded-r-[3px]"
								style="background: {ramo.color}"
							></span>
						{/if}
						<span
							class="w-2.5 h-2.5 rounded-full shrink-0"
							style="background: {ramo.color}"
						></span>
						{#if !sidebarCollapsed}
							<span class="text-sm font-medium">{ramo.name}</span>
						{/if}
					</button>
				{/each}
			{/if}
		</nav>

		<div class="p-2 border-t border-base-400">
			<button
				class="flex items-center rounded-[10px] border-0 bg-transparent cursor-pointer text-content/60 whitespace-nowrap w-full relative transition-[background,opacity] duration-100 hover:bg-base-300 hover:opacity-90 {sidebarCollapsed
					? 'justify-center p-2 px-0'
					: 'gap-2.5 p-2 px-2.5 text-left'} {isActive(`${prefix}/configuracion/`)
					? 'opacity-100'
					: ''}"
				onclick={() => navigate(`${prefix}/configuracion/`)}
			>
				{#if isActive(`${prefix}/configuracion/`)}
					<span
						class="absolute -left-2 w-[3px] h-[18px] rounded-r-[3px]"
						style="background: var(--color-config-100)"
					></span>
				{/if}
				<Bolt class="w-5 h-5 shrink-0 text-content/60" />
				{#if !sidebarCollapsed}
					<span class="text-sm font-medium">Config</span>
				{/if}
			</button>
		</div>
	</aside>

	<!-- ── MAIN CONTENT ── -->
	<main class="flex-1 overflow-hidden overflow-y-auto p-3 max-sm:pb-[87px]">
		{@render children()}
	</main>

	<!-- ── MOBILE BOTTOM NAV ── -->
	<nav
		class="hidden max-sm:flex fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-400 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))] z-40"
	>
		{#each bottomNav as section (section.id)}
			<button
				class="flex-1 flex flex-col items-center gap-[3px] py-1.5 border-0 bg-transparent cursor-pointer transition-opacity duration-100 rounded-lg {isActive(
					section.path
				)
					? 'opacity-100 hover:opacity-100'
					: 'opacity-40 hover:opacity-70'}"
				style={isActive(section.path) ? `color: ${section.color}` : ''}
				onclick={() => navigate(section.path)}
			>
				<section.icon class="w-6 h-6" />
				<span class="text-[10px] font-medium">{section.label}</span>
			</button>
		{/each}

		<button
			class="flex-1 flex flex-col items-center gap-[3px] py-1.5 border-0 bg-transparent cursor-pointer transition-opacity duration-100 rounded-lg {sheetActive
				? 'opacity-100'
				: 'opacity-40 hover:opacity-70'}"
			style={sheetActive ? `color: ${sheetActive.color}` : ''}
			onclick={() => (sheetOpen = true)}
		>
			<Ellipsis class="w-6 h-6" />
			<span class="text-[10px] font-medium">Más</span>
		</button>
	</nav>
</div>

<!-- ── BOTTOM SHEET ── -->
{#if sheetOpen}
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black/50 z-50 flex items-end text-content"
		onclick={(e) => {
			if (e.target === e.currentTarget) sheetOpen = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') sheetOpen = false;
		}}
	>
		<div
			class="w-full bg-base-200 rounded-t-2xl px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] border border-base-400 border-b-0"
		>
			<div class="w-9 h-1 rounded-full bg-base-400 mx-auto mb-4"></div>

			<div class="flex items-center justify-between mb-3">
				<span class="text-xs font-semibold tracking-wider uppercase text-content/40"
					>Más secciones</span
				>
				<button
					class="bg-transparent border-0 cursor-pointer text-content/50 p-1 rounded-md"
					onclick={() => (sheetOpen = false)}
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="grid grid-cols-2 gap-2">
				{#each sheetSections as section (section.id)}
					<button
						class="flex items-center gap-2.5 p-3 rounded-[10px] border border-base-400 bg-base-100 cursor-pointer text-sm font-medium text-content hover:bg-base-300 transition-colors duration-100"
						onclick={() => navigate(section.path)}
					>
						<span
							class="inline-flex items-center justify-center w-7 h-7 rounded-[7px] text-white shrink-0"
							style="background: {section.color}"
						>
							<section.icon size="16" />
						</span>
						<span>{section.label}</span>
					</button>
				{/each}
			</div>

			{#if semestre.ramos.list.length > 0}
				<div class="mt-4">
					<span class="text-xs font-semibold tracking-wider uppercase text-content/40"
						>Tus Ramos</span
					>
					<div class="grid grid-cols-2 gap-2 mt-2">
						{#each semestre.ramos.list as [id, ramo] (id)}
							<button
								class="flex items-center gap-2.5 p-3 rounded-[10px] border border-base-400 bg-base-100 cursor-pointer text-sm font-medium text-content hover:bg-base-300 transition-colors duration-100"
								onclick={() => { ramoDrawer.open(id); sheetOpen = false; }}
							>
								<span
									class="w-3 h-3 rounded-full shrink-0"
									style="background: {ramo.color}"
								></span>
								<span>{ramo.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<RamoDrawer />
