import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { changeBus } from '$lib/infra/sync.svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';

export type ScheduleCategory = 'book' | 'lab' | 'assist' | 'taller' | 'exam' | 'urgent' | 'event' | 'other';

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
		for (const id of toDelete) this._events.delete(id);
		if (toDelete.length) changeBus.emit('schedule', 'deleted', ramoId);
	}

	private isActiveOnDate(event: ScheduleEvent, date: string): boolean {
		if (event.date === date) return true;

		if (event.daysOfWeek && event.daysOfWeek.length > 0) {
			const d = new SvelteDate(date + 'T12:00:00');
			const dow = d.getDay() === 0 ? 7 : d.getDay();
			if (!event.daysOfWeek.includes(dow)) return false;

			const start = event.recurrenceStart ?? '1970-01-01';
			const end = event.recurrenceEnd ?? '2099-12-31';
			return date >= start && date <= end;
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

	getByDayOfWeek(day: number): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (event.daysOfWeek?.includes(day)) result.push(event);
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

	getRecurring(): ScheduleEvent[] {
		const result: ScheduleEvent[] = [];
		for (const [, event] of this._events) {
			if (event.daysOfWeek && event.daysOfWeek.length > 0) result.push(event);
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
