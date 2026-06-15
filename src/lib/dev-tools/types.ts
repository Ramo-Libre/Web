import type { EventsSerial } from '$lib/state/events.svelte';
import type { HorariosSerial } from '$lib/state/horarios.svelte';
import type { NotasSerial } from '$lib/state/notas.svelte';
import type { RamosSerial } from '$lib/state/ramos.svelte';
import type { SemestresSerial } from '$lib/state/semestres.svelte';

export interface MockDataInput {
	semestres: number;
	ramos: number;
	eventos: number;
	horarios: number;
	notas: number;
}

export type MockDataOutput = {
	semestres: SemestresSerial;
	semestres_data: Record<
		string,
		{
			ramos: RamosSerial;
			notas: NotasSerial;
			eventos: EventsSerial;
			horarios: HorariosSerial;
		}
	>;
};
