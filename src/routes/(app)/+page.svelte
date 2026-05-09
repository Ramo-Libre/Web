<script lang="ts">
	import { fly } from 'svelte/transition';
	import { db } from '$lib/state/index.svelte';
	import OnBoarding from './_components/OnBoarding.svelte';
	import GradeSolver from './_components/GradeSolver.svelte';
	import Resumen from './_components/Resumen.svelte';
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

{#if db.empty}
	<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="grid h-full w-full">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
			<div class="md:col-span-2 grid">
				<OnBoarding bind:semesterName onStart={handleStart} />
			</div>
			<GradeSolver />
			<Github />
			<div class="md:col-span-2 grid">
				<Resumen />
			</div>
		</div>
	</div>
{:else}
	<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col h-full w-full min-w-0">
		<div class="flex flex-col gap-6 w-full min-w-0">
			<WelcomeBar />

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0 items-start">
				<div class="flex flex-col gap-6 w-full min-w-0">
					<div class="w-full min-w-0"><NextClass /></div>
					<div class="w-full min-w-0"><SemestreProgress /></div>
				</div>

				<div class="flex flex-col gap-6 w-full min-w-0">
					<div class="w-full min-w-0"><AcademicHealth /></div>
					<div class="w-full min-w-0"><UpcomingEvents /></div>
					<div class="w-full min-w-0"><Resumen /></div>
				</div>
			</div>
		</div>
	</div>
{/if}
