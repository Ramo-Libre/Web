<script lang="ts">
	import { Plus, Trash2, Rocket, Calendar, CalendarCheck, CalendarDays, TrendingUp, BookMarked } from '@lucide/svelte';
	import { ColorUtils } from '$lib/utils/colors';
	import { getNow } from '$lib/utils/date';

	let {
		semesterName = $bindable(''),
		ramosList = $bindable([]),
		step = $bindable(1),
		onNext,
		onPrev,
		onFinish
	}: {
		semesterName: string;
		ramosList: { name: string; color: string }[];
		step: number;
		onNext: () => void;
		onPrev: () => void;
		onFinish: () => void;
	} = $props();

	const now = getNow();
	const year = now.getFullYear();
	const semestreNum = now.getMonth() < 6 ? 1 : 2;
	const recomendado = `${year}-${semestreNum}`;
	const totalSteps = 3;

	let openColorIndex = $state<number | null>(null);
	let hasRamos = $derived(ramosList.some((r) => r.name.trim()));

	function setRamoColor(index: number, color: string) {
		ramosList[index].color = color;
		openColorIndex = null;
	}

	function setRamoName(index: number, name: string) {
		ramosList[index].name = name;
	}

	function addRamo() {
		ramosList.push({ name: '', color: ColorUtils.getRandomColor() });
	}

	function removeRamo(index: number) {
		ramosList.splice(index, 1);
		if (openColorIndex === index) openColorIndex = null;
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Progress indicator -->
	<div class="flex gap-2">
		{#each Array(totalSteps) as _, i}
			<div
				class="h-1.5 flex-1 rounded-full transition-colors {i < step ? 'bg-primary-100' : 'bg-base-300'}"
			></div>
		{/each}
	</div>

	{#if step === 1}
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<Rocket class="w-5 h-5 text-primary-100" />
				<h3 class="text-base font-bold text-content">Nombre del Semestre</h3>
			</div>
			<p class="text-sm text-content/60">Escribe el nombre del periodo académico.</p>
			<div class="relative">
				<Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content/30" />
				<input
					type="text"
					bind:value={semesterName}
					placeholder={recomendado}
					onkeydown={(e) => e.key === 'Enter' && semesterName.trim() && onNext()}
					class="w-full h-11 pl-10 pr-4 text-sm bg-base-100 text-content placeholder-content/40 border border-base-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
				/>
			</div>
			<p class="text-xs text-content/40">
				Se usará <span class="font-mono font-medium text-content/60">{recomendado}</span> si dejas el campo vacío.
			</p>
		</div>

		<div class="flex justify-end">
			<button
				onclick={onNext}
				disabled={!semesterName.trim()}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity font-medium cursor-pointer disabled:cursor-not-allowed"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 2}
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<BookMarked class="w-5 h-5 text-classes-100" />
				<h3 class="text-base font-bold text-content">Agregar Ramos</h3>
			</div>
			<p class="text-sm text-content/60">Añade los ramos que cursarás este semestre.</p>

			<div class="space-y-3">
				{#each ramosList as ramo, i (i)}
					<div class="space-y-1.5">
						<div class="flex items-center gap-2">
							<div class="flex items-center gap-2 flex-1 min-w-0 p-2 bg-base-200 rounded-lg border border-base-400">
								<button
									class="shrink-0 w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer"
									style="background-color: {ramo.color}; border-color: {ramo.color}"
									onclick={() => (openColorIndex = openColorIndex === i ? null : i)}
									title="Elegir color"
								></button>
								<input
									type="text"
									value={ramo.name}
									oninput={(e) => setRamoName(i, (e.target as HTMLInputElement).value)}
									placeholder="Nombre del ramo"
									class="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-content placeholder-content/30 focus:ring-0 p-0"
								/>
							</div>
							<button
								onclick={() => removeRamo(i)}
								class="shrink-0 p-2 text-content/30 hover:text-error-100 transition-colors cursor-pointer"
								aria-label="Eliminar ramo"
							>
								<Trash2 size={16} />
							</button>
						</div>
						{#if openColorIndex === i}
							<div class="flex flex-wrap gap-1.5 p-2 bg-base-200 rounded-lg border border-base-300">
								{#each ColorUtils.COLORS as color}
									<button
										class="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 {ramo.color === color ? 'border-content scale-110 ring-2 ring-content/30' : 'border-transparent'} cursor-pointer"
										style="background-color: {color}"
										onclick={() => setRamoColor(i, color)}
										aria-label="Color {color}"
									></button>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<button
				onclick={addRamo}
				class="w-full h-10 text-sm border-2 border-dashed border-base-400 text-content/50 hover:text-content hover:border-content/30 rounded-lg transition-colors font-medium cursor-pointer flex items-center justify-center gap-2"
			>
				<Plus size={16} />
				Agregar otro ramo
			</button>
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
				disabled={!hasRamos}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity font-medium cursor-pointer disabled:cursor-not-allowed"
			>
				Siguiente
			</button>
		</div>
	{:else if step === 3}
		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<Rocket class="w-5 h-5 text-primary-100" />
				<h3 class="text-base font-bold text-content">Semestre listo</h3>
			</div>
			<p class="text-sm text-content/60">
				Semestre {semesterName || recomendado} con {ramosList.filter((r) => r.name.trim()).length || 0} ramos.
			</p>

			<div class="space-y-2">
				<div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg border border-base-400">
					<div class="p-2 bg-schedule-400/20 text-schedule-100 rounded-lg shrink-0">
						<CalendarCheck class="w-5 h-5" />
					</div>
					<div>
						<p class="text-sm font-bold text-content">Horarios</p>
						<p class="text-xs text-content/60">Agrega horarios semanales para tus ramos.</p>
					</div>
				</div>
				<div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg border border-base-400">
					<div class="p-2 bg-calendar-400/20 text-calendar-100 rounded-lg shrink-0">
						<CalendarDays class="w-5 h-5" />
					</div>
					<div>
						<p class="text-sm font-bold text-content">Calendario</p>
						<p class="text-xs text-content/60">Agrega eventos de tus ramos en el calendario.</p>
					</div>
				</div>
				<div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg border border-base-400">
					<div class="p-2 bg-grades-400/20 text-grades-100 rounded-lg shrink-0">
						<TrendingUp class="w-5 h-5" />
					</div>
					<div>
						<p class="text-sm font-bold text-content">Escenarios</p>
						<p class="text-xs text-content/60">Agrega la ecuación de tus ramos para recibir predicciones.</p>
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
				onclick={onFinish}
				class="h-10 px-5 text-sm bg-primary-100 text-white rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
			>
				Finalizar
			</button>
		</div>
	{/if}
</div>
