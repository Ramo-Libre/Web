import type { ScheduleSerial } from '$lib/features/schedule.svelte';
import type { RamosSerial } from '$lib/features/ramos.svelte';
import type { EscenariosSerial } from '$lib/features/notas.svelte';
import type { TodosSerial } from '$lib/features/todos.svelte';

export interface MockDataInputV2 {
	semestres: number;
	ramos: number;
	oneoff: number;
	recurrent: number;
	escenarios: number;
	todos: number;
}

export type SemestreEntryV2 = {
	id: string;
	name: string;
	ramos: RamosSerial;
	schedule: ScheduleSerial;
	escenarios: EscenariosSerial;
	todos: TodosSerial;
};

export type MockDataOutputV2 = {
	semestres: { id: string; name: string }[];
	active: string;
	data: Record<string, SemestreEntryV2>;
};
