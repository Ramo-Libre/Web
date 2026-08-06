import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { changeBus } from '$lib/infra/sync.svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export const SCHEDULE_DESC_MAX_LENGTH = 500;

export type ScheduleCategory =
	| 'book'
	| 'lab'
	| 'assist'
	| 'taller'
	| 'exam'
	| 'urgent'
	| 'event'
	| 'entrega'
	| 'viaje'
	| 'other';

export interface ScheduleEvent {
	id: string;
	ramoId?: string;
	title?: string;
	description?: string;
	category: ScheduleCategory;

	startTime?: string;
	endTime?: string;

	date?: string;
	daysOfWeek?: number[];
	recurrenceStart?: string;
	recurrenceEnd?: string;
}

export type ScheduleSerial = [string, ScheduleEvent][];

export class ScheduleManager implements Serializable<ScheduleSerial> {
	private _events = $state<SvelteMap<string, ScheduleEvent>>(new SvelteMap());

	fromSerial(serial: ScheduleSerial) {
		this._events = new SvelteMap(serial ?? []);
	}

	toSerial(): ScheduleSerial {
		return Array.from(this._events.entries());
	}

	clear(): void {
		this._events.clear();
	}

	empty(): boolean {
		return this._events.size === 0;
	}

	toOne(id: string): ScheduleEvent | null {
		const event = this._events.get(id);
		return event ? { ...event } : null;
	}

	fromOne(id: string, data: ScheduleEvent) {
		this._events.set(id, data);
	}

	removeSilent(id: string) {
		this._events.delete(id);
	}

	add(event: Omit<ScheduleEvent, 'id'> & { id?: string }): string {
		const id = event.id ?? generateUUID();
		this._events.set(id, { ...event, id });
		changeBus.emit('schedule', 'created', id);
		return id;
	}

	remove(id: string) {
		this._events.delete(id);
		changeBus.emit('schedule', 'deleted', id);
	}

	get(id: string): ScheduleEvent | undefined {
		return this._events.get(id);
	}

	has(id: string): boolean {
		return this._events.has(id);
	}

	update(id: string, event: ScheduleEvent) {
		this._events.set(id, event);
		changeBus.emit('schedule', 'updated', id);
	}

	removeByRamo(ramoId: string) {
		const toDelete: string[] = [];
		for (const [id, event] of this._events) {
			if (event.ramoId === ramoId) toDelete.push(id);
		}
		for (const id of toDelete) {
			this._events.delete(id);
			changeBus.emit('schedule', 'deleted', id);
		}
	}

	isActiveOnDate(event: ScheduleEvent, date: string): boolean {
		if (event.date === date) return true;

		if (event.daysOfWeek && event.daysOfWeek.length > 0) {
			const [y, m, d] = date.split('-').map(Number);
			const dow = new SvelteDate(y, m - 1, d).getDay() || 7;
			if (!event.daysOfWeek.includes(dow)) return false;

			const parse = (s: string) => s.split('-').map(Number);
			const [sy, sm, sd] = event.recurrenceStart ? parse(event.recurrenceStart) : [1970, 1, 1];
			const [ey, em, ed] = event.recurrenceEnd ? parse(event.recurrenceEnd) : [2099, 12, 31];
			const target = new SvelteDate(y, m - 1, d, 12);
			const rangeStart = new SvelteDate(sy, sm - 1, sd);
			const rangeEnd = new SvelteDate(ey, em - 1, ed, 23, 59, 59, 999);
			return +target >= +rangeStart && +target <= +rangeEnd;
		}

		return false;
	}

	getByDate(date: string): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (this.isActiveOnDate(event, date)) result.push(event);
		}
		return result;
	}

	getByDayOfWeek(day: number, date?: string): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (event.daysOfWeek?.includes(day) && (!date || this.isActiveOnDate(event, date)))
				result.push(event);
		}
		return result;
	}

	getByRamo(ramoId: string): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (event.ramoId === ramoId) result.push(event);
		}
		return result;
	}

	getRecurring(date?: string): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (
				event.daysOfWeek &&
				event.daysOfWeek.length > 0 &&
				(!date || this.isActiveOnDate(event, date))
			)
				result.push(event);
		}
		return result;
	}

	getOneOff(): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (event.date) result.push(event);
		}
		return result;
	}

	get list() {
		return Array.from(this._events.entries());
	}

	get map() {
		return this._events;
	}
}
