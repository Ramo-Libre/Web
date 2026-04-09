import type { Serializable } from '$lib/types/state';

export type CalendarView = 'calendar' | 'list' | 'kanban' | 'timeline';
export type CalendarStatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed';
export type ScheduleView = 'table' | 'list' | 'clock' | 'gallery';
export type ScheduleLayer = boolean;

export interface Preferences {
	calendar: {
		view: CalendarView;
		status: CalendarStatusFilter;
		ramo: string;
    };
	schedule: {
		view: ScheduleView;
		layer: ScheduleLayer;
	};
}

type PreferencesSerial = Preferences;

const DEFAULT_PREFERENCES: Preferences = {
	calendar: {
		view: 'calendar',
		status: 'all',
		ramo: 'all'
	},
	schedule: {
		view: 'table',
		layer: false
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
			},
			schedule: {
				...DEFAULT_PREFERENCES.schedule,
				...(serial?.schedule ?? {})
			}
		};
	}

	toSerial(): PreferencesSerial {
		return this._prefs;
	}

	clear(): void {
		this._prefs = DEFAULT_PREFERENCES;
	}

	empty(): boolean {
		return (
			this._prefs.calendar.view === DEFAULT_PREFERENCES.calendar.view &&
			this._prefs.calendar.status === DEFAULT_PREFERENCES.calendar.status &&
			this._prefs.calendar.ramo === DEFAULT_PREFERENCES.calendar.ramo &&
			this._prefs.schedule.view === DEFAULT_PREFERENCES.schedule.view &&
			this._prefs.schedule.layer === DEFAULT_PREFERENCES.schedule.layer
		);
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

	get scheduleView() {
		return this._prefs.schedule.view;
	}

	get scheduleLayer() {
		return this._prefs.schedule.layer;
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

	setScheduleView(view: ScheduleView) {
		this._prefs = {
			...this._prefs,
			schedule: {
				...this._prefs.schedule,
				view
			}
		};
	}

	setScheduleLayer(layer: ScheduleLayer) {
		this._prefs = {
			...this._prefs,
			schedule: {
				...this._prefs.schedule,
				layer
			}
		};
	}
}
