import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
