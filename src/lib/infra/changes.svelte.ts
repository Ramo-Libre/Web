import { deviceId } from '$lib/utils/device';

export type FeatureId = 'preferences' | 'ramos' | 'schedule' | 'escenarios' | 'semesters';
export type ChangeAction = 'created' | 'updated' | 'deleted';

export interface EntityChange {
	semesterId: string;
	feature: FeatureId;
	entityId: string;
	action: ChangeAction;
	payload: unknown;
	deviceId: string;
	origin: 'local' | 'remote';
	timestamp: number;
}

function eventName(feature: FeatureId): string {
	return `ramolibre:${feature}:change`;
}

class ChangeBus {
	private _getSemesterId: () => string = () => '';

	setSemesterIdProvider(fn: () => string) {
		this._getSemesterId = fn;
	}

	emit(feature: FeatureId, action: ChangeAction, entityId: string) {
		const semesterId = this._getSemesterId();
		const event: EntityChange = {
			semesterId,
			feature,
			entityId,
			action,
			payload: undefined,
			deviceId,
			origin: 'local',
			timestamp: Date.now()
		};
		window.dispatchEvent(new CustomEvent(eventName(feature), { detail: event }));
	}

	subscribe(feature: FeatureId, handler: (event: EntityChange) => void): () => void {
		const wrapper = (e: Event) => handler((e as CustomEvent<EntityChange>).detail);
		window.addEventListener(eventName(feature), wrapper);
		return () => window.removeEventListener(eventName(feature), wrapper);
	}

	subscribeAll(handler: (event: EntityChange) => void): () => void {
		const features: FeatureId[] = ['preferences', 'ramos', 'schedule', 'escenarios', 'semesters'];
		const unsubs = features.map((f) => this.subscribe(f, handler));
		return () => unsubs.forEach((u) => u());
	}
}

export const changeBus = new ChangeBus();
