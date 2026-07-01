import type { MockDataInputV2, MockDataOutputV2 } from './types-v2';
export type { MockDataOutputV2 };

export interface LogEntry {
	id: number;
	icon: string;
	label: string;
	detail: string;
	indent: number;
}

export async function simulate(input: MockDataInputV2): Promise<{ logs: LogEntry[]; data: MockDataOutputV2 }> {
	const { default: Gen } = await import('$lib/dev-tools/gen-v2');
	const data = Gen.generate(input);

	const logs: LogEntry[] = [];
	let id = 0;

	for (const sem of data.semestres) {
		logs.push({ id: id++, icon: '📦', label: 'Semestre', detail: `${sem.id.slice(0, 8)}… · ${sem.name}`, indent: 0 });

		const semData = data.data[sem.id];
		if (!semData) continue;

		for (const [, ramo] of semData.ramos) {
			logs.push({ id: id++, icon: '📚', label: 'Ramo', detail: `${ramo.name} · ${ramo.color}`, indent: 1 });
		}

		for (const [, event] of semData.schedule) {
			if (event.date) {
				logs.push({
					id: id++,
					icon: '📅',
					label: 'OneOff',
					detail: `${event.title} — ${event.date} · ${event.category}${event.ramoId ? ' · con ramo' : ''}`,
					indent: 1
				});
			} else if (event.daysOfWeek && event.daysOfWeek.length > 0) {
				logs.push({
					id: id++,
					icon: '🔄',
					label: 'Recurrent',
					detail: `${event.title} — días ${event.daysOfWeek.join(',')} ${event.startTime}-${event.endTime} · ${event.category}${event.ramoId ? ' · con ramo' : ''}`,
					indent: 1
				});
			}
		}

		for (const [, esc] of semData.escenarios) {
			const ramoName = esc.ramoId
				? semData.ramos.find(([rid]) => rid === esc.ramoId)?.[1]?.name ?? '?'
				: 'standalone';
			const varCount = Object.keys(esc.variableEntries).length;
			logs.push({
				id: id++,
				icon: '🎯',
				label: 'Escenario',
				detail: `${esc.name} · ${ramoName} · ${varCount} variables`,
				indent: 1
			});
		}
	}

	const totalRamos = logs.filter((l) => l.icon === '📚').length;
	const totalOneoff = logs.filter((l) => l.icon === '📅').length;
	const totalRecurrent = logs.filter((l) => l.icon === '🔄').length;
	const totalEscenarios = logs.filter((l) => l.icon === '🎯').length;

	logs.push({
		id: id++,
		icon: '✅',
		label: 'Simulación completada',
		detail: `${data.semestres.length} semestre(s), ${totalRamos} ramo(s), ${totalOneoff} oneoff(s), ${totalRecurrent} recurrente(s), ${totalEscenarios} escenario(s). Ningún cambio aplicado.`,
		indent: 0
	});

	return { logs, data };
}
