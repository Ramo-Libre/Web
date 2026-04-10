import { faker } from '@faker-js/faker/locale/es';
import type { EventsSerial } from '$lib/state/events.svelte';
import type { HorarioDay, HorariosSerial, HorarioType } from '$lib/state/horarios.svelte';
import { DEFAULT_CONTEXTO, DEFAULT_PERFIL, type NotasSerial } from '$lib/state/notas.svelte';
import type { RamosSerial } from '$lib/state/ramos.svelte';
import type { SemestresSerial } from '$lib/state/semestres.svelte';
import { generateUUID } from '$lib/utils/crypto';
import { ColorUtils } from '$lib/utils/colors';

export interface MockDataInput {
	// Semestres a generar
	semestres: number;
	// Ramos por semestre
	ramos: number;
	// Eventos por semestre
	eventos: number;
	// Horarios por semestre
	horarios: number;
	// Notas por semestre
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

class MockDataGenerator {
	public static generate(input: MockDataInput): MockDataOutput {
		const { semestres, ramos, eventos, horarios, notas } = input;
		const semestresSerial = this.generateSemestres(semestres);
        const semestresData = {} as MockDataOutput['semestres_data'];
		for (const semestre of semestresSerial.list) {
			const ramosSerial = this.generateRamos(ramos);
			const eventosSerial = this.generateEventos(eventos, ramosSerial);
			const horariosSerial = this.generateHorarios(horarios, ramosSerial);
			const notasSerial = this.generateNotas(notas, ramosSerial);
			semestresData[semestre] = {
                ramos: ramosSerial,
                notas: notasSerial,
                eventos: eventosSerial,
                horarios: horariosSerial
            };
        }
		return {
			semestres: semestresSerial,
			semestres_data: semestresData
		};
	}

	private static generateSemestres(semestres: number): SemestresSerial {
		const semestresSerial: SemestresSerial = {
			active: null,
			list: []
		};

		for (let i = 0; i < semestres; i++) {
			const date = faker.date.between({ from: new Date(2000, 0, 1), to: new Date() });
			const year = date.getFullYear();
			const semestre = `${year}-${i + 1}`;
			semestresSerial.list.push(semestre);
		}
		semestresSerial.list.sort();
		semestresSerial.active = semestresSerial.list.length - 1;

		return semestresSerial;
	}

	private static generateRamos(ramos: number): RamosSerial {
		const ramosData = new Map([] as RamosSerial);
		for (let i = 0; i < ramos; i++) {
			const ramoId = generateUUID();
			const nombre = `${faker.string.alpha({ length: { min: 2, max: 5 }, casing: 'upper' })}-${faker.number.romanNumeral({ min: 1, max: 20 })}`;
			const color = ColorUtils.getRandomColor();
			ramosData.set(ramoId, { nombre, color });
		}

		return Array.from(ramosData.entries()) as RamosSerial;
	}

	private static generateEventos(eventos: number, ramosSerial: RamosSerial): EventsSerial {
		const eventosData = new Map([] as EventsSerial);
		const prioritys = ['low', 'medium', 'high'];
		const ramos = new Map(ramosSerial);
		const ramosIds = Array.from(ramos.keys());
		for (let i = 0; i < eventos; i++) {
			const hasRamo = faker.datatype.boolean({ probability: 0.7 });
			const ramoId = hasRamo ? faker.helpers.arrayElement(ramosIds) : undefined;
			const year = new Date().getFullYear();
			// dueDate format YYYY-MM-DD
			const dueDate = faker.date
				.between({ from: new Date(year, 0, 1), to: new Date(year, 11, 31) })
				.toISOString()
				.split('T')[0];
			const location = faker.datatype.boolean({ probability: 0.5 })
				? faker.location.street()
				: undefined;
			const title = faker.lorem.sentence({ min: 3, max: 6 });
			const description = faker.datatype.boolean({ probability: 0.5 })
				? faker.lorem.paragraph()
				: undefined;
			const priority = faker.helpers.arrayElement(prioritys) as 'low' | 'medium' | 'high';
			const completed = faker.datatype.boolean();
			const id = generateUUID();
			eventosData.set(id, {
				id,
				ramoId,
				dueDate,
				location,
				title,
				description,
				priority,
				completed
			});
		}

		return Array.from(eventosData.entries()) as EventsSerial;
	}

	private static generateHorarios(horarios: number, ramosSerial: RamosSerial): HorariosSerial {
		const horariosData = new Map([] as HorariosSerial);
		const ramos = new Map(ramosSerial);
		const ramosIds = Array.from(ramos.keys());
		const days = ['L', 'M', 'X', 'J', 'V', 'S'];
		const tipos = ['book', 'lab', 'assist', 'taller'];
		for (let i = 0; i < horarios; i++) {
			const ramoId = faker.helpers.arrayElement(ramosIds);
			const day = faker.helpers.arrayElement(days) as HorarioDay;
			const tipo = faker.helpers.arrayElement(tipos) as HorarioType;
			// start/end format HH:mm
			const startHour = faker.number.int({ min: 8, max: 18 });
			const startMinute = faker.helpers.arrayElement([0, 30]);
			const start = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
			const endHour = startHour + faker.number.int({ min: 1, max: 3 });
			const endMinute = faker.helpers.arrayElement([0, 30]);
			const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
			const location = faker.datatype.boolean({ probability: 0.5 })
				? faker.location.street()
				: undefined;
			const id = generateUUID();
			horariosData.set(id, {
				id,
				ramoId,
				day,
				start,
				end,
				location,
				type: tipo
			});
		}

		return Array.from(horariosData.entries()) as HorariosSerial;
	}

	private static generateNotas(notas: number, ramosSerial: RamosSerial): NotasSerial {
		const notasData = new Map([] as NotasSerial['ramos']);
		const ramos = new Map(ramosSerial);
		const ramosIds = Array.from(ramos.keys());
		// Distribuir las notas aleatoriamente entre los ramos
		let restingNotas = notas;
		const ns_notas = new Array(ramosIds.length).fill(0);
		while (restingNotas > 0) {
			const ramoIndex = faker.number.int({ min: 0, max: ramosIds.length - 1 });
			ns_notas[ramoIndex]++;
			restingNotas--;
		}

		for (let i = 0; i < ramosIds.length; i++) {
			const ramoId = ramosIds[i];
			const n_notas = ns_notas[i];
			const notasList = [];
			const n_tags = Math.ceil(n_notas / 4);
			const tagList = new Array(n_tags).fill(0).map(() => faker.lorem.word());
			const notas_per_tag = new Array(n_tags).fill(0);
			// Generar las notas base sin peso para el ramo actual
			for (let j = 0; j < n_notas; j++) {
				const id = generateUUID();
				const tag = faker.helpers.arrayElement(tagList);
				const tagIndex = tagList.indexOf(tag);
				notas_per_tag[tagIndex]++;
				const nombre = `${tag[0].toUpperCase()}${notas_per_tag[tagIndex]++}`;
				const has_valor_actual = faker.datatype.boolean({ probability: 0.7 });
				const valor_actual = has_valor_actual
					? faker.number.float({
							min: DEFAULT_CONTEXTO.nota_minima,
							max: DEFAULT_CONTEXTO.nota_maxima,
							fractionDigits: 2
						})
					: null;
				notasList.push({
					id,
					nombre,
					valor_actual,
					tags: [tag],
					peso: 0.0
				});
			}
			// Asignar pesos a las notas del ramo actual, asegurando que sumen 1
			const pesos = new Array(n_notas)
				.fill(0)
				.map(() => faker.number.float({ min: 0.01, max: 1, fractionDigits: 2 }));
			const pesoSum = pesos.reduce((a, b) => a + b, 0);
			for (let j = 0; j < n_notas; j++) {
                notasList[j].peso = parseFloat((pesos[j] / pesoSum).toFixed(2)) * 100;
			}
			notasData.set(ramoId, {
				perfil: DEFAULT_PERFIL,
				contexto: DEFAULT_CONTEXTO,
				tags: tagList.map((tag) => [
					generateUUID(),
					{ name: tag, color: ColorUtils.getRandomColor() }
				]),
				restricciones: [],
				evaluaciones: notasList.map((nota) => [
					nota.id,
					{
						id: nota.nombre,
						peso: nota.peso,
						valor_actual: nota.valor_actual,
						tags: nota.tags
					}
				])
			});
		}

		return {
			last_contexto: DEFAULT_CONTEXTO,
			last_perfil: DEFAULT_PERFIL,
			ramos: Array.from(notasData.entries()) as NotasSerial['ramos']
		};
	}
}

export default MockDataGenerator;
