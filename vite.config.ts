import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
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
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png'
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
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
						src: 'apple-touch-icon-180x180.png',
						sizes: '180x180',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			},
			devOptions: {
				enabled: true
			}
        }),
		visualizer({
			emitFile: true,
			filename: 'stats.html',
			template: 'sunburst'
		}) as PluginOption
	],
	preview: {
		allowedHosts: true
	},
	optimizeDeps: {
		exclude: ['@madmti/gradesolver']
	}
});
