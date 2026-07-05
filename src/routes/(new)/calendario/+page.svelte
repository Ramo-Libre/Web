<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { getNow } from '$lib/utils/date';
	import type { ScheduleEvent, ScheduleCategory } from '$lib/features/schedule.svelte';
	import CalendarGrid from './_components/CalendarGrid.svelte';
	import ViewBar from './_components/ViewBar.svelte';
	import EventModal from './_components/EventModal.svelte';
	import RecurrenceModal from '../horarios/_components/RecurrenceModal.svelte';
	import DayList from './_components/DayList.svelte';
	import DayTimeline from './_components/DayTimeline.svelte';

	let selectedRamo = $state<string | null>(null);
	let selectedCategories = $state<Set<ScheduleCategory>>(new SvelteSet());
	let selectedDate = $state<string | null>(
		(() => {
			const d = getNow();
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		})()
	);
	let editingEvent = $state<ScheduleEvent | null>(null);
	let showModal = $state(false);
	let modalDate = $state<string | undefined>(undefined);
	let showHorarios = $state(semestre.preferences.calendarShowHorarios);
	let editingRecurring = $state<ScheduleEvent | null>(null);
	let showRecurringModal = $state(false);

	const baseEvents = $derived(
		semestre.schedule.list
			.map(([, e]) => e)
			.filter((e) => !selectedRamo || e.ramoId === selectedRamo)
			.filter(
				(e) => selectedCategories.size === 0 || (e.category && selectedCategories.has(e.category))
			)
	);

	const filteredEvents = $derived(showHorarios ? baseEvents : baseEvents.filter((e) => e.date));

	const dayEvents = $derived(
		selectedDate
			? semestre.schedule
					.getByDate(selectedDate)
					.filter((e) => !selectedRamo || e.ramoId === selectedRamo)
					.filter(
						(e) =>
							selectedCategories.size === 0 || (e.category && selectedCategories.has(e.category))
					)
					.filter((e) => showHorarios || e.date)
			: []
	);

	function getNextDateForDow(dows: number[]): string {
		const today = getNow();
		for (let i = 0; i < 60; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() + i);
			const dow = d.getDay() === 0 ? 7 : d.getDay();
			if (dows.includes(dow)) {
				return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			}
		}
		const d = new Date(today);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function findEventById(id: string): ScheduleEvent | undefined {
		const byKey = semestre.schedule.get(id);
		if (byKey) return byKey;
		for (const [, e] of semestre.schedule.list) {
			if (e.id === id) return e;
		}
		return undefined;
	}

	function handleHash(hash: string) {
		if (!hash || hash === '#') return;
		const eventId = hash.slice(1);
		const event = findEventById(eventId);
		if (!event) return;
		if (event.date) {
			selectedDate = event.date;
		} else if (event.daysOfWeek && event.daysOfWeek.length > 0) {
			selectedDate = getNextDateForDow(event.daysOfWeek);
		}
		history.replaceState(null, '', '/calendario');
	}

	onMount(() => {
		handleHash(page.url.hash);
		const onHashChange = () => handleHash(window.location.hash);
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	});

	function openCreate(dateStr?: string) {
		editingEvent = null;
		modalDate = dateStr;
		showModal = true;
	}

	function openEdit(event: ScheduleEvent) {
		if (event.daysOfWeek && event.daysOfWeek.length > 0) {
			editingRecurring = event;
			showRecurringModal = true;
		} else {
			editingEvent = event;
			modalDate = undefined;
			showModal = true;
		}
	}

	function handleSave(data: {
		id?: string;
		title?: string;
		description?: string;
		category: ScheduleCategory;
		ramoId?: string;
		date?: string;
		startTime?: string;
		endTime?: string;
	}) {
		if (data.id) {
			const existing = semestre.schedule.get(data.id);
			if (existing) {
				semestre.schedule.update(data.id, { ...existing, ...data });
			}
		} else {
			semestre.schedule.add({
				category: data.category,
				title: data.title,
				description: data.description,
				ramoId: data.ramoId,
				date: data.date,
				startTime: data.startTime,
				endTime: data.endTime
			});
		}
		showModal = false;
	}

	function handleDelete(id: string) {
		semestre.schedule.remove(id);
		showModal = false;
	}

	function handleRecurringSave(data: {
		id?: string;
		title?: string;
		description?: string;
		category: ScheduleCategory;
		ramoId?: string;
		daysOfWeek: number[];
		startTime: string;
		endTime: string;
		recurrenceStart?: string;
		recurrenceEnd?: string;
	}) {
		if (data.id) {
			const existing = semestre.schedule.get(data.id);
			if (existing) {
				semestre.schedule.update(data.id, { ...existing, ...data });
			}
		}
		showRecurringModal = false;
	}

	function handleRecurringDelete(id: string) {
		semestre.schedule.remove(id);
		showRecurringModal = false;
	}
</script>

<div in:fly={{ y: 10, duration: 300, delay: 100 }} class="flex flex-col gap-4">
	<ViewBar
		{selectedRamo}
		{selectedCategories}
		{showHorarios}
		onRamoChange={(v) => (selectedRamo = v)}
		onCategoriesChange={(v) => (selectedCategories = v)}
		onToggleHorarios={() => {
			showHorarios = !showHorarios;
			semestre.preferences.setCalendarShowHorarios(showHorarios);
		}}
		onAddEvent={() => openCreate(selectedDate ?? undefined)}
	/>

	<CalendarGrid events={filteredEvents} {selectedDate} onDaySelect={(d) => (selectedDate = d)} />

	<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
		<DayList dateStr={selectedDate} events={dayEvents} onEventClick={(e) => openEdit(e)} />
		<DayTimeline events={dayEvents} onEventClick={(e) => openEdit(e)} />
	</div>
</div>

{#if showModal}
	<EventModal
		event={editingEvent}
		prefillDate={modalDate}
		onClose={() => (showModal = false)}
		onSave={handleSave}
		onDelete={handleDelete}
	/>
{/if}

{#if showRecurringModal}
	<RecurrenceModal
		event={editingRecurring}
		onClose={() => (showRecurringModal = false)}
		onSave={handleRecurringSave}
		onDelete={handleRecurringDelete}
	/>
{/if}
