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
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ["'self'"],
				// * Allows SvelteKit to hash inline scripts/styles during prerendering (CSP meta) while keeping SSR safe.
				'script-src': ["'self'"],
				'style-src': ["'self'", "'unsafe-inline'"],
				'img-src': [
					"'self'",
					'data:',
					'blob:',
					'https://images.unsplash.com',
					'https://plus.unsplash.com',
					'https://mssnoau.sirv.com'
				],
				'font-src': ["'self'", 'data:'],
				'connect-src': [
					"'self'",
					'https://api.aladhan.com'
				],
				'object-src': ["'none'"],
				'base-uri': ["'self'"]
			}
		}
	}
};

export default config;
