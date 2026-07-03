export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const el = document.createElement('textarea');
			el.value = text;
			el.style.position = 'fixed';
			el.style.opacity = '0';
			el.style.pointerEvents = 'none';
			document.body.appendChild(el);
			el.select();
			el.setSelectionRange(0, 999999);
			const ok = document.execCommand('copy');
			document.body.removeChild(el);
			return ok;
		} catch {
			return false;
		}
	}
}
