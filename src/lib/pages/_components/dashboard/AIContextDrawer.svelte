<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { buildGlobalContext } from '$lib/ai/context-global';
	import { buildSemestresRamosContext } from '$lib/ai/context-semestres-ramos';
	import { buildHorariosContext } from '$lib/ai/context-horarios';
	import { buildCalendarioContext } from '$lib/ai/context-calendario';
	import { buildNotasContext } from '$lib/ai/context-notas';
	import { buildConfiguracionContext } from '$lib/ai/context-configuracion';
	import { buildDashboardContext } from '$lib/ai/context-dashboard';

	type ContextItem = {
		label: string;
		desc: string;
		build: () => string;
	};

	const contexts: ContextItem[] = [
		{
			label: 'General',
			desc: 'Visión general de todas las funcionalidades.',
			build: buildGlobalContext
		},
		{
			label: 'Semestres y Ramos',
			desc: 'Gestión de períodos académicos y asignaturas.',
			build: buildSemestresRamosContext
		},
		{
			label: 'Horarios',
			desc: 'Eventos recurrentes y horario semanal.',
			build: buildHorariosContext
		},
		{
			label: 'Calendario',
			desc: 'Vista mensual de eventos.',
			build: buildCalendarioContext
		},
		{
			label: 'Notas',
			desc: 'Escenarios de evaluación y resultados.',
			build: buildNotasContext
		},
		{
			label: 'Configuración',
			desc: 'Preferencias y ajustes del sistema.',
			build: buildConfiguracionContext
		},
		{
			label: 'Panel Principal',
			desc: 'Resumen del dashboard y sus secciones.',
			build: buildDashboardContext
		}
	];

	let copied = $state<Record<string, boolean>>({});

	async function copy(id: string, build: () => string) {
		const ok = await copyToClipboard(build());
		if (ok) {
			copied = { ...copied, [id]: true };
			setTimeout(() => {
				copied = { ...copied, [id]: false };
			}, 2000);
		}
	}
</script>

<div class="space-y-3">
	<p class="text-sm text-content/60">
		Copía el contexto de una sección para ayudar a una IA a entender cómo funciona RamoLibre.
	</p>

	<div class="space-y-2">
		{#each contexts as ctx, i}
			<button
				onclick={() => copy(String(i), ctx.build)}
				class="flex items-center gap-3 w-full p-3 rounded-lg border border-base-400 bg-base-100 {copied[
					String(i)
				]
					? 'border-success-100 bg-success-100/5'
					: 'hover:bg-base-200'} transition-all text-left cursor-pointer"
			>
				<div
					class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 {copied[String(i)]
						? 'bg-success-100 text-base-100'
						: 'bg-base-200 text-content/50'}"
				>
					{#if copied[String(i)]}
						<Check class="w-4 h-4" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-sm font-bold text-content">{ctx.label}</div>
					<div class="text-xs text-content/50 truncate">{ctx.desc}</div>
				</div>
			</button>
		{/each}
	</div>
</div>
