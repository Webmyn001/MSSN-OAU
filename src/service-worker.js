/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const OFFLINE_PAGE = '/offline.html'; // Define offline page constant
const DEBUG = true; // Set to false in production

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
];

// Log function that only works in debug mode
const log = DEBUG ? console.log.bind(console, '[ServiceWorker]') : () => {};
const error = DEBUG ? console.error.bind(console, '[ServiceWorker ERROR]') : () => {};

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
          error('Failed to cache some assets:', err);
          return;
        });
    } catch (err) {
      error('Cache initialization failed:', err);
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
    for (const key of await caches.keys()) {
      if (key !== CACHE) {
        log('Deleting old cache:', key);
        await caches.delete(key);
      }
    }
    return self.clients.claim();
  }

  event.waitUntil(deleteOldCaches());
});

// Helper to determine if a request URL matches any patterns
function matchesPattern(url, patterns) {
  return patterns.some(pattern => url.includes(pattern));
}

// Helper to check if request should be handled
function shouldHandleRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.protocol === 'chrome-extension:') return false; // Ignore chrome extension requests
  if (url.pathname.includes('/auth/')) return false;
  if (url.pathname.includes('/node_modules/')) return false;
  return true;
}

// Fetch event - handle caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  if (!shouldHandleRequest(request)) {
    return;
  }
  
  const url = new URL(request.url);
  
  async function fetchWithStrategy() {
    try {
      if (matchesPattern(url.pathname, NETWORK_FIRST_ROUTES)) {
        return await networkFirstStrategy(request);
      }
      if (url.pathname.match(/\.(jpe?g|png|gif|svg|webp|avif|ico)$/)) {
        return await cacheFirstStrategy(request);
      }
      if (url.pathname.match(/\.(js|css)$/)) {
        return await staleWhileRevalidateStrategy(request);
      }
      
      const cache = await caches.open(CACHE);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      error('Main fetch failed for:', request.url, err);
      if (request.headers.get('accept')?.includes('text/html')) {
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) return offlineResponse;
        // Fallback to root if offline page itself fails (very unlikely)
        const rootResponse = await caches.match('/');
        if (rootResponse) return rootResponse;
      }
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
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    log(`Network failure for (Network-first): ${request.url}, falling back to cache. Error:`, err);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.headers.get('accept')?.includes('text/html')) {
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) return offlineResponse;
    }
    return new Response('Network error occurred. Please try again.', {
      status: 408, headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  log(`Cache-first strategy for: ${request.url}`);
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    log(`Cache hit for: ${request.url}`);
    // Attempt to update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        caches.open(CACHE).then(cache => cache.put(request, networkResponse));
      }
    }).catch(fetchErr => log(`Background cache update failed for ${request.url}:`, fetchErr));
    return cachedResponse;
  }
  log(`Cache miss for: ${request.url}, fetching from network`);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    log(`Network failure for (Cache-first): ${request.url}, Error:`, err);
    // For images/assets, we might not want to return the generic offline.html
    // but a placeholder or just the error.
    return new Response('Resource unavailable.', { 
        status: 404, headers: { 'Content-Type': 'text/plain' } 
    });
  }
}

// Stale-while-revalidate
async function staleWhileRevalidateStrategy(request) {
  log(`Stale-while-revalidate strategy for: ${request.url}`);
  const cache = await caches.open(CACHE); // Open cache once
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      log(`SWR: Updating cache for: ${request.url}`);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(fetchError => {
      log(`SWR: Network failure for: ${request.url}`, fetchError.message);
      // If network fails, and we had a cached response, we've already returned it.
      // If no cached response, this error will propagate if not handled by the caller.
      throw fetchError; // Re-throw to be caught by the main fetch handler if no cache
  });

  return cachedResponse || fetchPromise; // Return cached or wait for fetch
}

console.log('[MinimalSW] Script evaluated'); 