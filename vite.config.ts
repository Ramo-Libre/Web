import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const excludeDevTools = env.PUBLIC_SHOW_DEV_TOOLS !== 'true';
	const useRollupVisualizer = env.PUBLIC_ROLLUP_VISUALIZER === 'true';

	return {
		plugins: [
			tailwindcss(),
			sveltekit(),
			SvelteKitPWA({
				injectRegister: 'auto',
				registerType: 'autoUpdate',
				strategies: 'generateSW',
				manifest: {
					name: 'Ramo Libre',
					short_name: 'Ramo Libre',
					description:
						'Una aplicación web gratuita y ligera que ayuda a estudiantes universitarios a gestionar horarios, calificaciones y eventos académicos.',
					theme_color: '#ffffff',
					background_color: '#ffffff',
					display_override: ['window-controls-overlay'],
					icons: [
						{
							src: 'apple-touch-icon-180x180.png',
							sizes: '180x180',
							type: 'image/png'
						},
						{
							src: 'favicon-196.png',
							sizes: '196x196',
							type: 'image/png'
						},
						{
							src: 'maskable-icon-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'maskable'
						},
						{
							src: 'pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any'
						},
						{
							src: 'maskable-icon-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable'
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any'
						}
					]
				},
				workbox: {
					globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
					globIgnores: ['**/stats.html']
				},
				devOptions: {
					enabled: false
				}
			}),
			useRollupVisualizer &&
				(visualizer({
					emitFile: true,
					filename: 'stats.html',
					template: 'sunburst'
				}) as PluginOption),
			excludeDevTools &&
				({
					name: 'exclude-dev-tools',
					enforce: 'pre',
					resolveId(id) {
						if (id === '@faker-js/faker' || id.startsWith('@faker-js/faker/')) {
							return '\0faker-empty';
						}
					},
					load(id) {
						if (id === '\0faker-empty') {
							return 'export const faker = {};';
						}
					}
				} as PluginOption)
		].filter(Boolean),
		preview: {
			allowedHosts: true
		},
		optimizeDeps: {
			exclude: ['@madmti/gradesolver']
		}
	};
});
