// * Server hooks are not needed at runtime for a fully static (prerendered) marketing site.
// * Keeping this as a minimal pass-through avoids prerender/build-time failures from server-only integrations.

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	return resolve(event);
}

/** @type {import('@sveltejs/kit').Reroute} */
export async function reroute({ url }) {
	// * Keep routes unchanged during prerendering/static builds.
	return url.pathname;
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
	console.error('Unhandled server error', { error, path: event.url?.pathname });
}
