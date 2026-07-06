import { faker } from '@faker-js/faker/locale/es';
import type { ScheduleCategory, ScheduleSerial } from '$lib/features/schedule.svelte';
import type { RamosSerial } from '$lib/features/ramos.svelte';
import type { EscenariosSerial } from '$lib/features/notas.svelte';
import { generateUUID } from '$lib/utils/crypto';
import { ColorUtils } from '$lib/utils/colors';
import type { MockDataInputV2, MockDataOutputV2 } from './types-v2';

const ALL_CATEGORIES: ScheduleCategory[] = [
	'book',
	'lab',
	'assist',
	'taller',
	'exam',
	'urgent',
	'event',
	'other'
];
const ACADEMIC_CATEGORIES: ScheduleCategory[] = ['book', 'lab', 'assist', 'taller'];

export class MockDataGeneratorV2 {
	static generate(input: MockDataInputV2): MockDataOutputV2 {
		const { semestres, ramos, oneoff, recurrent, escenarios } = input;

		const year = new Date().getFullYear();

		const semEntries: { id: string; name: string }[] = [];
		for (let i = 0; i < semestres; i++) {
			semEntries.push({ id: generateUUID(), name: `${year}-${i + 1}` });
		}
		const active = semEntries[semEntries.length - 1]?.id ?? '';

		const data: MockDataOutputV2['data'] = {};
		for (const sem of semEntries) {
			const ramosSerial = this.generateRamos(ramos);
			const schedule = this.generateSchedule(oneoff, recurrent, ramosSerial);
			const escenariosSerial = this.generateEscenarios(escenarios, ramosSerial);
			data[sem.id] = {
				id: sem.id,
				name: sem.name,
				ramos: ramosSerial,
				schedule,
				escenarios: escenariosSerial
			};
		}

		return { semestres: semEntries, active, data };
	}

	private static generateRamos(count: number): RamosSerial {
		const result: RamosSerial = [];
		for (let i = 0; i < count; i++) {
			const id = generateUUID();
			const prefix = faker.string.alpha({ length: { min: 2, max: 4 }, casing: 'upper' });
			const number = faker.number.romanNumeral({ min: 1, max: 20 });
			result.push([id, { name: `${prefix}-${number}`, color: ColorUtils.getRandomColor() }]);
		}
		return result;
	}

	private static generateSchedule(
		oneoff: number,
		recurrent: number,
		ramos: RamosSerial
	): ScheduleSerial {
		const result: ScheduleSerial = [];
		const ramoIds = ramos.map(([id]) => id);

		for (let i = 0; i < oneoff; i++) {
			const id = generateUUID();
			const hasRamo = faker.datatype.boolean({ probability: 0.7 });
			const d = faker.date.between({
				from: new Date(new Date().getFullYear(), 0, 1),
				to: new Date(new Date().getFullYear(), 11, 31)
			});
			const startH = faker.number.int({ min: 8, max: 20 });
			const startM = faker.helpers.arrayElement([0, 30]);
			const durH = faker.number.int({ min: 1, max: 3 });
			result.push([
				id,
				{
					id,
					ramoId: hasRamo ? faker.helpers.arrayElement(ramoIds) : undefined,
					title: faker.lorem.sentence({ min: 3, max: 6 }),
					description: faker.datatype.boolean({ probability: 0.5 })
						? faker.lorem.paragraph()
						: undefined,
					category: faker.helpers.arrayElement(ALL_CATEGORIES),
					date: d.toISOString().split('T')[0],
					startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
					endTime: `${String(startH + durH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`
				}
			]);
		}

		for (let i = 0; i < recurrent; i++) {
			const id = generateUUID();
			const hasRamo = faker.datatype.boolean({ probability: 0.8 });
			const daysCount = faker.number.int({ min: 1, max: 3 });
			const days = faker.helpers.arrayElements([1, 2, 3, 4, 5], daysCount).sort();
			const startH = faker.number.int({ min: 8, max: 18 });
			const startM = faker.helpers.arrayElement([0, 30]);
			const durH = faker.number.int({ min: 1, max: 3 });
			result.push([
				id,
				{
					id,
					ramoId: hasRamo ? faker.helpers.arrayElement(ramoIds) : undefined,
					title: faker.lorem.sentence({ min: 3, max: 6 }),
					description: faker.datatype.boolean({ probability: 0.3 })
						? faker.lorem.paragraph()
						: undefined,
					category: faker.helpers.arrayElement(ACADEMIC_CATEGORIES),
					daysOfWeek: days,
					startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
					endTime: `${String(startH + durH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`
				}
			]);
		}

		return result;
	}

	private static generateEscenarios(count: number, ramos: RamosSerial): EscenariosSerial {
		const result: EscenariosSerial = [];
		const ramoIds = ramos.map(([id]) => id);
		const ramoMap = new Map(ramos);

		if (count === 0 || ramoIds.length === 0) return result;

		const perRamo = new Array(ramoIds.length).fill(0);
		let rest = count;
		while (rest > 0) {
			for (let i = 0; i < ramoIds.length && rest > 0; i++) {
				perRamo[i]++;
				rest--;
			}
		}

		let standaloneIdx = 1;
		for (let i = 0; i < ramoIds.length; i++) {
			for (let j = 0; j < perRamo[i]; j++) {
				const linked = faker.datatype.boolean({ probability: 0.5 });
				const ramoId = linked ? ramoIds[i] : undefined;
				const ramo = ramoId ? ramoMap.get(ramoId) : undefined;
				const name = ramo ? `Ecuacion ${ramo.name}` : `Ecuacion independiente ${standaloneIdx++}`;
				const varCount = faker.number.int({ min: 2, max: 4 });
				const vars: string[] = [];
				for (let v = 0; v < varCount; v++) {
					vars.push(`V${v + 1}`);
				}
				const weights = vars.map(() =>
					faker.number.float({ min: 0.05, max: 0.8, fractionDigits: 2 })
				);
				const sum = weights.reduce((a, b) => a + b, 0);
				const normalized = weights.map((w) => (w / sum).toFixed(2));
				const terms = vars.map((v, idx) => `${v} * ${normalized[idx]}`).join(' + ');
				const scriptRaw = `NF = ${terms}\nNF >= 55\n${vars.map((v) => `${v} in [0, 100]`).join('\n')}`;
				const variableEntries = Object.fromEntries(vars.map((v) => [v, null]));
				result.push([
					generateUUID(),
					{
						ramoId,
						name,
						scriptRaw,
						variableEntries,
						renderTypes: ['constraint'],
						lastResult: null,
						lastStrategy: 'punto_medio',
						lastHash: ''
					}
				]);
			}
		}

		return result;
	}
}

export default MockDataGeneratorV2;
