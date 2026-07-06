<script lang="ts">
	import {
		BookMarked,
		CalendarCheck,
		CalendarDays,
		GraduationCap,
		TrendingUp
	} from '@lucide/svelte';
	import type { LegacyCounts } from '$lib/infra/migrate-legacy';
	import { onMount } from 'svelte';
	import { semestre } from '$lib/infra/semestres.svelte';

	interface Props {
		counts: LegacyCounts;
		onmigrate: () => void;
		ondiscard: () => void;
		loading?: boolean;
	}

	let { counts, onmigrate, ondiscard, loading = false }: Props = $props();

	onMount(() => {
		semestre.preferences.applyTheme();
	});
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center">
	<div class="absolute inset-0 bg-black/60 z-0"></div>

	<div
		class="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
	>
		<div class="text-lg font-bold text-content mb-2">Datos de la versión anterior encontrados</div>
		<p class="text-sm text-content/60 mb-5">
			Se encontraron datos guardados en el sistema anterior. ¿Qué querés hacer con ellos?
		</p>

		<div class="space-y-2.5 mb-5">
			<div class="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
				<div class="p-1.5 bg-base-300 rounded-lg">
					<GraduationCap class="w-4 h-4 text-content/70" />
				</div>
				<div class="flex-1 text-sm">
					<span class="text-content font-semibold">{counts.semesters}</span>
					<span class="text-content/60"> semestres</span>
				</div>
			</div>

			<div class="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
				<div class="p-1.5 bg-base-300 rounded-lg">
					<BookMarked class="w-4 h-4 text-content/70" />
				</div>
				<div class="flex-1 text-sm">
					<span class="text-content font-semibold">{counts.ramos}</span>
					<span class="text-content/60"> ramos</span>
				</div>
			</div>

			<div class="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
				<div class="p-1.5 bg-base-300 rounded-lg">
					<CalendarCheck class="w-4 h-4 text-content/70" />
				</div>
				<div class="flex-1 text-sm">
					<span class="text-content font-semibold">{counts.horarios}</span>
					<span class="text-content/60"> horarios</span>
				</div>
			</div>

			<div class="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-base-300">
				<div class="p-1.5 bg-base-300 rounded-lg">
					<CalendarDays class="w-4 h-4 text-content/70" />
				</div>
				<div class="flex-1 text-sm">
					<span class="text-content font-semibold">{counts.events}</span>
					<span class="text-content/60"> eventos</span>
				</div>
			</div>

			{#if counts.notasRamos > 0}
				<div class="flex items-center gap-3 p-3 bg-base-200 rounded-xl border border-warning-300">
					<div class="p-1.5 bg-base-300 rounded-lg">
						<TrendingUp class="w-4 h-4 text-warning-600" />
					</div>
					<div class="flex-1 text-sm">
						<span class="text-content font-semibold">{counts.notasRamos}</span>
						<span class="text-content/60">
							ramos con evaluaciones (no migrables al nuevo sistema)</span
						>
					</div>
				</div>
			{/if}

			<p class="text-xs text-content/60 leading-relaxed">
				Los datos migrados pueden no verse exactamente igual en la nueva versión. Algunos campos
				como <span class="font-semibold text-content/80">prioridad</span>
				y
				<span class="font-semibold text-content/80">estado de completado</span> de eventos no se conservan,
				y las evaluaciones y restricciones del sistema anterior no se migran al nuevo sistema de escenarios.
			</p>
		</div>

		<div class="flex flex-col gap-2">
			<button
				type="button"
				class="w-full cursor-pointer py-3 px-4 rounded-xl bg-primary-100 text-base-100 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				disabled={loading}
				onclick={onmigrate}
			>
				{#if loading}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				Migrar mis datos
			</button>
			<button
				type="button"
				class="w-full cursor-pointer py-3 px-4 rounded-xl bg-error-300 border border-error-400 text-content text-sm font-bold hover:bg-error-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={loading}
				onclick={ondiscard}
			>
				Empezar de cero
			</button>
		</div>
	</div>
</div>
