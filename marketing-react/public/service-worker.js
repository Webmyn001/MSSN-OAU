/**
 * Self-destructing service worker (kill switch).
 *
 * The previous SvelteKit `marketing` app shipped a service worker at `/service-worker.js`
 * that cached the app shell and JS/CSS and kept serving stale content after the migration
 * to React (+ React Router). This file intentionally replaces that worker: on activation it
 * clears every cache, unregisters itself and reloads open tabs so visitors fall back to the
 * network and always receive the current build. The React app registers no service worker.
 */
self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			try {
				const cacheNames = await caches.keys();
				await Promise.all(cacheNames.map((name) => caches.delete(name)));
			} catch {
				// caches API unavailable - nothing to clear.
			}

			try {
				await self.registration.unregister();
			} catch {
				// already unregistered.
			}

			try {
				const clients = await self.clients.matchAll({
					type: "window",
					includeUncontrolled: true,
				});
				for (const client of clients) {
					if ("navigate" in client) {
						client.navigate(client.url);
					}
				}
			} catch {
				// no clients to reload.
			}
		})()
	);
});
