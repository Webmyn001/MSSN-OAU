import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
			"@/*": "./path/to/lib/*",
		},
		csp: {
			mode: 'auto',
			useSvelteKitNonce: true,
			directives: {
				'default-src': ["'self'"],
				'script-src': [
					"'self'",
					'blob:',
					'https://cdn.jsdelivr.net',
					'https://va.vercel-scripts.com',
					'https://randomuser.me',
					'https://vercel.live',
					'https://*.sentry.io',
					'https://sentry.io',
					"'unsafe-inline'",
					"'unsafe-eval'"
				],
				'img-src': [
					"'self'",
					'data:',
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
				'style-src': [
					"'self'",
					'https://cdn.jsdelivr.net',
					'https://fonts.googleapis.com',
					"'unsafe-inline'"
				],
				'font-src': [
					"'self'",
					'https://cdn.jsdelivr.net',
					'https://fonts.gstatic.com'
				],
				'connect-src': [
					"'self'",
					'https://api.mssnoau.com',
					'https://api.aladhan.com',
					'https://va.vercel-scripts.com',
					'https://*.sentry.io' // Added for Sentry event submission
				],
				// Recommended default directives for better security:
				'object-src': ["'none'"],
				'base-uri': ["'self'"],
				'form-action': ["'self'"],
				'frame-ancestors': ["'none'"]
			}
		}
	}
};

export default config;
