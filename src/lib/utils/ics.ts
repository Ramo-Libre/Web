import { parse, type ICalRecur, type ByDayRule, type ICalDateTime, type ICalDate } from '@pipobscure/ical';
import type { ScheduleCategory } from '$lib/features/schedule.svelte';
import { generateUUID } from '$lib/utils/crypto';

export interface ParsedEvent {
	uid: string;
	title: string;
	daysOfWeek?: number[];
	date?: string;
	startTime?: string;
	endTime?: string;
	description?: string;
	category: ScheduleCategory;
	selected: boolean;
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

function buildDescription(location: string | null, description: string | null): string | undefined {
	const parts: string[] = [];
	if (location) parts.push(location);
	if (description) parts.push(description);
	return parts.length > 0 ? parts.join('\n') : undefined;
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
				parsed.description = buildDescription(event.location, event.description);
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
			parsed.description = buildDescription(event.location, event.description);
		}

		events.push(parsed);
	}

	return events;
}

export function icsEventToScheduleEvent(event: ParsedEvent) {
	return {
		id: event.uid || generateUUID(),
		title: event.title,
		category: event.category,
		daysOfWeek: event.daysOfWeek,
		date: event.date,
		startTime: event.startTime,
		endTime: event.endTime,
		description: event.description
	};
}
