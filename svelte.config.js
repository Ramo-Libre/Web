import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');
const isTauri = env.PUBLIC_TAURI_BUILD === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			strict: true,
			fallback: isTauri ? 'index.html' : '404.html',
			precompress: false
		}),
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (path === '/manifest.webmanifest') return;
				throw message;
			}
		}
	}
};

export default config;
