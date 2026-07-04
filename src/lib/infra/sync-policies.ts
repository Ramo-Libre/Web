import type { FeatureId } from '$lib/infra/sync.svelte';

export interface SyncPolicy {
	persist: boolean;
	sync: boolean;
}

export const SYNC_POLICIES: Record<FeatureId, SyncPolicy> = {
	preferences: { persist: true, sync: false },
	ramos: { persist: true, sync: true },
	schedule: { persist: true, sync: true },
	escenarios: { persist: true, sync: true },
	semesters: { persist: true, sync: true }
};

export const KEYS: Record<string, string> = {
	preferences: 'PRE',
	ramos: 'RMS',
	schedule: 'SCH',
	escenarios: 'ESC',
	semesters: 'SEM',
	active: 'ACT'
};
