<script lang="ts">
	import {
		Sparkles,
		BookMarked,
		CalendarDays,
		CalendarCheck,
		Calendar,
		TrendingUp,
		LayoutDashboard,
		GraduationCap,
		Book,
		Activity,
		Presentation,
		FlaskConical,
		Users,
		Wrench,
		Ellipsis,
		CircleCheck,
		CloudOff,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';

	let {
		step = $bindable(1),
		onNext,
		onPrev,
		onFinish
	}: {
		step: number;
		onNext: () => void;
		onPrev: () => void;
		onFinish: () => void;
	} = $props();

	const totalSteps = 5;

	const ramosDummy = [
		{ name: 'Matemáticas', color: '#ef4444' },
		{ name: 'Física', color: '#3b82f6' },
		{ name: 'Química', color: '#22c55e' }
	];

	const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	const scheduleDummy: Record<string, { color: string; time: string; cat: string }[]> = {
		L: [{ color: '#ef4444', time: '10:00', cat: 'book' }],
		M: [{ color: '#22c55e', time: '09:00', cat: 'lab' }],
		X: [
			{ color: '#ef4444', time: '11:00', cat: 'book' },
			{ color: '#22c55e', time: '15:00', cat: 'book' }
		],
		J: [{ color: '#3b82f6', time: '10:00', cat: 'book' }],
		V: [{ color: '#ef4444', time: '08:30', cat: 'exam' }],
		S: [],
		D: []
	};

	const catIconsMap: Record<string, typeof Book> = {
		book: Book,
		lab: FlaskConical,
		exam: Presentation,
		assist: Users,
		taller: Wrench,
		other: Ellipsis
	};

	const year = 2026;
	const month = 6;
	const firstDow = new Date(year, month - 1, 1).getDay();
	const firstDowMon = firstDow === 0 ? 6 : firstDow - 1;
	const totalDays = new Date(year, month, 0).getDate();
	const prevTotal = new Date(year, month - 1, 0).getDate();

	const calCells: { day: number; isCurrent: boolean; hasEvent: boolean; isToday: boolean }[] = [];
	for (let i = firstDowMon - 1; i >= 0; i--) {
		calCells.push({ day: prevTotal - i, isCurrent: false, hasEvent: false, isToday: false });
	}
	for (let d = 1; d <= totalDays; d++) {
		calCells.push({
			day: d,
			isCurrent: true,
			hasEvent: [3, 7, 12, 15, 19, 22, 25, 28].includes(d),
			isToday: d === 15
		});
	}
	let nd = 1;
	while (calCells.length % 7 !== 0) {
		calCells.push({ day: nd, isCurrent: false, hasEvent: false, isToday: false });
		nd++;
	}

	const weeks: (typeof calCells)[] = [];
	for (let i = 0; i < calCells.length; i += 7) weeks.push(calCells.slice(i, i + 7));

	const probRows = [
		{
			name: 'Matemáticas',
			color: '#ef4444',
			barCls: 'bg-success-100',
			pct: 100,
			label: '100%',
			labelCls: 'text-success-100'
		},
		{
			name: 'Física',
			color: '#3b82f6',
			barCls: 'bg-primary-100',
			pct: 70,
			label: '70%',
			labelCls: 'text-primary-100'
		},
		{
			name: 'Química',
			color: '#22c55e',
			barCls: 'bg-error-100',
			pct: 35,
			label: '35%',
			labelCls: 'text-error-100'
		}
	];

	const chartData = [2, 4, 1, 0, 3, 5, 2, 1, 4, 3, 0, 2, 5, 1, 3];
	const maxV = Math.max(1, ...chartData);
	const cSvgW = 340;
	const cSvgH = 70;
	const cPadL = 0;
	const cPadR = 0;
	const cPadT = 2;
	const cPadB = 14;
	const cChartL = cPadL;
	const cChartR = cSvgW - cPadR;
	const cChartT = cPadT;
	const cChartB = cSvgH - cPadB;
	const cChartW = cChartR - cChartL;
	const cChartH = cChartB - cChartT;
	const cN = chartData.length;
</script>

<div class="flex flex-col gap-6">
	<div class="flex gap-2">
		{#each Array.from({ length: totalSteps }, (_, idx) => idx) as i (i)}
			<div
				class="h-1.5 flex-1 rounded-full transition-colors {i < step
					? 'bg-primary-100'
					: 'bg-base-300'}"
			></div>
		{/each}
	</div>

	{#if step === 1}
		<div class="space-y-5">
			<div class="flex items-center gap-2">
				<Sparkles class="w-5 h-5 text-primary-100" />
				<h3 class="text-base font-bold text-content">Bienvenido a Ramo Libre</h3>
			</div>

			<div class="flex flex-col items-center gap-4 py-4">
				<div
					class="h-16 w-16 bg-white rounded-2xl shadow-lg shadow-primary-100/20 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300"
				>
					<img src={SuiteFavicons.web} alt="Ramo Libre" class="w-10 h-10" />
				</div>
				<p class="text-sm text-content/60 text-center max-w-xs">
					Gestiona tus ramos, horarios y notas de forma inteligente.
				</p>
			</div>

			<div class="divide-y divide-base-300">
				<div class="flex items-center gap-3 py-2.5">
					<CalendarCheck class="w-4 h-4 text-schedule-100 shrink-0" />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-bold text-content">Horarios</div>
						<div class="text-xs text-content/50">Recurrencia semanal</div>
					</div>
				</div>
				<div class="flex items-center gap-3 py-2.5">
					<CalendarDays class="w-4 h-4 text-calendar-100 shrink-0" />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-bold text-content">Calendario</div>
						<div class="text-xs text-content/50">Eventos y fechas</div>
					</div>
				</div>
				<div class="flex items-center gap-3 py-2.5">
					<TrendingUp class="w-4 h-4 text-grades-100 shrink-0" />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-bold text-content">Notas</div>
						<div class="text-xs text-content/50">Ecuaciones y predicciones</div>
					</div>
				</div>
				<div class="flex items-center gap-3 py-2.5">
					<CloudOff class="w-4 h-4 text-content/40 shrink-0" />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-bold text-content">Offline</div>
						<div class="text-xs text-content/50">Sin conexión</div>
					</div>
				</div>
			</div>
		</div>

		<div class="flex justify-end">
			<button
				onclick={onNext}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 2}
		<div class="space-y-5">
			<div class="flex items-center gap-2">
				<BookMarked class="w-5 h-5 text-classes-100" />
				<h3 class="text-base font-bold text-content">Ramos y Semestres</h3>
			</div>
			<p class="text-sm text-content/60">
				Crea períodos académicos y agrega tus asignaturas con nombre y color.
			</p>

			<div class="bg-base-100 border border-base-400 rounded-xl overflow-hidden shadow-sm">
				<div class="relative bg-linear-to-r from-primary-100 to-primary-100/90 p-5 text-base-100">
					<div class="flex items-center gap-2 opacity-80 mb-1.5">
						<CircleCheck size={14} />
						<span class="text-xs font-bold uppercase tracking-widest">Periodo Actual</span>
					</div>
					<div class="text-2xl font-bold text-base-100">2026-1</div>
					<Calendar
						class="absolute -right-4 -bottom-4 text-base-100/10 rotate-12 pointer-events-none"
						size={100}
					/>
				</div>
				<div class="p-4">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-1.5">
							<BookMarked class="h-4 w-4 text-classes-100" />
							<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Mis Ramos</h3>
						</div>
						<span class="text-xs text-content/40 font-mono">3</span>
					</div>
					<div class="space-y-2">
						{#each ramosDummy as ramo (ramo.name)}
							<div
								class="group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 bg-base-100 border-base-400"
							>
								<div
									class="h-10 w-10 rounded-lg text-base-100 shadow-sm border border-base-100/20 flex items-center justify-center font-bold text-sm shrink-0"
									style="background-color: {ramo.color}"
								>
									{ramo.name.substring(0, 2).toUpperCase()}
								</div>
								<div class="flex-1 min-w-0">
									<div class="font-semibold text-content truncate text-sm">{ramo.name}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="flex justify-between">
			<button
				onclick={onPrev}
				class="h-10 px-5 text-sm text-content/60 hover:text-content border border-base-400 rounded-lg hover:bg-base-200 transition-colors font-medium cursor-pointer"
			>
				Anterior
			</button>
			<button
				onclick={onNext}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 3}
		<div class="space-y-5">
			<div class="flex items-center gap-2">
				<CalendarDays class="w-5 h-5 text-calendar-100" />
				<h3 class="text-base font-bold text-content">Horarios y Calendario</h3>
			</div>
			<p class="text-sm text-content/60">
				Define la recurrencia semanal de tus clases y visualiza todo en el calendario.
			</p>

			<div class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden">
				<div class="flex items-center justify-between p-3 border-b border-base-300">
					<div class="flex items-center gap-1.5">
						<CalendarCheck class="h-4 w-4 text-schedule-100" />
						<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Semanal</h3>
					</div>
					<div
						class="flex items-center gap-1 px-2 py-1 rounded-lg border border-base-400 bg-base-100"
					>
						<ChevronLeft class="w-3 h-3 text-content/60" />
						<span class="text-xs font-semibold text-content/70">Esta semana</span>
						<ChevronRight class="w-3 h-3 text-content/60" />
					</div>
				</div>
				<div class="grid grid-cols-7">
					{#each dayHeaders as d, idx (idx)}
						<div
							class="px-1.5 py-2 text-center text-xs font-semibold text-content/40 border-b border-base-300 {idx <
							6
								? 'border-r border-base-300'
								: ''}"
						>
							{d}
						</div>
					{/each}
					{#each dayHeaders as d, idx (idx)}
						<div
							class="min-h-[56px] p-1 border-b border-base-300 {idx < 6
								? 'border-r border-base-300'
								: ''}"
						>
							{#each scheduleDummy[d.slice(0, 1)] ?? [] as block (block.time)}
								{@const CatIcon = catIconsMap[block.cat] ?? Book}
								<div
									class="rounded-md border-l-4 shadow-sm mb-0.5 flex items-center justify-center p-1"
									style="background-color: {block.color}15; border-color: {block.color};"
								>
									<CatIcon class="w-3.5 h-3.5" style="color: {block.color}" />
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<div class="bg-base-100 border border-base-400 rounded-xl shadow-sm overflow-hidden">
				<div class="flex items-center justify-between p-3 border-b border-base-300">
					<div class="flex items-center gap-1.5">
						<CalendarDays class="h-4 w-4 text-calendar-100" />
						<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Junio 2026</h3>
					</div>
					<div
						class="flex items-center gap-1 px-2 py-1 rounded-lg border border-base-400 bg-base-100"
					>
						<ChevronLeft class="w-3 h-3 text-content/60" />
						<ChevronRight class="w-3 h-3 text-content/60" />
					</div>
				</div>
				<div class="grid grid-cols-7">
					{#each dayHeaders as h (h)}
						<div
							class="px-1.5 py-2 text-center text-xs font-semibold text-content/40 border-b border-base-300"
						>
							{h}
						</div>
					{/each}
					{#each weeks as week (week[0].day)}
						{#each week as cell (cell.day)}
							<div
								class="flex flex-col items-start p-1.5 min-h-[48px] border-b border-r border-base-300 transition-colors {cell.isCurrent
									? ''
									: 'opacity-30'} {cell.isToday ? 'bg-calendar-400' : 'bg-transparent'}"
							>
								<span
									class="text-xs font-semibold leading-none mb-auto {cell.isToday
										? 'bg-calendar-100 text-base-100 rounded-full w-5 h-5 flex items-center justify-center'
										: 'text-content/60'}"
								>
									{cell.day}
								</span>
								{#if cell.hasEvent}
									<div class="flex flex-wrap gap-0.5 mt-auto pt-0.5">
										<span class="pointer-events-none" style="color: var(--color-primary-100)">
											<Book class="w-3.5 h-3.5" />
										</span>
									</div>
								{/if}
							</div>
						{/each}
					{/each}
				</div>
			</div>
		</div>

		<div class="flex justify-between">
			<button
				onclick={onPrev}
				class="h-10 px-5 text-sm text-content/60 hover:text-content border border-base-400 rounded-lg hover:bg-base-200 transition-colors font-medium cursor-pointer"
			>
				Anterior
			</button>
			<button
				onclick={onNext}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 4}
		<div class="space-y-5">
			<div class="flex items-center gap-2">
				<TrendingUp class="w-5 h-5 text-grades-100" />
				<h3 class="text-base font-bold text-content">Notas y Escenarios</h3>
			</div>
			<p class="text-sm text-content/60">
				Crea ecuaciones personalizadas para cada ramo y simula escenarios con predicciones de
				probabilidad.
			</p>

			<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-1.5">
						<TrendingUp class="h-4 w-4 text-grades-100" />
						<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">
							Probabilidades
						</h3>
					</div>
					<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md"
						>2026-1</span
					>
				</div>
				<div class="space-y-1">
					{#each probRows as ramo (ramo.name)}
						<div
							class="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 hover:bg-base-200 transition-colors"
						>
							<div
								class="w-3 h-3 rounded-full shrink-0"
								style="background-color: {ramo.color}"
							></div>
							<span class="text-xs lg:text-sm lg:w-20 font-bold text-content w-16 truncate shrink-0"
								>{ramo.name}</span
							>
							<div class="flex-1 h-3 bg-base-300 rounded-full overflow-hidden">
								<div
									class="h-full {ramo.barCls} rounded-full transition-all"
									style="width: {ramo.pct}%"
								></div>
							</div>
							<span class="text-xs font-bold tabular-nums {ramo.labelCls} w-10 text-right"
								>{ramo.label}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex items-center gap-2 text-xs text-content/40 justify-center">
				<GraduationCap class="w-4 h-4" />
				<span>3 ramos · 4 escenarios · 1 garantizado</span>
			</div>
		</div>

		<div class="flex justify-between">
			<button
				onclick={onPrev}
				class="h-10 px-5 text-sm text-content/60 hover:text-content border border-base-400 rounded-lg hover:bg-base-200 transition-colors font-medium cursor-pointer"
			>
				Anterior
			</button>
			<button
				onclick={onNext}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 5}
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<LayoutDashboard class="w-5 h-5 text-primary-100" />
				<h3 class="text-base font-bold text-content">Panel Principal</h3>
			</div>
			<p class="text-sm text-content/60">
				Tu resumen inteligente: todo lo que necesitas saber de un vistazo.
			</p>

			<div
				class="flex items-center gap-3 bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm"
			>
				<div class="w-1 h-12 rounded-full shrink-0" style="background-color: #ef4444"></div>
				<Book class="h-5 w-5 shrink-0" style="color: #ef4444" />
				<div class="min-w-0 flex-1">
					<div class="text-sm font-bold text-content">Matemáticas</div>
					<div class="flex items-center gap-2 mt-0.5">
						<span
							class="text-xs font-bold bg-base-200 border border-base-300 px-1.5 py-0.5 rounded text-content/70"
							>10:00</span
						>
						<div class="flex items-center gap-1">
							<div class="w-1.5 h-1.5 bg-success-100 rounded-full animate-pulse"></div>
							<span class="text-xs font-bold text-success-100">En curso</span>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm">
				<div class="flex items-center gap-1.5 mb-2">
					<CalendarDays class="h-4 w-4 text-calendar-100" />
					<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">
						Próximos eventos
					</h3>
				</div>
				<button
					class="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left hover:bg-base-200 transition-colors cursor-default"
				>
					<div class="flex flex-col items-center min-w-[36px]">
						<span class="text-xs font-bold text-content/40 uppercase">lun</span>
						<span class="text-lg font-bold text-content leading-tight">15</span>
					</div>
					<Book class="h-4 w-4 shrink-0" style="color: #ef4444" />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-bold text-content truncate">Examen parcial</div>
						<div class="text-xs text-content/50">Matemáticas</div>
					</div>
					<span class="text-xs font-mono text-content/40 shrink-0">10:00</span>
				</button>
			</div>

			<div class="bg-base-100 border border-base-400 rounded-xl p-4 shadow-sm">
				<div class="flex items-center gap-1.5 mb-3">
					<Activity class="h-4 w-4 text-schedule-100" />
					<h3 class="text-xs font-bold text-content/50 uppercase tracking-widest">Carga Mensual</h3>
					<span class="text-xs font-bold text-content/60 bg-base-300 px-2 py-0.5 rounded-md ml-auto"
						>junio 2026</span
					>
				</div>
				<svg viewBox="0 0 {cSvgW} {cSvgH}" class="w-full h-auto">
					{#each Array.from({ length: cN }, (_, idx) => idx) as i (i)}
						{@const x = i === 0 ? cChartL : cChartL + (i / (cN - 1)) * cChartW}
						<line
							x1={x}
							x2={x}
							y1={cChartT}
							y2={cChartB}
							stroke="currentColor"
							class="text-base-200"
							stroke-width="0.5"
						/>
					{/each}
					<line
						x1={cChartL}
						x2={cChartR}
						y1={cChartB}
						y2={cChartB}
						stroke="currentColor"
						class="text-base-300"
						stroke-width="1"
					/>
					<polygon
						points={[cChartL, cChartB]
							.concat(
								chartData
									.map((v, i) => {
										const x = i === 0 ? cChartL : cChartL + (i / (cN - 1)) * cChartW;
										const y = cChartB - (v / maxV) * cChartH;
										return [x, y];
									})
									.flat()
							)
							.concat([cChartL + cChartW, cChartB])
							.join(' ')}
						fill="var(--color-schedule-100)"
						fill-opacity="0.12"
					/>
					<polyline
						fill="none"
						stroke="var(--color-schedule-100)"
						stroke-width="1.5"
						stroke-linejoin="round"
						stroke-linecap="round"
						points={chartData
							.map((v, i) => {
								const x = i === 0 ? cChartL : cChartL + (i / (cN - 1)) * cChartW;
								const y = cChartB - (v / maxV) * cChartH;
								return `${x},${y}`;
							})
							.join(' ')}
					/>
					{#each chartData as v, i (i)}
						{@const x =
							i === 0
								? cChartL + 1.5
								: i === cN - 1
									? cChartR - 1.5
									: cChartL + (i / (cN - 1)) * cChartW}
						{@const y = cChartB - (v / maxV) * cChartH}
						<circle cx={x} cy={y} r="1.5" fill="var(--color-schedule-100)" />
					{/each}
					{#each Array.from({ length: cN }, (_, idx) => idx) as i (i)}
						{@const x =
							i === 0 ? cChartL : i === cN - 1 ? cChartR : cChartL + (i / (cN - 1)) * cChartW}
						<text
							{x}
							y={cSvgH - 2}
							text-anchor={i === 0 ? 'start' : i === cN - 1 ? 'end' : 'middle'}
							fill="currentColor"
							class="text-content/30"
							font-size="6">{i + 1}</text
						>
					{/each}
				</svg>
			</div>
		</div>

		<div class="flex justify-between">
			<button
				onclick={onPrev}
				class="h-10 px-5 text-sm text-content/60 hover:text-content border border-base-400 rounded-lg hover:bg-base-200 transition-colors font-medium cursor-pointer"
			>
				Anterior
			</button>
			<button
				onclick={onFinish}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Finalizar
			</button>
		</div>
	{/if}
</div>
