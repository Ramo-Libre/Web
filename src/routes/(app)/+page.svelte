<script lang="ts">
	import { fly } from 'svelte/transition';
	import { db } from '$lib/state/index.svelte';
	import OnBoarding from './_components/OnBoarding.svelte';
	import GradeSolver from './_components/GradeSolver.svelte';
	import Offline from './_components/Offline.svelte';
	import Github from './_components/Github.svelte';
	import NextClass from './_components/NextClass.svelte';
	import AcademicHealth from './_components/AcademicHealth.svelte';
	import UpcomingEvents from './_components/UpcomingEvents.svelte';
	import SemestreProgress from './_components/SemestreProgress.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import WelcomeBar from './_components/WelcomeBar.svelte';

	let semesterName = '';

	function handleStart() {
		if (!semesterName) return;
		db.semestres.add(semesterName);
		goto(resolve('/configuracion#semesters' as '/configuracion'));
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="grid h-full w-full">
	{#if !db.empty}
		<div class="space-y-6">
			<WelcomeBar />

			<div class="home-cards">
				<div class="home-cards__col">
					<div class="home-cards__item">
						<NextClass />
					</div>
					<div class="home-cards__item">
						<SemestreProgress />
					</div>
				</div>

				<div class="home-cards__col">
					<div class="home-cards__item">
						<AcademicHealth />
					</div>
					<div class="home-cards__item">
						<UpcomingEvents />
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
			<div class="md:col-span-2 grid">
				<OnBoarding bind:semesterName onStart={handleStart} />
			</div>
			<GradeSolver />
			<Github />
			<div class="md:col-span-2 grid">
				<Offline />
			</div>
		</div>
	{/if}
</div>

<style>
	.home-cards {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-width: 0;
	}
	.home-cards__col {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-width: 0;
	}
	.home-cards__item {
		margin: 0;
		min-width: 0;
		width: 100%;
		max-width: 100%;
	}

	@media (min-width: 1024px) {
		.home-cards {
			flex-direction: row;
			align-items: flex-start;
			min-width: 0;
		}
		.home-cards__col {
			flex: 1;
			min-width: 0;
		}
	}
</style>
