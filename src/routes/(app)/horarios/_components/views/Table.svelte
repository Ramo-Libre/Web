<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { Horario, HorarioDay } from '$lib/state/horarios.svelte';
	import {
		BookOpen,
		FlaskConical,
		Users,
		Hammer,
		ChevronLeft,
		ChevronRight,
		Clock
	} from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { getNow } from '$lib/utils/date';

	// --- CONFIGURACIÓN ---
	const weekDays: { id: HorarioDay; name: string; short: string; dow: number }[] = [
		{ id: 'L', name: 'Lunes', short: 'Lun', dow: 1 },
		{ id: 'M', name: 'Martes', short: 'Mar', dow: 2 },
		{ id: 'X', name: 'Miércoles', short: 'Mié', dow: 3 },
		{ id: 'J', name: 'Jueves', short: 'Jue', dow: 4 },
		{ id: 'V', name: 'Viernes', short: 'Vie', dow: 5 },
		{ id: 'S', name: 'Sábado', short: 'Sáb', dow: 6 }
	];

	const rangeHours: [number, number] = [8, 21];
	const PX_PER_MINUTE = 2;
	const TIME_GUTTER_PX = 60;

	// Añadimos 80px (equivalente a 40 minutos) de padding al final
	// para que las clases de las 21:20 no se desborden del div blanco.
	const BOTTOM_PADDING_PX = 80;
	const boardHeight = (rangeHours[1] - rangeHours[0]) * 60 * PX_PER_MINUTE + BOTTOM_PADDING_PX;

	// --- ICONOS MAP ---
	const typeIcons = {
		book: BookOpen,
		lab: FlaskConical,
		assist: Users,
		taller: Hammer
	};

	// --- ESTADO TEMPORAL ---
	let now = $state(getNow());
	$effect(() => {
		const interval = setInterval(() => (now = getNow()), 60000);
		return () => clearInterval(interval);
	});

	const nowStr = $derived(now.toTimeString().slice(0, 5));
	const currentDowNum = $derived(now.getDay() === 0 ? 7 : now.getDay());
	const isWorkDay = $derived(currentDowNum >= 1 && currentDowNum <= 6);

	// Navegación Móvil
	let selectedDayIdx = $derived(isWorkDay ? currentDowNum - 1 : 0);
	const selectedDay = $derived(weekDays[selectedDayIdx]);

	// --- LÓGICA DE PROCESAMIENTO ---
	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	const timeSlots = $derived.by(() => {
		const slots = [];
		for (let h = rangeHours[0]; h <= rangeHours[1]; h++) {
			for (let m = 0; m < 60; m += 30) {
				if (h === rangeHours[1] && m > 0) break;
				slots.push({
					label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
					h,
					m,
					top: (h * 60 + m - rangeHours[0] * 60) * PX_PER_MINUTE
				});
			}
		}
		return slots;
	});

	interface LaidHorario extends Horario {
		startMin: number;
		endMin: number;
		color: string;
		ramoName: string;
		lane: number;
		maxLanes: number;
	}

	const laidByDay = $derived.by(() => {
		const out: Record<string, LaidHorario[]> = {};
		const allHorarios = db.horarios.list.map(([, h]) => h);
		const ramosMap = db.ramos.map;

		weekDays.forEach((day) => {
			const dayEvents = allHorarios
				.filter((h) => h.day === day.id)
				.map((h) => ({
					...h,
					startMin: toMinutes(h.start),
					endMin: toMinutes(h.end),
					color: ramosMap.get(h.ramoId ?? '')?.color ?? '#64748b',
					ramoName: ramosMap.get(h.ramoId ?? '')?.nombre ?? 'Sin Ramo'
				}))
				.sort((a, b) => a.startMin - b.startMin);

			const result: LaidHorario[] = [];
			const active = new SvelteMap<number, LaidHorario>();
			let group: LaidHorario[] = [];
			let maxLanes = 0;

			const flushGroup = () => {
				for (const e of group) e.maxLanes = Math.max(1, maxLanes);
				group = [];
				maxLanes = 0;
			};

			for (const ev of dayEvents) {
				for (const [lane, act] of active.entries()) {
					if (act.endMin <= ev.startMin) active.delete(lane);
				}

				if (active.size === 0 && group.length > 0) flushGroup();

				let lane = 0;
				while (active.has(lane)) lane++;

				const laidEv: LaidHorario = { ...ev, lane, maxLanes: 1 };

				active.set(lane, laidEv);
				group.push(laidEv);
				maxLanes = Math.max(maxLanes, active.size);
				result.push(laidEv);
			}
			if (group.length > 0) flushGroup();

			out[day.id] = result;
		});
		return out;
	});

	const currentTimeY = $derived((toMinutes(nowStr) - rangeHours[0] * 60) * PX_PER_MINUTE);

	function getEventStyle(ev: LaidHorario) {
		const top = (ev.startMin - rangeHours[0] * 60) * PX_PER_MINUTE;
		const height = (ev.endMin - ev.startMin) * PX_PER_MINUTE;

		const width = 100 / ev.maxLanes;
		const left = ev.lane * width;

		return `top: ${top}px; height: ${height}px; left: ${left}%; width: ${width}%;`;
	}
</script>

<div class="flex flex-col bg-base-100 rounded-2xl border border-base-400 shadow-sm overflow-hidden">
	<div class="lg:hidden flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
		<button
			class="p-2 hover:bg-base-300 rounded-full transition-colors cursor-pointer"
			onclick={() => (selectedDayIdx = (selectedDayIdx - 1 + 6) % 6)}
		>
			<ChevronLeft class="w-5 h-5 text-content/70" />
		</button>

		<div class="text-center">
			<span class="block font-bold text-content">{selectedDay.name}</span>
			<div class="flex gap-1.5 mt-1.5 justify-center">
				{#each weekDays as day, i (day.id)}
					<div
						class="w-1.5 h-1.5 rounded-full {i === selectedDayIdx
							? 'bg-schedule-100'
							: 'bg-base-400'}"
					></div>
				{/each}
			</div>
		</div>

		<button
			class="p-2 hover:bg-base-300 rounded-full transition-colors cursor-pointer"
			onclick={() => (selectedDayIdx = (selectedDayIdx + 1) % 6)}
		>
			<ChevronRight class="w-5 h-5 text-content/70" />
		</button>
	</div>

	<div
		class="hidden lg:grid border-b border-base-300 bg-base-200"
		style="grid-template-columns: {TIME_GUTTER_PX}px 1fr;"
	>
		<div class="border-r border-base-300"></div>
		<div class="grid grid-cols-6">
			{#each weekDays as day, i (i)}
				<div
					class="h-10 flex items-center justify-center text-[10px] font-black text-content/50 uppercase tracking-widest border-r border-base-300 last:border-r-0 {day.dow ===
					currentDowNum
						? 'bg-schedule-400' /* Resalte de día actual usando schedule */
						: ''}"
				>
					{day.name}
				</div>
			{/each}
		</div>
	</div>

	<div class="flex-1 relative">
		<div class="grid" style="grid-template-columns: {TIME_GUTTER_PX}px 1fr;">
			<div class="relative border-r border-base-300 bg-base-100" style="height: {boardHeight}px;">
				{#each timeSlots as slot (slot.label)}
					<div
						class="absolute right-2 -translate-y-1/2 text-[10px] font-bold {slot.m === 0
							? 'text-content/60'
							: 'text-content/30'}"
						style="top: {slot.top}px;"
					>
						{slot.label}
					</div>
				{/each}
			</div>

			<div class="relative" style="height: {boardHeight}px;">
				{#each timeSlots as slot (slot.label)}
					<div
						class="absolute w-full border-t {slot.m === 0
							? 'border-base-300'
							: 'border-base-200 border-dashed'}"
						style="top: {slot.top}px;"
					></div>
				{/each}

				{#if isWorkDay && currentTimeY > 0 && currentTimeY < boardHeight}
					<div
						class="absolute w-full border-t-2 border-error-300 z-20 pointer-events-none flex items-center"
						style="top: {currentTimeY}px;"
					>
						<div class="w-2 h-2 bg-error-100 rounded-full -ml-1 -translate-y-1/2 shadow-sm"></div>
					</div>
				{/if}

				<div class="grid h-full grid-cols-1 lg:grid-cols-6">
					{#each weekDays as day, i (i)}
						<div
							class="relative border-r border-base-300 h-full transition-colors {i !==
							selectedDayIdx
								? 'hidden lg:block'
								: 'block'} {day.dow === currentDowNum ? 'bg-schedule-400' : ''}"
						>
							{#each laidByDay[day.id] as ev (ev.id)}
								{@const Icon = typeIcons[ev.type as keyof typeof typeIcons]}
								<div
									class="absolute p-2 rounded-lg border-l-4 shadow-sm overflow-hidden group transition-all hover:z-30 hover:shadow-md cursor-pointer"
									style="{getEventStyle(
										ev
									)} background-color: {ev.color}15; border-color: {ev.color};"
								>
									<div class="flex flex-col h-full">
										<div class="flex items-center gap-1.5 mb-1 min-w-0">
											<Icon class="w-3.5 h-3.5 shrink-0" style="color: {ev.color}" />
											<span class="text-[10px] font-black uppercase truncate text-content">
												{ev.ramoName}
											</span>
										</div>

										{#if ev.location}
											<span class="text-[11px] font-medium text-content/80 truncate">
												{ev.location}
											</span>
										{/if}

										<div class="mt-auto flex items-center gap-1 text-content/50">
											<Clock class="w-3 h-3" />
											<span class="text-[9px] font-bold tracking-tighter">
												{ev.start} - {ev.end}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
