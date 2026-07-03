import type { Serializable } from '$lib/types/state';
import { themes, type Theme } from '@ramo-libre/ui-themes';

export type Orientation = 'normal' | 'rotated';

export interface Preferences {
	theme: Theme;
	schedule: {
		showCalendarEvents: boolean;
		orientation: Orientation;
	};
	calendar: {
		showHorarios: boolean;
	};
	layout: {
		sidebarCollapsed: boolean;
	};
	clearRamoData: boolean;
}

export type PreferencesSerial = Preferences;

const DEFAULTS: Preferences = {
	theme: 'dark',
	schedule: {
		showCalendarEvents: false,
		orientation: 'normal'
	},
	calendar: {
		showHorarios: false
	},
	layout: {
		sidebarCollapsed: false
	},
	clearRamoData: true
};

export class PreferencesManager implements Serializable<PreferencesSerial> {
	private _prefs = $state<Preferences>({ ...DEFAULTS });

	fromSerial(serial: PreferencesSerial) {
		this._prefs = {
			...DEFAULTS,
			...(serial ?? {}),
			schedule: {
				...DEFAULTS.schedule,
				...((serial?.schedule ?? {}) as Partial<Preferences['schedule']>)
			},
			calendar: {
				...DEFAULTS.calendar,
				...((serial?.calendar ?? {}) as Partial<Preferences['calendar']>)
			},
			layout: {
				...DEFAULTS.layout,
				...((serial?.layout ?? {}) as Partial<Preferences['layout']>)
			}
		};
	}

	toSerial(): PreferencesSerial {
		return this._prefs;
	}

	clear(): void {
		this._prefs = { ...DEFAULTS };
	}

	empty(): boolean {
		return (
			this._prefs.theme === DEFAULTS.theme &&
			this._prefs.schedule.showCalendarEvents === DEFAULTS.schedule.showCalendarEvents &&
			this._prefs.schedule.orientation === DEFAULTS.schedule.orientation &&
			this._prefs.calendar.showHorarios === DEFAULTS.calendar.showHorarios &&
			this._prefs.layout.sidebarCollapsed === DEFAULTS.layout.sidebarCollapsed
		);
	}

	get theme() {
		return this._prefs.theme;
	}

	get scheduleShowCalendarEvents() {
		return this._prefs.schedule.showCalendarEvents;
	}

	get scheduleOrientation() {
		return this._prefs.schedule.orientation;
	}

	get calendarShowHorarios() {
		return this._prefs.calendar.showHorarios;
	}

	get sidebarCollapsed() {
		return this._prefs.layout.sidebarCollapsed;
	}

	get clearRamoData() {
		return this._prefs.clearRamoData;
	}

	setClearRamoData(v: boolean) {
		this._prefs = { ...this._prefs, clearRamoData: v };
	}

	setTheme(theme: Theme) {
		this._prefs = { ...this._prefs, theme };
	}

	setScheduleShowCalendarEvents(v: boolean) {
		this._prefs = { ...this._prefs, schedule: { ...this._prefs.schedule, showCalendarEvents: v } };
	}

	setScheduleOrientation(v: Orientation) {
		this._prefs = { ...this._prefs, schedule: { ...this._prefs.schedule, orientation: v } };
	}

	setCalendarShowHorarios(v: boolean) {
		this._prefs = { ...this._prefs, calendar: { ...this._prefs.calendar, showHorarios: v } };
	}

	setSidebarCollapsed(v: boolean) {
		this._prefs = { ...this._prefs, layout: { ...this._prefs.layout, sidebarCollapsed: v } };
	}

	applyTheme() {
		const root = document.documentElement;
		const cls = themes.map((t) => t.class).filter((c) => !!c);
		root.classList.remove(...cls);
		root.classList.add(this._prefs.theme);
	}
}
