import type { Serializable } from '$lib/types/state';

interface DevPreferences {
	timeTravelDate: string | null;
	timeTravelEnabled: boolean;
}
export type DevSerial = DevPreferences;

export class DevManager implements Serializable<DevSerial> {
	private _prefs = $state<DevPreferences>({
		timeTravelDate: null,
		timeTravelEnabled: false
	});

	fromSerial(serial: DevSerial) {
		this._prefs = serial ?? {};
	}

	toSerial(): DevSerial {
		return this._prefs;
	}

	empty(): boolean {
		return !this._prefs.timeTravelDate;
	}

	clear(): void {
		this._prefs = {
			timeTravelDate: null,
			timeTravelEnabled: false
		};
	}

	get timeTravelDate() {
		return this._prefs.timeTravelDate;
	}

	get timeTravelEnabled() {
		return this._prefs.timeTravelEnabled;
	}

	set timeTravelDate(date: string | null) {
		this._prefs.timeTravelDate = date;
	}

	set timeTravelEnabled(enabled: boolean) {
		this._prefs.timeTravelEnabled = enabled;
	}
}
