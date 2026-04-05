<script lang="ts">
	import NavItem from '$lib/components/NavItem.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import {
		GraduationCap,
		CalendarCheck,
		TrendingUp,
		CalendarDays,
		BookMarked,
		Bolt
	} from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	type Icon = Snippet<[{ class?: string }]>;

	let { children } = $props();
</script>

<nav class="grid grid-cols-6 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 sm:mb-6 max-sm:pt-2">
	<NavItem href="/" color="indigo" text="RamoLibre" icon={GraduationCap as Icon} />
	<NavItem href="/horarios" color="blue" text="Horarios" icon={CalendarCheck as Icon} disabled />
	<NavItem href="/notas" color="green" text="Notas" icon={TrendingUp as Icon} />
	<NavItem
		href="/calendario"
		color="purple"
		text="Calendario"
		icon={CalendarDays as Icon}
		disabled
	/>
	<NavItem href="/ramos" color="orange" text="Ramos" icon={BookMarked as Icon} />
	<NavItem href="/configuracion" color="slate" text="Config" icon={Bolt as Icon} />
</nav>

<TooltipProvider delayDuration={100}>
	<div class="flex-1 overflow-hidden overflow-y-auto max-sm:min-h-0">
		{@render children()}
	</div>
</TooltipProvider>
