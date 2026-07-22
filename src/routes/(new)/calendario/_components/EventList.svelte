<script lang="ts">
	import { semestre } from '$lib/infra/semestres.svelte';
	import { getNow } from '$lib/utils/date';
	import type { ScheduleEvent } from '$lib/features/schedule.svelte';
	import {
		Presentation,
		CircleAlert,
		Book,
		FlaskConical,
		Users,
		Wrench,
		Clock,
		Ellipsis
	} from '@lucide/svelte';

	const categoryIcons: Record<string, typeof Book> = {
		exam: Presentation,
		urgent: CircleAlert,
		book: Book,
		lab: FlaskConical,
		assist: Users,
		taller: Wrench,
		event: Clock,
		other: Ellipsis
	};

	interface Props {
		events: ScheduleEvent[];
		onEventClick: (event: ScheduleEvent) => void;
	}

	let { events, onEventClick }: Props = $props();

	interface Row {
		event: ScheduleEvent;
		date: string;
		startTime: string;
		endTime: string;
		label: string;
		showDate: boolean;
	}

	function dayName(dow: number): string {
		return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dow];
	}

	function formatDate(dateStr: string): string {
		const [y, m, d] = dateStr.split('-').map(Number);
		const date = new Date(y, m - 1, d);
		const dow = date.getDay();
		return `${dayName(dow)} ${d}/${m}`;
	}

	function expandRecurring(event: ScheduleEvent, today: Date): Row[] {
		if (!event.daysOfWeek || event.daysOfWeek.length === 0) return [];

		const parse = (s: string) => s.split('-').map(Number);
		const [sy, sm, sd] = event.recurrenceStart ? parse(event.recurrenceStart) : [1970, 1, 1];
		const [ey, em, ed] = event.recurrenceEnd ? parse(event.recurrenceEnd) : [2099, 12, 31];
		const rangeStart = new Date(sy, sm - 1, sd);
		const rangeEnd = new Date(ey, em - 1, ed, 23, 59, 59, 999);

		const rows: Row[] = [];
		const start = new Date(today);
		start.setHours(0, 0, 0, 0);

		for (let i = 0; i < 28 && rows.length < 20; i++) {
			const d = new Date(start);
			d.setDate(d.getDate() + i);
			if (d > rangeEnd) break;
			if (d < rangeStart) continue;

			const dow = d.getDay() === 0 ? 7 : d.getDay();
			if (!event.daysOfWeek.includes(dow)) continue;

			const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			rows.push({
				event,
				date: dateStr,
				startTime: event.startTime ?? '',
				endTime: event.endTime ?? '',
				label: `${dayName(dow)} ${d.getDate()}/${d.getMonth() + 1}`,
				showDate: true
			});
		}
		return rows;
	}

	const rows = $derived.by(() => {
		const today = getNow();
		const result: Row[] = [];

		for (const event of events) {
			if (event.daysOfWeek && event.daysOfWeek.length > 0) {
				result.push(...expandRecurring(event, today));
			} else if (event.date) {
				result.push({
					event,
					date: event.date,
					startTime: event.startTime ?? '',
					endTime: event.endTime ?? '',
					label: formatDate(event.date),
					showDate: true
				});
			}
		}

		result.sort((a, b) => {
			const dateCmp = a.date.localeCompare(b.date);
			if (dateCmp !== 0) return dateCmp;
			return a.startTime.localeCompare(b.startTime);
		});

		for (const row of result) {
			row.showDate = true;
		}

		return result;
	});

	function ramoColor(ramoId?: string): string {
		if (!ramoId) return 'var(--color-primary-100)';
		const r = semestre.ramos.get(ramoId);
		return r?.color ?? 'var(--color-primary-100)';
	}
</script>

<div class="bg-base-100 border border-base-400 rounded-xl overflow-hidden">
	{#if rows.length === 0}
		<div class="p-8 text-center text-content/40 text-sm">No hay eventos para mostrar</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-base-300 text-left">
						<th
							class="px-4 py-2.5 text-xs font-semibold text-content/40 uppercase tracking-wider w-28"
							>Fecha</th
						>
						<th
							class="px-4 py-2.5 text-xs font-semibold text-content/40 uppercase tracking-wider w-32"
							>Hora</th
						>
						<th class="px-4 py-2.5 text-xs font-semibold text-content/40 uppercase tracking-wider"
							>Título</th
						>
						<th
							class="px-4 py-2.5 text-xs font-semibold text-content/40 uppercase tracking-wider hidden xl:table-cell"
							>Descripción</th
						>
					</tr>
				</thead>
				<tbody>
					{#each rows as row, i (row.event.id + '-' + row.date)}
						{@const Icon = categoryIcons[row.event.category] ?? Ellipsis}
						{@const color = ramoColor(row.event.ramoId)}
						<tr
							class="border-b border-base-300/50 hover:bg-base-200/50 transition-colors cursor-pointer"
							onclick={() => onEventClick(row.event)}
						>
							<td class="px-4 py-2.5 whitespace-nowrap">
								{#if row.showDate}
									<span class="text-content/70 font-medium">{row.label}</span>
								{/if}
							</td>
							<td class="px-4 py-2.5 whitespace-nowrap text-content/50">
								{#if row.startTime}
									{row.startTime}{#if row.endTime}
										— {row.endTime}{/if}
								{:else}
									—
								{/if}
							</td>
							<td class="px-4 py-2.5">
								<div class="flex items-center gap-2">
									<span style="color: {color}"><Icon class="w-4 h-4 shrink-0" /></span>
									<span class="font-medium text-content">{row.event.title || 'Sin título'}</span>
								</div>
							</td>
							<td
								class="px-4 py-2.5 text-content/50 text-xs truncate max-w-[200px] hidden xl:table-cell"
							>
								{row.event.description || ''}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
