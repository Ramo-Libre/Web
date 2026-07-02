<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import NewDashboard from '$lib/pages/NewDashboard.svelte';
	import Banner from '$lib/pages/_components/dashboard/Banner.svelte';
	import InicioRapido from '$lib/pages/_components/dashboard/InicioRapido.svelte';
	import QuickActions from '$lib/pages/_components/dashboard/QuickActions.svelte';
	import OtherApps from '$lib/pages/_components/dashboard/OtherApps.svelte';
	import { fly } from 'svelte/transition';

	const hasData = $derived(semestre.hasData);
</script>

{#if hasData}
	<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<NewDashboard />
	</div>
{:else}
	<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-6">
		<Banner />
		<OtherApps />
		<InicioRapido />
		<QuickActions />
	</div>
{/if}
