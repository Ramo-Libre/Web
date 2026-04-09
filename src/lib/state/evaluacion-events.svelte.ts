import type { Serializable } from '$lib/types/state';
import { SvelteMap } from 'svelte/reactivity';

export interface EvaluacionEventLink {
	ramoId: string;
	evaluacionId: string;
	eventId: string;
}

type LinkKey = string;
type EvaluacionEventsSerial = EvaluacionEventLink[];

const makeKey = (ramoId: string, evaluacionId: string): LinkKey => `${ramoId}::${evaluacionId}`;

export class EvaluacionEventsManager implements Serializable<EvaluacionEventsSerial> {
	private _links = $state<SvelteMap<LinkKey, EvaluacionEventLink>>(
		new SvelteMap<LinkKey, EvaluacionEventLink>()
	);
	private _byEvent = $state<SvelteMap<string, LinkKey>>(new SvelteMap<string, LinkKey>());

	fromSerial(serial: EvaluacionEventsSerial) {
		const entries: [LinkKey, EvaluacionEventLink][] = (serial ?? []).map((link) => [
			makeKey(link.ramoId, link.evaluacionId),
			link
		]);
		this._links = new SvelteMap<LinkKey, EvaluacionEventLink>(entries);

		const byEvent = new SvelteMap<string, LinkKey>();
		for (const [key, link] of this._links.entries()) {
			byEvent.set(link.eventId, key);
		}
		this._byEvent = byEvent;
	}

	toSerial(): EvaluacionEventsSerial {
		return Array.from(this._links.values());
	}

	clear(): void {
		this._links.clear();
		this._byEvent.clear();
	}

	empty(): boolean {
		return this._links.size === 0;
	}

	link(ramoId: string, evaluacionId: string, eventId: string) {
		const key = makeKey(ramoId, evaluacionId);
		const existing = this._links.get(key);
		if (existing && existing.eventId !== eventId) {
			this._byEvent.delete(existing.eventId);
		}

		const existingKeyForEvent = this._byEvent.get(eventId);
		if (existingKeyForEvent && existingKeyForEvent !== key) {
			this._links.delete(existingKeyForEvent);
		}

		this._links.set(key, { ramoId, evaluacionId, eventId });
		this._byEvent.set(eventId, key);
	}

	getEventId(ramoId: string, evaluacionId: string): string | null {
		const link = this._links.get(makeKey(ramoId, evaluacionId));
		return link?.eventId ?? null;
	}

	removeByEvaluacion(ramoId: string, evaluacionId: string) {
		const key = makeKey(ramoId, evaluacionId);
		const link = this._links.get(key);
		if (!link) return;
		this._links.delete(key);
		this._byEvent.delete(link.eventId);
	}

	removeByEventId(eventId: string) {
		const key = this._byEvent.get(eventId);
		if (!key) return;
		this._byEvent.delete(eventId);
		this._links.delete(key);
	}

	removeByRamo(ramoId: string) {
		const toDelete: EvaluacionEventLink[] = [];
		for (const link of this._links.values()) {
			if (link.ramoId === ramoId) toDelete.push(link);
		}
		for (const link of toDelete) {
			this._links.delete(makeKey(link.ramoId, link.evaluacionId));
			this._byEvent.delete(link.eventId);
		}
	}

	get list() {
		return Array.from(this._links.entries());
	}

	get map() {
		return this._links;
	}
}
