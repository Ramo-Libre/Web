import { defineConfig } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		transparent: {
			sizes: [192, 512],
			favicons: [[196, 'favicon-196.png']]
		},
		maskable: {
			sizes: [192, 512]
		},
		apple: {
			sizes: [180]
		}
	},
	images: ['static/web.svg']
});
