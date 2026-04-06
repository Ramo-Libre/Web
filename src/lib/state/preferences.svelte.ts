import type { Serializable } from '$lib/types/state';

export type CalendarView = 'calendar' | 'list' | 'kanban' | 'timeline';
export type CalendarStatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';

export interface Preferences {
	calendar: {
		view: CalendarView;
		status: CalendarStatusFilter;
		ramo: string;
	};
}

type PreferencesSerial = Preferences;

const DEFAULT_PREFERENCES: Preferences = {
	calendar: {
		view: 'calendar',
		status: 'all',
		ramo: 'all'
	}
};

export class PreferencesManager implements Serializable<PreferencesSerial> {
	private _prefs = $state<Preferences>(DEFAULT_PREFERENCES);

	fromSerial(serial: PreferencesSerial) {
		this._prefs = {
			...DEFAULT_PREFERENCES,
			...serial,
			calendar: {
				...DEFAULT_PREFERENCES.calendar,
				...(serial?.calendar ?? {})
			}
		};
	}

	toSerial(): PreferencesSerial {
		return this._prefs;
	}

	get calendarView() {
		return this._prefs.calendar.view;
	}

	get calendarStatus() {
		return this._prefs.calendar.status;
	}

	get calendarRamo() {
		return this._prefs.calendar.ramo;
	}

	setCalendarView(view: CalendarView) {
		this._prefs = {
			...this._prefs,
			calendar: {
				...this._prefs.calendar,
				view
			}
		};
	}

	setCalendarStatus(status: CalendarStatusFilter) {
		this._prefs = {
			...this._prefs,
			calendar: {
				...this._prefs.calendar,
				status
			}
		};
	}

	setCalendarRamo(ramo: string) {
		this._prefs = {
			...this._prefs,
			calendar: {
				...this._prefs.calendar,
				ramo
			}
		};
	}
}