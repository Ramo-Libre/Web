<script lang="ts">
	import { faker } from '@faker-js/faker/locale/es';
	import { Radio, Send, Sparkles } from '@lucide/svelte';
	import { generateUUID } from '$lib/utils/crypto';
	import { syncRouter, type FeatureId, type ChangeAction, type EntityChange } from '$lib/infra/sync.svelte';
	import { semestre } from '$lib/infra/semestres.svelte';

	const features: { id: FeatureId; label: string }[] = [
		{ id: 'ramos', label: 'Ramos' },
		{ id: 'schedule', label: 'Horario' },
		{ id: 'escenarios', label: 'Escenarios' },
		{ id: 'preferences', label: 'Preferencias' },
		{ id: 'semesters', label: 'Semestres' }
	];

	const actions: { id: ChangeAction; label: string }[] = [
		{ id: 'created', label: 'Crear' },
		{ id: 'updated', label: 'Actualizar' },
		{ id: 'deleted', label: 'Eliminar' }
	];

	let selectedFeature = $state<FeatureId>('ramos');
	let selectedAction = $state<ChangeAction>('created');
	let lastEvent = $state<EntityChange | null>(null);
	let log = $state<string[]>([]);

	function generatePayload(feature: FeatureId): unknown {
		switch (feature) {
			case 'ramos': {
				const ramos: [string, { name: string; color: string }][] = [];
				for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
					ramos.push([generateUUID(), { name: faker.person.jobArea(), color: faker.color.rgb() }]);
				}
				return ramos;
			}
			case 'schedule': {
				const events: [string, Record<string, unknown>][] = [];
				const count = faker.number.int({ min: 3, max: 6 });
				for (let i = 0; i < count; i++) {
					const id = generateUUID();
					const isRecurring = faker.datatype.boolean();
					const event: Record<string, unknown> = {
						id,
						title: faker.lorem.words(3),
						category: faker.helpers.arrayElement(['book', 'lab', 'exam', 'taller', 'other']),
						startTime: `${faker.number.int({ min: 7, max: 20 })}:${faker.helpers.arrayElement(['00', '30'])}`,
						endTime: `${faker.number.int({ min: 8, max: 22 })}:${faker.helpers.arrayElement(['00', '30'])}`
					};
					if (isRecurring) {
						const start = faker.date.soon({ days: 30 });
						event.daysOfWeek = [faker.number.int({ min: 1, max: 7 })];
						event.recurrenceStart = start.toISOString().slice(0, 10);
						event.recurrenceEnd = faker.date.soon({ days: 90, refDate: start }).toISOString().slice(0, 10);
					} else {
						event.date = faker.date.soon({ days: 60 }).toISOString().slice(0, 10);
					}
					events.push([id, event]);
				}
				return events;
			}
			case 'escenarios': {
				const escenarios: [string, { name: string; ramoId?: string; scriptRaw: string; variableEntries: Record<string, number | null>; renderTypes: string[]; lastResult: null; lastStrategy: string; lastHash: string }][] = [];
				for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
					escenarios.push([generateUUID(), { name: faker.lorem.words(2), scriptRaw: '// Simulado', variableEntries: {}, renderTypes: ['constraint'], lastResult: null, lastStrategy: 'punto_medio', lastHash: '' }]);
				}
				return escenarios;
			}
			case 'preferences': {
				return {
					theme: faker.helpers.arrayElement(['dark', 'light']),
					schedule: { showCalendarEvents: faker.datatype.boolean(), orientation: faker.helpers.arrayElement(['normal', 'rotated']) },
					calendar: { showHorarios: faker.datatype.boolean() },
					layout: { sidebarCollapsed: faker.datatype.boolean() }
				};
			}
			case 'semesters': {
				const sems: [string, { name: string }][] = [];
				for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
					sems.push([generateUUID(), { name: faker.date.anytime().toLocaleString('es', { year: 'numeric', month: 'long' }) }]);
				}
				return { semestres: sems, active: sems[0]?.[0] ?? '' };
			}
		}
	}

	async function handleSend() {
		const payload = generatePayload(selectedFeature);

		const event: EntityChange = {
			semesterId: semestre.activeId,
			feature: selectedFeature,
			entityId: selectedAction === 'created' ? generateUUID() : generateUUID(),
			action: selectedAction,
			timestamp: Date.now(),
			deviceId: 'dev-tool',
			origin: 'remote',
			payload
		};

		await syncRouter.adapter.simulateReceiveEvents?.([event]);

		lastEvent = event;
		log = [`[${event.feature}:${event.action}] → ${event.entityId}`, ...log].slice(0, 50);
	}
</script>

<div class="bg-base-200 border border-base-300 rounded-xl overflow-hidden shadow-sm">
	<div class="bg-base-100 px-3 py-2 border-b border-base-300 flex items-center gap-1.5">
		<Radio class="h-3.5 w-3.5 text-primary-100" />
		<span class="text-[10px] font-bold text-content/50 uppercase tracking-widest">Sync Simulator</span>
	</div>

	<div class="p-3 space-y-2.5">
		<div class="grid grid-cols-2 gap-2">
			<div class="flex flex-col gap-0.5">
				<label for="sync-feature" class="text-[9px] font-bold text-content/40 uppercase tracking-wider">Entidad</label>
				<select
					id="sync-feature"
					bind:value={selectedFeature}
					class="bg-base-300 border border-base-400 rounded-md px-2 py-1 text-[11px] text-content focus:ring-2 focus:ring-primary-100/30 focus:border-primary-100 focus:outline-none transition-all w-full"
				>
					{#each features as f}
						<option value={f.id}>{f.label}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-col gap-0.5">
				<label for="sync-action" class="text-[9px] font-bold text-content/40 uppercase tracking-wider">Método</label>
				<select
					id="sync-action"
					bind:value={selectedAction}
					class="bg-base-300 border border-base-400 rounded-md px-2 py-1 text-[11px] text-content focus:ring-2 focus:ring-primary-100/30 focus:border-primary-100 focus:outline-none transition-all w-full"
				>
					{#each actions as a}
						<option value={a.id}>{a.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="flex gap-2">
			<button
				onclick={handleSend}
				class="flex-1 flex items-center justify-center gap-2 bg-primary-100 text-base-100 py-2 rounded-lg text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
			>
				<Send size={14} />
				Enviar como remoto
			</button>
		</div>

		{#if lastEvent}
			<div class="bg-base-300/60 border border-base-400 rounded-lg p-2 space-y-0.5">
				<div class="text-[10px] font-bold text-content/40 uppercase tracking-wider mb-1">Último evento</div>
				<div class="text-[11px] text-content/70 leading-snug break-all">
					{lastEvent.feature}:<span class="text-primary-100">{lastEvent.action}</span>
					entityId={lastEvent.entityId}
				</div>
				<pre class="text-[10px] text-content/40 leading-tight mt-1 max-h-[120px] overflow-auto custom-scroll">{JSON.stringify(lastEvent.payload, null, 1)}</pre>
			</div>
		{/if}

		{#if log.length > 0}
			<div class="bg-base-300/60 border border-base-400 rounded-lg overflow-y-auto max-h-[150px] custom-scroll">
				<div class="p-2 space-y-0.5">
					{#each log as entry, i}
						<div class="text-[10px] text-content/50 font-mono {i === 0 ? 'text-primary-100/80' : ''}">{entry}</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.custom-scroll::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: var(--color-base-400);
		border-radius: 4px;
	}
</style>
