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
}

function eventName(feature: FeatureId): string {
	return `ramolibre:${feature}:change`;
}

let _sequence = 0;
function nextSequence(): number {
	return ++_sequence;
}

class ChangeBus {
	private _getSemesterId: () => string = () => '';

	setSemesterIdProvider(fn: () => string) {
		this._getSemesterId = fn;
	}

	emit(feature: FeatureId, action: ChangeAction, entityId?: string) {
		const event: ChangeEvent = {
			semesterId: this._getSemesterId(),
			feature,
			action,
			entityId,
			timestamp: Date.now(),
			deviceId,
			origin: 'local',
			sequence: nextSequence()
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
