import { browser } from '$app/environment';

export const trailingSlash = 'always';
export const ssr = true;
export const csr = true; // Enable client-side rendering for hydration

// Add route-based code splitting
export const load = async ({ route }) => {
    // * Use mocked data directly (no server-side fetching)
    const dataPromise = fetchSiteData();

    // Client-side only code
    if (browser) {
        // Load performance monitoring tools only on client side
        loadClientSideTools();

        // Preload resources based on current route if route is defined
        if (route && route.id) {
            preloadRouteAssets(route.id);
        }
    }

    // Return the data promise to be resolved
    return await dataPromise;
};

/**
 * Preload route-specific resources based on the current route
 * @param {string} routeId - The current route ID
 */
function preloadRouteAssets(routeId) {
    // Only run in browser
    if (!browser) return;

    // Check if assets exist before preloading
    const ensureImageExists = (src) => {
        // Create a new image object to test if file exists
        const img = new Image();
        img.onerror = () => console.debug(`Image not found: ${src}`);
        img.onload = () => preloadImage(src);
        img.src = src;
    };

    // Preload assets based on route with a small delay
    setTimeout(() => {
        if (routeId === '/') {
            // Preload essential images that we know exist
            preloadImage('/mssn-logo.webp');

            // Test if hero image exists before preloading
            ensureImageExists('/hero-bg.webp');
        } else if (routeId.includes('/blog')) {
            // No need to preload images that don't exist yet
            // Future improvement: preload actual blog images when available
        } else if (routeId.includes('/events')) {
            // Future improvement: preload actual event images when available
        }
    }, 300);
}

/**
 * Preload an image using browser's link preload
 * @param {string} src - Image source URL
 */
function preloadImage(src) {
    if (!browser) return;

    // Check if preload link already exists
    const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;

    // Set type based on extension
    if (src.endsWith('.webp')) {
        link.type = 'image/webp';
    } else if (src.endsWith('.png')) {
        link.type = 'image/png';
    } else if (src.endsWith('.jpg') || src.endsWith('.jpeg')) {
        link.type = 'image/jpeg';
    }

    document.head.appendChild(link);
}

/**
 * Load client-side only tools with dynamic imports for better code splitting
 */
async function loadClientSideTools() {
    try {
        // Use requestIdleCallback for non-essential scripts
        const requestIdleCallback =
            window.requestIdleCallback ||
            ((cb) => setTimeout(cb, 1));

        requestIdleCallback(() => {
            // * Only load Vercel Speed Insights on Vercel (not in Docker)
            // * Check if we're on Vercel by looking for Vercel-specific environment
            if (import.meta.env.VERCEL || window.location.hostname.includes('vercel.app')) {
                Promise.all([
                    import('@vercel/speed-insights/sveltekit')
                        .then(module => module.injectSpeedInsights())
                        .catch(error => {
                            // * Silently fail - not critical for functionality
                            console.debug('Speed Insights not available (expected in Docker):', error.message);
                        })
                ]);
            }
        });

        // Register service worker for improved caching
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .catch(error => {
                        console.error('Service worker registration failed:', error);
                    });
            });
        }
    } catch (error) {
        console.error('Error loading client tools:', error);
        // Non-critical, so we can continue without throwing
    }
}

// * Use mocked data directly (no server-side fetching)
import { mockInfo } from "$lib/mocks/data.js";

/**
 * * Returns mocked site data (client-side data, no external APIs)
 * @returns {Promise<Object>} Site data object
 */
async function fetchSiteData() {
    return {
        info: mockInfo,
        events: [],
        posts: []
    };
}