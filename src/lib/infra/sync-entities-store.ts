import { supabase } from '$lib/supabase/client';

export interface SyncEntityRow {
	user_id: string;
	semester_id: string;
	feature: string;
	entity_id: string;
	payload: unknown;
	sequence: number;
	device_id: string;
	updated_at: string;
}

export interface WatermarkRow {
	user_id: string;
	max_sequence: number;
}

export async function fetchEntity(
	userId: string,
	semesterId: string,
	feature: string,
	entityId: string
): Promise<SyncEntityRow | null> {
	const { data } = await supabase
		.from('sync_entities')
		.select('*')
		.eq('user_id', userId)
		.eq('semester_id', semesterId)
		.eq('feature', feature)
		.eq('entity_id', entityId)
		.maybeSingle();

	return data as SyncEntityRow | null;
}

export async function fetchWatermark(userId: string): Promise<number> {
	const { data } = await supabase
		.from('user_sync_watermark')
		.select('max_sequence')
		.eq('user_id', userId)
		.maybeSingle();

	return (data as WatermarkRow | null)?.max_sequence ?? 0;
}

export async function fetchChangesSince(
	userId: string,
	sinceWatermark: number
): Promise<SyncEntityRow[]> {
	const { data } = await supabase
		.from('sync_entities')
		.select('*')
		.eq('user_id', userId)
		.gt('sequence', sinceWatermark)
		.order('sequence', { ascending: true });

	return (data as SyncEntityRow[]) ?? [];
}

export async function tryUpdate(
	userId: string,
	semesterId: string,
	feature: string,
	entityId: string,
	payload: unknown,
	lastKnownSequence: number,
	deviceId: string
): Promise<{ sequence: number } | null> {
	const { data } = await supabase
		.from('sync_entities')
		.update({
			payload,
			device_id: deviceId,
			updated_at: new Date().toISOString()
		})
		.eq('user_id', userId)
		.eq('semester_id', semesterId)
		.eq('feature', feature)
		.eq('entity_id', entityId)
		.eq('sequence', lastKnownSequence)
		.select('sequence')
		.maybeSingle();

	return data as { sequence: number } | null;
}

export async function insertEntity(
	userId: string,
	semesterId: string,
	feature: string,
	entityId: string,
	payload: unknown,
	deviceId: string
): Promise<{ sequence: number } | null> {
	const { data } = await supabase
		.from('sync_entities')
		.insert({
			user_id: userId,
			semester_id: semesterId,
			feature,
			entity_id: entityId,
			payload,
			device_id: deviceId,
			updated_at: new Date().toISOString()
		})
		.select('sequence')
		.single();

	return data as { sequence: number } | null;
}
