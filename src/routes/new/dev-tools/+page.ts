import { PUBLIC_SHOW_DEV_TOOLS } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export function load() {
	if (PUBLIC_SHOW_DEV_TOOLS !== 'true') {
		redirect(307, '/');
	}
}
