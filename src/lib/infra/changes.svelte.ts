import { deviceId } from '$lib/utils/device';

export type FeatureId = 'preferences' | 'ramos' | 'schedule' | 'escenarios' | 'semesters';
export type ChangeAction = 'created' | 'updated' | 'deleted';

export interface ChangeEvent {
	semesterId: string;
	feature: FeatureId;
	action: ChangeAction;
	entityId?: string;
	timestamp: number;
	deviceId: string;
	origin: 'local' | 'remote';
	sequence: number;
	payload?: unknown;
}

const SEQ_PREFIX = 'RAMOLIBRE_V2_SEQ_';

function storageKey(semesterId: string): string {
	return SEQ_PREFIX + semesterId;
}

function eventName(feature: FeatureId): string {
	return `ramolibre:${feature}:change`;
}

class ChangeBus {
	private _getSemesterId: () => string = () => '';
	private _sequences = new Map<string, number>();

	setSemesterIdProvider(fn: () => string) {
		this._getSemesterId = fn;
	}

	private _nextSequence(semesterId: string): number {
		let seq = this._sequences.get(semesterId);
		if (seq === undefined) {
			const stored = localStorage.getItem(storageKey(semesterId));
			seq = stored ? parseInt(stored, 10) || 0 : 0;
		}
		seq++;
		this._sequences.set(semesterId, seq);
		localStorage.setItem(storageKey(semesterId), String(seq));
		return seq;
	}

	emit(feature: FeatureId, action: ChangeAction, entityId?: string) {
		const semesterId = this._getSemesterId();
		const event: ChangeEvent = {
			semesterId,
			feature,
			action,
			entityId,
			timestamp: Date.now(),
			deviceId,
			origin: 'local',
			sequence: this._nextSequence(semesterId)
		};
		window.dispatchEvent(new CustomEvent(eventName(feature), { detail: event }));
	}

	subscribe(feature: FeatureId, handler: (event: ChangeEvent) => void): () => void {
		const wrapper = (e: Event) => handler((e as CustomEvent<ChangeEvent>).detail);
		window.addEventListener(eventName(feature), wrapper);
		return () => window.removeEventListener(eventName(feature), wrapper);
	}

	subscribeAll(handler: (event: ChangeEvent) => void): () => void {
		const features: FeatureId[] = ['preferences', 'ramos', 'schedule', 'escenarios', 'semesters'];
		const unsubs = features.map((f) => this.subscribe(f, handler));
		return () => unsubs.forEach((u) => u());
	}
}

export const changeBus = new ChangeBus();
