import type { Serializable } from '$lib/types/state';
import { generateUUID } from '$lib/utils/crypto';
import { SvelteMap } from 'svelte/reactivity';

export type EventPriority = 'low' | 'medium' | 'high';

export interface Event {
	id: string;
	ramoId?: string;
	dueDate: string; // formato YYYY-MM-DD
	location?: string;
	title: string;
	description?: string;
	priority: EventPriority;
	completed: boolean;
}

type EventKey = string;
export type EventsSerial = [EventKey, Event][];
type Events = SvelteMap<EventKey, Event>;

export class EventsManager implements Serializable<EventsSerial> {
	private _events = $state<Events>(new SvelteMap<EventKey, Event>());

	fromSerial(serial: EventsSerial) {
		this._events = new SvelteMap<EventKey, Event>(serial ?? []);
	}

	toSerial(): EventsSerial {
		return Array.from(this._events.entries());
	}

	clear(): void {
		this._events.clear();
	}

	empty(): boolean {
		return this._events.size === 0;
	}

	add(event: Omit<Event, 'id'> & { id?: string }) {
		const id = event.id ?? generateUUID();
		const next: Event = {
			id,
			ramoId: event.ramoId,
			dueDate: event.dueDate,
			location: event.location,
			title: event.title,
			description: event.description,
			priority: event.priority,
			completed: event.completed ?? false
		};
		this._events.set(id, next);
		return id;
	}

	remove(id: EventKey) {
		this._events.delete(id);
	}

	get(id: EventKey): Event | undefined {
		return this._events.get(id);
	}

	has(id: EventKey): boolean {
		return this._events.has(id);
	}

	update(id: EventKey, event: Event) {
		this._events.set(id, event);
	}

	toggleCompleted(id: EventKey, completed?: boolean) {
		const event = this._events.get(id);
		if (!event) return;
		this._events.set(id, {
			...event,
			completed: completed ?? !event.completed
		});
	}

	get list() {
		return Array.from(this._events.entries());
	}

	get map() {
		return this._events;
	}
}
