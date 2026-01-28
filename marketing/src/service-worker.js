/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const OFFLINE_PAGE = '/offline.html'; // Define offline page constant
const DEBUG = false; // Set to false in production for less verbosity

// Assets to cache
const ASSETS = [
  ...build, // the app itself
  ...files,  // everything in `static`
  OFFLINE_PAGE // Explicitly cache the offline page
];

// URLs that should use network-first strategy
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/blog/',
  '/events/',
  // Add other paths that frequently change or require fresh data
];

// Log function that only works in debug mode
const log = DEBUG ? console.log.bind(console, '[ServiceWorker]') : () => {};
const errorLog = DEBUG ? console.error.bind(console, '[ServiceWorker ERROR]') : () => {}; // Renamed to avoid conflict if 'error' is used as a variable

// Service worker installation
self.addEventListener('install', (event) => {
  log('Installing service worker');
  
  async function addFilesToCache() {
    try {
      const cache = await caches.open(CACHE);
      log('Caching app shell and assets');
      // Ensure requests for assets are made with no-cache to bypass HTTP cache during SW install
      return cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => {
          errorLog('Failed to cache some assets:', err);
          // Optionally, prevent activation if core assets fail, or log and continue
          return; // Or throw err to fail installation for critical assets
        });
    } catch (err) {
      errorLog('Cache initialization failed:', err);
      // Optionally, prevent activation
      // throw err;
    }
  }

  event.waitUntil(
    addFilesToCache().then(() => {
      log('Skip waiting - activating worker immediately');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating service worker');
  
  async function deleteOldCaches() {
    try {
      for (const key of await caches.keys()) {
        if (key !== CACHE) {
          log('Deleting old cache:', key);
          await caches.delete(key);
        }
      }
      return self.clients.claim(); // Claim clients immediately
    } catch (err) {
      errorLog('Deleting old caches failed:', err);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// Helper to determine if a request URL matches any patterns
function matchesPattern(urlPathname, patterns) {
  return patterns.some(pattern => urlPathname.startsWith(pattern)); // Use startsWith for broader API matching
}

// Helper to check if request should be handled by this service worker
function shouldHandleRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.protocol === 'chrome-extension:') return false;
  // * Avoid caching non-public routes (none currently configured here)
  if (url.pathname.includes('/node_modules/')) return false; // Don't cache dev dependencies
  // Add other exclusion rules if necessary
  return true;
}

// Fetch event - handle caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  if (!shouldHandleRequest(request)) {
    // Let the browser handle it or return early if it's a request we should ignore
    return;
  }
  
  const url = new URL(request.url);
  
  async function fetchWithStrategy() {
    try {
      if (matchesPattern(url.pathname, NETWORK_FIRST_ROUTES)) {
        return await networkFirstStrategy(request);
      }
      // Cache-first for versioned assets or static content like images/fonts
      if (url.pathname.match(/\.(jpe?g|png|gif|svg|webp|avif|ico|woff2?)$/)) {
        return await cacheFirstStrategy(request);
      }
      // Stale-while-revalidate for app shell resources like JS/CSS if not covered by build hash
      if (url.pathname.match(/\.(js|css)$/) && !ASSETS.includes(url.pathname)) {
        return await staleWhileRevalidateStrategy(request);
      }
      
      // Default: Cache-first for assets defined in ASSETS (includes build and static files)
      // This often means hashed assets which are safe to cache aggressively.
      const cache = await caches.open(CACHE);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      
      // Fallback to network for anything not matched or not in cache
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') { // Don't cache opaque responses (e.g., no-cors third-party)
        await cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      errorLog('Main fetch failed for:', request.url, err.message);
      // Only serve offline page for HTML navigation requests
      if (request.mode === 'navigate' || 
          (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) return offlineResponse;
        // Fallback to root if offline page itself fails (very unlikely)
        const rootResponse = await caches.match('/'); // Assuming '/' is cached
        if (rootResponse) return rootResponse;
      }
      // For non-HTML requests or if offline/root page fails, return a generic error response
      return new Response('Network error. Please check your connection.', {
        status: 408, headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
  event.respondWith(fetchWithStrategy());
});

// Network-first strategy: try network, fall back to cache
async function networkFirstStrategy(request) {
  log(`Network-first strategy for: ${request.url}`);
  try {
    const networkResponse = await fetch(request);
    // Check if response is valid before caching (e.g. not an error page from server)
    if (networkResponse.ok && networkResponse.type !== 'opaque') {
      const cache = await caches.open(CACHE);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (networkError) {
    log(`Network failure for (Network-first): ${request.url}, falling back to cache. Error:`, networkError.message);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // If request was for HTML and cache miss, serve offline page
    if (request.mode === 'navigate' || 
        (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) return offlineResponse;
    }
    // For other types or if offline page is not found, re-throw to be caught by main handler (or return generic error)
    throw networkError; // Propagate the error
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  log(`Cache-first strategy for: ${request.url}`);
  const cache = await caches.open(CACHE);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    log(`Cache hit for: ${request.url}`);
    // Optional: background update for cache-first assets if desired (less common for immutable assets)
    // fetch(request).then(networkResponse => { ... }); 
    return cachedResponse;
  }
  log(`Cache miss for: ${request.url}, fetching from network`);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.type !== 'opaque') {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (networkError) {
    log(`Network failure for (Cache-first): ${request.url}, Error:`, networkError.message);
    // For images/assets, we might not want to return the generic offline.html
    // but a placeholder or just the error. Returning a specific error for asset types.
    return new Response('Resource unavailable from network or cache.', { 
        status: 404, headers: { 'Content-Type': 'text/plain' } 
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  log(`Stale-while-revalidate strategy for: ${request.url}`);
  const cache = await caches.open(CACHE);
  const cachedResponsePromise = cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && networkResponse.type !== 'opaque') {
      log(`SWR: Updating cache for: ${request.url}`);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(fetchError => {
      log(`SWR: Network failure for: ${request.url}`, fetchError.message);
      // If network fails, and we had a cached response, it would have been returned already by Promise.race or similar logic
      // If no cached response, this error will propagate.
      throw fetchError;
  });

  // Prefer cached response if available, otherwise wait for network
  // If cached exists, return it and let network update in background
  const cachedResponse = await cachedResponsePromise;
  return cachedResponse || fetchPromise;
}

// Optional: listen for messages from the client, e.g., to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    log('SKIP_WAITING message received, calling self.skipWaiting().');
    self.skipWaiting();
  }
});

// log('[MinimalSW] Script evaluated'); // Final log, ensure it's not causing issues if DEBUG is false 