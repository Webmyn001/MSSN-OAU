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
			// enable edge functions if needed
			// edge: true,
			runtime: 'nodejs20.x',
			external: [],
			split: false
		}),
		alias: {
			'$lib': './src/lib',
			'$components': './src/lib/components'
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ["'self'"],
				'script-src': [
					"'self'",
					'blob:',
					'https://cdn.jsdelivr.net',
					'https://va.vercel-scripts.com',
					'https://randomuser.me',
					'https://vercel.live',
					// * Allow inline scripts with nonces (SvelteKit handles this)
					// * 'unsafe-hashes' needed for event handlers (onclick, onload, etc.)
					"'unsafe-hashes'",
					// * Sentry injects scripts that need to be allowed
					"'sha256-y2WkUILyE4eycy7x+pC0z99aZjTZlWfVwgUAfNc1sY8='"
				],
				'style-src': [
					"'self'",
					"'unsafe-inline'",
					'https://cdn.jsdelivr.net',
					'https://fonts.googleapis.com'
				],
				'img-src': [
					"'self'",
					'data:',
					'blob:',
					'https://*.googleusercontent.com',
					'https://lh3.googleusercontent.com',
					'https://www.gravatar.com',
					'https://api.dicebear.com',
					'https://images.unsplash.com',
					'https://*.unsplash.com',
					'https://annuurpress.org.ng',
					'https://secure.gravatar.com',
					'https://plus.unsplash.com',
					'https://api.mssnoau.com',
					'https://*.cloudinary.com',
					'https://randomuser.me',
					'https://placehold.co',
					'https://mssnoau.sirv.com', // Added for Sirv images
					'https://fonts.gstatic.com'
				],
				'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
				'connect-src': [
					"'self'",
					'https://cdn.jsdelivr.net',
					'https://fonts.googleapis.com',
					"'unsafe-inline'",
					'https://api.mssnoau.com',
					'https://api.aladhan.com',
					'https://va.vercel-scripts.com'
					// Removed Sentry domain
				],
				// Recommended default directives for better security:
				'object-src': ["'none'"],
				'base-uri': ["'self'"],
				'form-action': ["'self'"],
				'frame-ancestors': ["'none'"],
				'upgrade-insecure-requests': true
			}
		},
		prerender: {
			concurrency: 10,
			crawl: true,
			origin: 'https://mssnoau.org',
			// Removed Sentry related entries
			handleHttpError: ({ path, referrer, message }) => {
				if (
					path === '/404' ||
					path.startsWith('/api/') ||
					path.includes('sitemap.xml') ||
					path.startsWith('/_app/')
				) {
					// ignore
					return;
				}
				console.warn(`HTTP error: ${path} (referrer: ${referrer}) Message: ${message}`);
				// throw new Error(message); // Optionally re-throw to fail the build
			},
			handleMissingId: 'warn' // 'fail', 'ignore'
		}
	}
};

export default config;
