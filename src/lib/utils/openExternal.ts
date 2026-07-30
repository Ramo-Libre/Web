import { PUBLIC_TAURI_BUILD } from '$env/static/public';

const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in globalThis;

export async function openExternal(url: string) {
	if (isTauri) {
		const { openUrl } = await import('@tauri-apps/plugin-opener');
		await openUrl(url);
	} else {
		window.open(url, '_blank', 'noopener noreferrer');
	}
}
