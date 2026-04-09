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
	import { onMount } from 'svelte';
	import { db } from '$lib';

	let { children } = $props();

	// Helper rápido para checkear active
	const isActive = (path: string) => page.url.pathname === path;

	onMount(() => {
		db.preferences.applyTheme();
	});
</script>

<nav class="grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 sm:mb-6 max-sm:pt-2">
	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block
            {isActive('/')
				? 'ring-2 ring-primary-100 bg-primary-400 border-primary-300 text-primary-100'
				: 'border-base-400 text-content hover:border-primary-300 hover:bg-primary-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<GraduationCap class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">RamoLibre</span>
			</div>
			{#if isActive('/')}<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-primary-100 rounded-full"
				></div>{/if}
		</a>
	</div>

	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/horarios')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block
            {isActive('/horarios')
				? 'ring-2 ring-schedule-100 bg-schedule-400 border-schedule-300 text-schedule-100'
				: 'border-base-400 text-content hover:border-schedule-300 hover:bg-schedule-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<CalendarCheck class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">Horarios</span>
			</div>
			{#if isActive('/horarios')}<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-schedule-100 rounded-full"
				></div>{/if}
		</a>
	</div>

	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/notas')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block
            {isActive('/notas')
				? 'ring-2 ring-grades-100 bg-grades-400 border-grades-300 text-grades-100'
				: 'border-base-400 text-content hover:border-grades-300 hover:bg-grades-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<TrendingUp class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">Notas</span>
			</div>
			{#if isActive('/notas')}<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-grades-100 rounded-full"
				></div>{/if}
		</a>
	</div>

	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/calendario')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block
            {isActive('/calendario')
				? 'ring-2 ring-calendar-100 bg-calendar-400 border-calendar-300 text-calendar-100'
				: 'border-base-400 text-content hover:border-calendar-300 hover:bg-calendar-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<CalendarDays class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">Calendario</span>
			</div>
			{#if isActive('/calendario')}<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-calendar-100 rounded-full"
				></div>{/if}
		</a>
	</div>

	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/ramos')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block
            {isActive('/ramos')
				? 'ring-2 ring-classes-100 bg-classes-400 border-classes-300 text-classes-100'
				: 'border-base-400 text-content hover:border-classes-300 hover:bg-classes-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<BookMarked class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">Ramos</span>
			</div>
			{#if isActive('/ramos')}<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-classes-100 rounded-full"
				></div>{/if}
		</a>
	</div>

	<div class="bg-base-100 rounded-2xl hover:scale-105 transition-all duration-200">
		<a
			href={resolve('/configuracion')}
			class="group overflow-hidden relative rounded-2xl sm:px-6 py-4 border transition-all block overflow-hidden
            {isActive('/configuracion')
				? 'ring-2 ring-config-100 bg-config-400 border-config-300 text-config-100'
				: 'border-base-400 text-content hover:border-config-300 hover:bg-config-400/50'}"
		>
			<div class="flex items-center justify-center sm:justify-start gap-3">
				<Bolt class="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-md sm:p-1" />
				<span class="text-lg font-semibold max-sm:hidden truncate">Config</span>
			</div>
			{#if isActive('/configuracion')}
				<div
					class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-8 bg-config-100 rounded-full"
				></div>
			{/if}
		</a>
	</div>
</nav>

<main class="flex-1 overflow-hidden overflow-y-auto max-sm:min-h-0">
	{@render children()}
</main>
