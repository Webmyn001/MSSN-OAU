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

// * Filter out common bot/scanner requests from logging
const botPathPatterns = [
    /\.php$/i,                    // PHP files
    /phpinfo/i,                   // phpinfo requests
    /wp-/i,                       // WordPress paths
    /wordpress/i,                 // WordPress
    /\.env$/i,                    // Environment files
    /admin/i,                     // Admin paths
    /adm\//i,                     // Admin directories
    /staging/i,                   // Staging paths
    /test/i,                      // Test paths
    /demo/i,                      // Demo paths
    /extract/i,                   // Extraction attempts
    /xampp/i,                     // XAMPP paths
    /application\/config/i,        // Config file attempts
    /gravity_forms/i,             // WordPress plugin paths
    /\.(sql|bak|backup|old)$/i,   // Backup files
    /\.git/i,                     // Git paths
    /\.svn/i,                     // SVN paths
    /\.htaccess/i,                // Apache config
    /\.htpasswd/i,                // Apache auth
    /\.well-known/i,              // Well-known (but allow legitimate ones)
];

// * Check if a path is a bot/scanner request
function isBotRequest(pathname) {
    // * Allow legitimate well-known paths
    if (pathname.startsWith('/.well-known/')) {
        const allowed = ['/security.txt', '/robots.txt', '/favicon.ico'];
        return !allowed.some(allowedPath => pathname.includes(allowedPath));
    }

    return botPathPatterns.some(pattern => pattern.test(pathname));
}

// * Custom error handler that filters bot requests
const errorFilterHandle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    // * Silently handle bot/scanner requests with 404
    if (isBotRequest(pathname)) {
        return new Response('Not Found', { status: 404 });
    }

    return await resolve(event);
};

// Sequence handlers: error filter first, then Sentry, then caching
export const handle = sequence(errorFilterHandle, sentryHandle(), cachingHandle);

// * Custom error handler that filters bot requests from Sentry
export const handleError = ({ error, event }) => {
    const pathname = event.url?.pathname || '';

    // * Don't send bot/scanner requests to Sentry
    if (isBotRequest(pathname)) {
        return;
    }

    // * Use Sentry's error handler for legitimate errors
    handleErrorWithSentry({ error, event });
};
