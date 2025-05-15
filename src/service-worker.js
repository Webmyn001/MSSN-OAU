/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const DEBUG = true; // Set to false in production

// Assets to cache
const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
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
  
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    try {
      const cache = await caches.open(CACHE);
      log('Caching app shell and assets');
      return cache.addAll(ASSETS.map(url => new Request(url, { cache: 'no-cache' })))
        .catch(err => {
          error('Failed to cache some assets:', err);
          // Continue despite errors to avoid blocking installation
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
  // Only handle GET requests
  if (request.method !== 'GET') return false;
  
  const url = new URL(request.url);
  
  // Skip requests that handle auth
  if (url.pathname.includes('/auth/')) return false;
  
  // Skip node_modules in development mode to avoid conflicts with Vite
  // This is crucial to prevent the service worker from breaking HMR and Vite functionality
  if (url.pathname.includes('/node_modules/')) return false;
  
  return true;
}

// Fetch event - handle caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and certain paths
  if (!shouldHandleRequest(request)) {
    return;
  }
  
  const url = new URL(request.url);
  
  // Define a function to handle the fetch with appropriate strategy
  async function fetchWithStrategy() {
    try {
      // Handle API and dynamic content with network-first strategy
      if (matchesPattern(url.pathname, NETWORK_FIRST_ROUTES)) {
        return await networkFirstStrategy(request);
      }
      
      // Handle images with cache-first strategy
      if (url.pathname.match(/\.(jpe?g|png|gif|svg|webp|avif|ico)$/)) {
        return await cacheFirstStrategy(request);
      }
      
      // Handle JavaScript and CSS with stale-while-revalidate
      if (url.pathname.match(/\.(js|css)$/)) {
        return await staleWhileRevalidateStrategy(request);
      }
      
      // Default strategy for everything else
      const cache = await caches.open(CACHE);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, try the network
      const response = await fetch(request);
      
      // Cache successful responses
      if (response.ok) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch {
      // If network fetch fails, return a generic fallback for HTML pages
      if (request.headers.get('accept')?.includes('text/html')) {
        const cachedResponse = await caches.match('/');
        if (cachedResponse) return cachedResponse;
      }
      
      return new Response('Network error', { status: 408 });
    }
  }
  
  event.respondWith(fetchWithStrategy());
});

// Network-first strategy: try network, fall back to cache
async function networkFirstStrategy(request) {
  log(`Network-first strategy for: ${request.url}`);
  
  try {
    const networkResponse = await fetch(request);
    log(`Network response for: ${request.url}, status: ${networkResponse.status}`);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch {
    log(`Network failure for: ${request.url}, falling back to cache`);
    
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Network error occurred', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache-first strategy: try cache, fall back to network
async function cacheFirstStrategy(request) {
  log(`Cache-first strategy for: ${request.url}`);
  
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    log(`Cache hit for: ${request.url}`);
    
    // Return cached response and update cache in background
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          log(`Updating cache for: ${request.url}`);
          caches.open(CACHE).then(cache => {
            cache.put(request, networkResponse);
          });
        }
      })
      .catch(() => log(`Background update failed for: ${request.url}`));
      
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache response
  log(`Cache miss for: ${request.url}, fetching from network`);
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE);
      log(`Caching new response for: ${request.url}`);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch {
    log(`Network failure for: ${request.url}, no cached response available`);
    return new Response('Resource unavailable', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale-while-revalidate: return cached version immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  log(`Stale-while-revalidate strategy for: ${request.url}`);
  
  const cachedResponse = await caches.match(request);
  
  // Start the fetch but don't wait for it
  if (navigator.onLine) {
    fetch(request.clone())
      .then(networkResponse => {
        if (networkResponse.ok) {
          log(`Updating cache for: ${request.url}`);
          caches.open(CACHE).then(cache => {
            cache.put(request, networkResponse);
          });
        }
      })
      .catch(fetchError => {
        log(`Network failure in stale-while-revalidate for: ${request.url}`, fetchError.message);
      });
  }
  
  // Return the cached response or fetch a new one if not in cache
  return cachedResponse || fetch(request);
} 