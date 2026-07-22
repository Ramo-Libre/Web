import {
	parse,
	type ICalRecur,
	type ByDayRule,
	type ICalDateTime,
	type ICalDate
} from '@pipobscure/ical';
import type { ScheduleCategory } from '$lib/features/schedule.svelte';
import { SCHEDULE_DESC_MAX_LENGTH } from '$lib/features/schedule.svelte';
import { generateUUID } from '$lib/utils/crypto';

export interface ParsedEvent {
	uid: string;
	title: string;
	daysOfWeek?: number[];
	date?: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	description?: string;
	category: ScheduleCategory;
	selected: boolean;
}

export interface DescriptionOptions {
	includeLocation: boolean;
	includeDescription: boolean;
}

const ICS_DAY_TO_NUMBER: Record<string, number> = {
	MO: 1,
	TU: 2,
	WE: 3,
	TH: 4,
	FR: 5,
	SA: 6,
	SU: 7
};

function extractDayNumber(dt: ICalDateTime | ICalDate): number {
	const date = new Date(dt.year, dt.month - 1, dt.day);
	return date.getDay() === 0 ? 7 : date.getDay();
}

function extractTime(dt: ICalDateTime): string {
	return `${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}`;
}

function extractDate(dt: ICalDateTime | ICalDate): string {
	return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

function extractDaysFromRRule(rrule: ICalRecur, dtstart: ICalDateTime | ICalDate | null): number[] {
	if (rrule.byday && rrule.byday.length > 0) {
		return rrule.byday.map((day: ByDayRule) => ICS_DAY_TO_NUMBER[day.day]).filter(Boolean);
	}
	if (dtstart) {
		return [extractDayNumber(dtstart)];
	}
	return [];
}

function getGroupKey(event: ParsedEvent): string {
	const day = event.daysOfWeek?.[0] ?? event.date ?? '';
	return `${event.title}|${event.location ?? ''}|${event.description ?? ''}|${day}`;
}

function timeToMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
}

function mergeConsecutiveEvents(events: ParsedEvent[]): ParsedEvent[] {
	const groups = new Map<string, ParsedEvent[]>();

	for (const event of events) {
		if (!event.startTime || !event.endTime) {
			const key = `standalone|${event.uid}`;
			groups.set(key, [event]);
			continue;
		}
		const key = getGroupKey(event);
		const group = groups.get(key) ?? [];
		group.push(event);
		groups.set(key, group);
	}

	const merged: ParsedEvent[] = [];

	for (const group of groups.values()) {
		if (group.length === 1) {
			merged.push(group[0]);
			continue;
		}

		group.sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));

		let current = { ...group[0] };

		for (let i = 1; i < group.length; i++) {
			const next = group[i];
			if (current.endTime === next.startTime) {
				current.endTime = next.endTime;
			} else {
				merged.push(current);
				current = { ...next };
			}
		}
		merged.push(current);
	}

	return merged;
}

export function parseICS(content: string): ParsedEvent[] {
	const cal = parse(content);
	const events: ParsedEvent[] = [];

	for (const event of cal.events) {
		const uid = event.uid;
		if (!uid) continue;

		const summary = event.summary || '';
		const parsed: ParsedEvent = {
			uid,
			title: summary,
			category: 'book',
			selected: true
		};

		if (event.rrules && event.rrules.length > 0) {
			const rrule = event.rrules[0];
			if (rrule.freq === 'WEEKLY') {
				parsed.daysOfWeek = extractDaysFromRRule(rrule, event.dtstart);
				if (event.dtstart && event.dtend) {
					const start = event.dtstart as ICalDateTime;
					const end = event.dtend as ICalDateTime;
					if (start.type === 'date-time' && end.type === 'date-time') {
						parsed.startTime = extractTime(start);
						parsed.endTime = extractTime(end);
					}
				}
				if (event.location) parsed.location = event.location;
				if (event.description) parsed.description = event.description;
			} else if (event.dtstart) {
				const d = event.dtstart;
				const year = new Date().getFullYear();
				parsed.date = `${year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
				if (event.location) parsed.location = event.location;
				if (event.description) parsed.description = event.description;
			}
		} else if (event.dtstart) {
			const start = event.dtstart;
			if (start.type === 'date-time') {
				parsed.date = extractDate(start);
				parsed.startTime = extractTime(start);
				if (event.dtend && event.dtend.type === 'date-time') {
					parsed.endTime = extractTime(event.dtend as ICalDateTime);
				}
			} else {
				parsed.date = extractDate(start);
			}
			if (event.location) parsed.location = event.location;
			if (event.description) parsed.description = event.description;
		}

		events.push(parsed);
	}

	return mergeConsecutiveEvents(events);
}

export function icsEventToScheduleEvent(event: ParsedEvent, options: DescriptionOptions) {
	const parts: string[] = [];
	if (options.includeLocation && event.location) parts.push(event.location);
	if (options.includeDescription && event.description) parts.push(event.description);

	const description =
		parts.length > 0 ? parts.join('\n').slice(0, SCHEDULE_DESC_MAX_LENGTH) : undefined;

	return {
		id: event.uid || generateUUID(),
		title: event.title,
		category: event.category,
		daysOfWeek: event.daysOfWeek,
		date: event.date,
		startTime: event.startTime,
		endTime: event.endTime,
		description
	};
}
