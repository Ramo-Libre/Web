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
						src: 'apple-icon-180.png',
						sizes: '180x180',
						type: 'image/png'
					},
					{
						src: 'favicon-196.png',
						sizes: '196x196',
						type: 'image/png'
					},
					{
						src: 'manifest-icon-192.maskable.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: 'manifest-icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'manifest-icon-512.maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: 'manifest-icon-512.png',
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
