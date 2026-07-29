export interface DirEntryInfo {
	name: string;
	isFile: boolean;
	isDirectory: boolean;
	sizeBytes: number | null;
}

export async function listAppDataDir(): Promise<DirEntryInfo[]> {
	const { readDir, size } = await import('@tauri-apps/plugin-fs');
	const { appDataDir, join } = await import('@tauri-apps/api/path');
	const dir = await appDataDir();
	const entries = await readDir(dir);
	const result: DirEntryInfo[] = [];
	for (const e of entries) {
		const info: DirEntryInfo = {
			name: e.name,
			isFile: e.isFile,
			isDirectory: e.isDirectory,
			sizeBytes: null
		};
		if (e.isFile) {
			try {
				info.sizeBytes = await size(await join(dir, e.name));
			} catch {
				/* ignore */
			}
		}
		result.push(info);
	}
	return result;
}
