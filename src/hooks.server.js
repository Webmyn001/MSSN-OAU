import { sequence } from "@sveltejs/kit/hooks";
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://8a6c37d91d61d59f93315969a077bace@o4508522730946560.ingest.us.sentry.io/4508522732519424',

  tracesSampleRate: 1.0,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});

// Custom handler for caching static assets
const cachingHandle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace('%sveltekit.assets%', '')
    });
    
    // Add caching headers for static assets
    const url = event.url.pathname;
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/)) {
        // Cache images for 1 week
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
            }
        });
    } else if (url.match(/\.(css|js)$/)) {
        // Cache CSS and JS for 1 day
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600'
            }
        });
    } else if (url.match(/\.(woff2|woff|ttf)$/)) {
        // Cache fonts for 1 week
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
            }
        });
    }
    
    return response;
};

// Sequence both handlers - Sentry first, then our caching handler
export const handle = sequence(sentryHandle(), cachingHandle);

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
