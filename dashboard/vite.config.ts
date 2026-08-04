import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// Base URL used by all client-side API calls. Defaults to the local dev API;
// set PUBLIC_API_BASE_URL (e.g. https://mssn-api.onrender.com) when building
// for production so every fetch points at the live backend.
const API_BASE = (process.env.PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export default defineConfig({
	plugins: [
		// Rewrite the hardcoded localhost API prefix in src modules so the
		// frontend talks to PUBLIC_API_BASE_URL in production builds (a no-op
		// in local dev, where API_BASE still defaults to localhost:3000).
		{
			name: 'api-base-url',
			enforce: 'pre',
			transform(code, id) {
				if (!/[/\\]src[/\\]/.test(id)) return;
				return code.replaceAll('http://localhost:3000', API_BASE);
			}
		},
		tailwindcss(),
		sveltekit()
	],
	server: {
		port: 5175,
		// Fix HMR WebSocket failures (common on Windows): force the client to
		// reconnect to ws://localhost explicitly and relax the origin allowlist.
		host: true,
		allowedHosts: true,
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: 5175,
			clientPort: 5175
		},
		fs: {
			allow: [resolve(__dirname, '.'), resolve(__dirname, 'node_modules')]
		}
	},
	ssr: {
		noExternal: ['@lucide/svelte']
	}
});
