import { db } from '$lib/state/index.svelte';

export function getNow(): Date {
	if (db.dev?.timeTravelDate) {
		const timeTravelDate = new Date(db.dev.timeTravelDate);
		if (!isNaN(timeTravelDate.getTime())) {
			return timeTravelDate;
		}
	}
	return new Date();
}
