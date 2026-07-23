import { deviceId } from '$lib/utils/device';

export type FeatureId = 'preferences' | 'ramos' | 'schedule' | 'escenarios' | 'semesters' | 'todos';
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

class ChangeBus {
	private _getSemesterId: () => string = () => '';
	private _queue: Promise<void> = Promise.resolve();
	private _handlers: Array<(event: EntityChange) => void | Promise<void>> = [];

	setSemesterIdProvider(fn: () => string) {
		this._getSemesterId = fn;
	}

	emit(feature: FeatureId, action: ChangeAction, entityId: string, overrideSemesterId?: string) {
		const semesterId = overrideSemesterId ?? this._getSemesterId();
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

		this._queue = this._queue.then(async () => {
			for (const handler of this._handlers) {
				try {
					await handler(event);
				} catch (err) {
					console.error('[ChangeBus] Handler falló para evento:', event, err);
				}
			}
		});
	}

	subscribe(
		feature: FeatureId,
		handler: (event: EntityChange) => void | Promise<void>
	): () => void {
		const filtered = (event: EntityChange) => {
			if (event.feature !== feature) return;
			return handler(event);
		};
		this._handlers.push(filtered);
		return () => {
			const idx = this._handlers.indexOf(filtered);
			if (idx >= 0) this._handlers.splice(idx, 1);
		};
	}

	subscribeAll(handler: (event: EntityChange) => void | Promise<void>): () => void {
		this._handlers.push(handler);
		return () => {
			const idx = this._handlers.indexOf(handler);
			if (idx >= 0) this._handlers.splice(idx, 1);
		};
	}
}

export const changeBus = new ChangeBus();
