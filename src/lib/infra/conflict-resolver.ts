export interface UserConflict {
	feature: string;
	semesterId: string;
	entityId: string;
	field: string;
	localValue: unknown;
	serverValue: unknown;
	timestamp: number;
}

export interface MergeInput {
	feature: string;
	semesterId: string;
	entityId: string;
	base: Record<string, unknown> | null;
	mine: Record<string, unknown> | null;
	theirs: Record<string, unknown> | null;
}

export interface MergeResult {
	merged: Record<string, unknown> | null;
	userConflicts: UserConflict[];
}

export function merge(input: MergeInput): MergeResult {
	const { feature, semesterId, entityId, base, mine, theirs } = input;
	const userConflicts: UserConflict[] = [];
	const now = Date.now();

	const isTombstone = (v: Record<string, unknown> | null) => v === null;

	if (isTombstone(theirs) && !isTombstone(mine)) {
		return {
			merged: null,
			userConflicts: [
				{
					feature,
					semesterId,
					entityId,
					field: '__tombstone__',
					localValue: mine,
					serverValue: null,
					timestamp: now
				}
			]
		};
	}

	if (isTombstone(mine) && !isTombstone(theirs)) {
		return {
			merged: null,
			userConflicts: [
				{
					feature,
					semesterId,
					entityId,
					field: '__tombstone__',
					localValue: null,
					serverValue: theirs,
					timestamp: now
				}
			]
		};
	}

	if (isTombstone(mine) && isTombstone(theirs)) {
		return { merged: null, userConflicts: [] };
	}

	const safeBase = base ?? ({} as Record<string, unknown>);
	const merged: Record<string, unknown> = {};

	const allKeys = new Set([
		...Object.keys(safeBase),
		...Object.keys(mine!),
		...Object.keys(theirs!)
	]);

	for (const key of allKeys) {
		const baseVal = safeBase[key];
		const mineVal = mine![key];
		const theirsVal = theirs![key];

		const mineChanged = !shallowEqual(mineVal, baseVal);
		const theirsChanged = !shallowEqual(theirsVal, baseVal);

		if (!mineChanged) {
			merged[key] = theirsVal;
		} else if (!theirsChanged) {
			merged[key] = mineVal;
		} else if (shallowEqual(mineVal, theirsVal)) {
			merged[key] = mineVal;
		} else {
			merged[key] = theirsVal;
			userConflicts.push({
				feature,
				semesterId,
				entityId,
				field: key,
				localValue: mineVal,
				serverValue: theirsVal,
				timestamp: now
			});
		}
	}

	return { merged, userConflicts };
}

function shallowEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (typeof a !== typeof b) return false;
	if (typeof a === 'object') {
		return JSON.stringify(a) === JSON.stringify(b);
	}
	return false;
}
