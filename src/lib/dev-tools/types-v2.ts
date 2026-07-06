import type { ScheduleSerial } from '$lib/features/schedule.svelte';
import type { RamosSerial } from '$lib/features/ramos.svelte';
import type { EscenariosSerial } from '$lib/features/notas.svelte';

export interface MockDataInputV2 {
	semestres: number;
	ramos: number;
	oneoff: number;
	recurrent: number;
	escenarios: number;
}

export type SemestreEntryV2 = {
	id: string;
	name: string;
	ramos: RamosSerial;
	schedule: ScheduleSerial;
	escenarios: EscenariosSerial;
};

export type MockDataOutputV2 = {
	semestres: { id: string; name: string }[];
	active: string;
	data: Record<string, SemestreEntryV2>;
};
