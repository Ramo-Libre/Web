import { Sun, Moon, Snowflake, Coffee } from '@lucide/svelte';
export type Theme = 'light' | 'dark' | 'nord' | 'latte';
export type ThemeOption = { id: Theme; label: string; icon: typeof Sun; class: string };

export const themes: ThemeOption[] = [
	{ id: 'light', label: 'Claro', icon: Sun, class: '' },
	{ id: 'dark', label: 'Oscuro', icon: Moon, class: 'dark' },
	{ id: 'nord', label: 'Nord', icon: Snowflake, class: 'nord' },
	{ id: 'latte', label: 'Latte', icon: Coffee, class: 'latte' }
];
