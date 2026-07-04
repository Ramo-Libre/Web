<script lang="ts">
	import { getNow } from '$lib/utils/date';
	import AccountCard from './_components/dashboard/AccountCard.svelte';
	import NextClassCard from './_components/dashboard/NextClassCard.svelte';
	import CargaMensual from './_components/dashboard/CargaMensual.svelte';
	import ProbabilidadesCard from './_components/dashboard/ProbabilidadesCard.svelte';
	import UpcomingEventsCard from './_components/dashboard/UpcomingEventsCard.svelte';
	import QuickActions from './_components/dashboard/QuickActions.svelte';

	let now = $state(getNow());
	$effect(() => {
		const i = setInterval(() => now = getNow(), 1000);
		return () => clearInterval(i);
	});
</script>

<div class="space-y-4">
	<AccountCard />
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<NextClassCard {now} />
		<CargaMensual {now} />
		<ProbabilidadesCard />
		<UpcomingEventsCard {now} />
		<QuickActions />
	</div>
</div>
