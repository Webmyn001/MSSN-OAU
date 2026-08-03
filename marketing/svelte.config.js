import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			precompress: false,
			// Allow non-prerendered routes (we'll ship a pure SPA bundle)
			strict: false
		}),
		alias: {
			'$lib': './src/lib',
			'$components': './src/lib/components'
		},
		// CSP disabled: Svelte 5 inline event handlers (onclick, etc.) are incompatible
		// with nonce/hash-based CSP. Re-enable only after migrating to non-inline event handling.
	}
};

export default config;
