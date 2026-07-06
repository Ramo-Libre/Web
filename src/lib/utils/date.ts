import { timeTravel } from '$lib/pages/_components/dev-tools/dev-tools-time.svelte';

export function getNow(): Date {
	if (timeTravel.enabled && timeTravel.date) {
		const d = new Date(timeTravel.date);
		if (!isNaN(d.getTime())) return d;
	}
	return new Date();
}
