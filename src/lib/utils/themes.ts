import type { Component } from 'svelte';
import { Sun, Moon, Snowflake, Coffee, Music, TreePine, Ghost, Flower2 } from '@lucide/svelte';

export type Theme =
	| 'light'
	| 'dark'
	| 'nord'
	| 'latte'
	| 'retrowave'
	| 'forest'
	| 'dracula'
	| 'sakura';

export type ThemeOption = { id: Theme; label: string; icon: Component; class: string };

export const themes: ThemeOption[] = [
	{ id: 'light', label: 'Claro', icon: Sun, class: '' },
	{ id: 'dark', label: 'Oscuro', icon: Moon, class: 'dark' },
	{ id: 'nord', label: 'Nord', icon: Snowflake, class: 'nord' },
	{ id: 'latte', label: 'Latte', icon: Coffee, class: 'latte' },
	{ id: 'retrowave', label: 'Retro', icon: Music, class: 'retrowave' },
	{ id: 'forest', label: 'Forest', icon: TreePine, class: 'forest' },
	{ id: 'dracula', label: 'Dracula', icon: Ghost, class: 'dracula' },
	{ id: 'sakura', label: 'Sakura', icon: Flower2, class: 'sakura' }
];
