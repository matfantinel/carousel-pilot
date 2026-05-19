import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			configFile: false,
			compilerOptions: {
				customElement: true,
				runes: true
			}
		})
	],
	build: {
		lib: {
			entry: 'src/lib/index.js',
			formats: ['es'],
			fileName: 'carousel-pilot'
		},
		outDir: 'dist',
		emptyOutDir: false
	}
});
