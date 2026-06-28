import type { Serializable } from '$lib/types/state';
import { themes, type Theme } from '@ramo-libre/ui-themes';

export type PreferencesSerial = {
	theme: Theme;
};

const DEFAULT_THEME: Theme = 'dark';

export class PreferencesManager implements Serializable<PreferencesSerial> {
	private _theme = $state<Theme>(DEFAULT_THEME);

	fromSerial(serial: PreferencesSerial) {
		this._theme = serial?.theme ?? DEFAULT_THEME;
	}

	toSerial(): PreferencesSerial {
		return { theme: this._theme };
	}

	clear(): void {
		this._theme = DEFAULT_THEME;
	}

	empty(): boolean {
		return this._theme === DEFAULT_THEME;
	}

	get theme() {
		return this._theme;
	}

	setTheme(theme: Theme) {
		this._theme = theme;
	}

	applyTheme() {
		const root = document.documentElement;
		const cls = themes.map((t) => t.class).filter((c) => !!c);
		root.classList.remove(...cls);
		root.classList.add(this._theme);
	}
}
