<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import type { HorarioDay, HorarioType } from '$lib/state/horarios.svelte';
	import { BookOpen, FlaskConical, Users, Hammer, MapPin } from '@lucide/svelte';

	// --- MAPAS Y CONSTANTES ---
	const dayOrder: Record<HorarioDay, number> = { L: 1, M: 2, X: 3, J: 4, V: 5, S: 6 };
	const dayNames: Record<HorarioDay, string> = {
		L: 'Lunes',
		M: 'Martes',
		X: 'Miércoles',
		J: 'Jueves',
		V: 'Viernes',
		S: 'Sábado'
	};

	const typeIcons = {
		book: BookOpen,
		lab: FlaskConical,
		assist: Users,
		taller: Hammer
	};

	// Traducción de los tipos para la UI
	const typeLabels: Record<HorarioType, string> = {
		book: 'Clase',
		lab: 'Laboratorio',
		assist: 'Ayudantía',
		taller: 'Taller'
	};

	// --- ESTADO TEMPORAL ---
	// Mantenemos un reloj simple por si quieres resaltar la clase actual
	let now = $state(new Date());
	$effect(() => {
		const interval = setInterval(() => (now = new Date()), 60000);
		return () => clearInterval(interval);
	});

	const currentDayId = $derived(
		Object.keys(dayOrder).find(
			(key) => dayOrder[key as HorarioDay] === (now.getDay() === 0 ? 7 : now.getDay())
		) as HorarioDay
	);
	const currentMin = $derived(now.getHours() * 60 + now.getMinutes());

	const toMinutes = (t: string) => {
		const [hh, mm] = t.split(':').map(Number);
		return hh * 60 + mm;
	};

	// --- LÓGICA DE PROCESAMIENTO ---
	// Agrupamos los horarios dentro de cada ramo
	const galleryData = $derived.by(() => {
		const ramosList = db.ramos.list; // Array de [id, Ramo]
		const horariosList = db.horarios.list.map(([, h]) => h); // Array de Horario

		return ramosList.map(([id, ramo]) => {
			// Filtramos y ordenamos los horarios de este ramo
			const mySchedules = horariosList
				.filter((h) => h.ramoId === id)
				.sort((a, b) => {
					// Primero ordenamos por día
					if (dayOrder[a.day] !== dayOrder[b.day]) {
						return dayOrder[a.day] - dayOrder[b.day];
					}
					// Luego por hora de inicio
					return toMinutes(a.start) - toMinutes(b.start);
				})
				.map((h) => {
					// Calculamos si esta clase está ocurriendo AHORA
					const isToday = h.day === currentDayId;
					const startM = toMinutes(h.start);
					const endM = toMinutes(h.end);
					const isActive = isToday && currentMin >= startM && currentMin <= endM;

					return { ...h, isActive };
				});

			return {
				id,
				nombre: ramo.nombre,
				color: ramo.color,
				estado: ramo.estado,
				schedules: mySchedules
			};
		});
	});
</script>

{#if galleryData.length === 0}
	<div class="text-center py-20 text-slate-400">
		<BookOpen class="w-12 h-12 mx-auto mb-3 opacity-20" />
		<p>No hay ramos agregados todavía.</p>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
		{#each galleryData as ramo (ramo.id)}
			<div
				class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
			>
				<div
					class="p-5 border-b border-slate-100 flex items-start gap-4"
					style="background: linear-gradient(to bottom right, {ramo.color}15, transparent);"
				>
					<div
						class="w-4 h-4 rounded-full shrink-0 mt-1 shadow-sm"
						style="background-color: {ramo.color}"
					></div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-slate-800 leading-tight mb-1">
							{ramo.nombre}
						</h3>

						{#if ramo.estado}
							<span
								class="inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md
                                    {ramo.estado === 'guaranteed'
									? 'bg-green-100 text-green-700'
									: ramo.estado === 'possible'
										? 'bg-blue-100 text-blue-700'
										: 'bg-red-100 text-red-700'}"
							>
								{ramo.estado === 'guaranteed'
									? 'Garantizado'
									: ramo.estado === 'possible'
										? 'Posible'
										: 'Imposible'}
							</span>
						{/if}
					</div>
				</div>

				<div class="p-5 flex-1 bg-white">
					{#if ramo.schedules.length === 0}
						<div class="text-sm text-slate-400 italic text-center py-4">Sin horarios asignados</div>
					{:else}
						<div class="space-y-3">
							{#each ramo.schedules as sch (sch.id)}
								{@const Icon = typeIcons[sch.type] || BookOpen}

								<div
									class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border {sch.isActive
										? 'bg-blue-50/50 border-blue-200'
										: 'bg-slate-50/50 border-slate-100'} gap-2"
								>
									<div class="flex items-center gap-3">
										<div class="w-10 text-center">
											<span class="block text-[10px] font-bold uppercase text-slate-500"
												>{dayNames[sch.day].slice(0, 3)}</span
											>
										</div>
										<div>
											<div
												class="flex items-center gap-1.5 font-bold {sch.isActive
													? 'text-blue-700'
													: 'text-slate-700'}"
											>
												{#if sch.isActive}
													<div class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
												{/if}
												{sch.start} - {sch.end}
											</div>
											<div
												class="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5"
											>
												<Icon class="w-3 h-3" />
												{typeLabels[sch.type]}
											</div>
										</div>
									</div>

									{#if sch.location}
										<div
											class="flex justify-center items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm"
										>
											<MapPin class="w-3.5 h-3.5 text-slate-400" />
											<span class="truncate max-w-[120px]">{sch.location}</span>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
