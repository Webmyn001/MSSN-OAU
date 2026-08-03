// @ts-nocheck
// Sentry Fetch Proxy - Should be at the very top
/*
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  if (originalFetch) {
      // Using bracket notation to assign to window to potentially bypass some linter checks
      // for undeclared properties on the window object in a .js file.
      window['_sentryFetchProxy'] = function(...args) { // Use rest parameters
          // 'arguments' can be used here, but ensure Sentry's own full SDK,
          // when/if you enable it, handles fetch wrapping correctly.
          // This basic proxy might not be fully robust for all fetch use cases
          // or Sentry's deeper integrations.
          return originalFetch.apply(this, args); // Pass args array
      };
      window.fetch = function(...args) { // Use rest parameters
          return window['_sentryFetchProxy'].apply(this, args); // Pass args array
      };
  }
}
*/

// Temporarily commented out Sentry for build testing
// import * as Sentry from '@sentry/sveltekit'; // REMOVING Sentry import
import { deferScripts } from '$lib/utils/scriptLoader';
// import { PUBLIC_SENTRY_DSN } from '$env/static/public'; // REMOVING Sentry DSN import
// import { BrowserTracing } from "@sentry/tracing"; // Removed this import
// import { 평균색 } from '$lib/utils/dominant-color.js'; // Already commented out
// import { dev } from '$app/environment'; // REMOVING dev import if only used by Sentry

// Temporarily commented out Sentry initialization

// Constants for resource optimization
const RESOURCE_HINTS = {
  preconnect: [
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://api.aladhan.com' // Add API domain to preconnect
  ],
  prefetch: [
    '/mssn-logo.webp'
  ]
};

// Scripts to be loaded deferred - moved from anonymous function to named function for better profiling
function loadDeferredScripts() {
  // Delay non-critical scripts 
  deferScripts([
    // Preload any external scripts that will be needed later
    { 
      src: 'https://cdn.jsdelivr.net/npm/preline@2.0.0/dist/preline.min.js', 
      options: { 
        id: 'preline-js', 
        async: true, 
        defer: true, 
        nonce: undefined
      }
    }
  ]);
}

// Performance monitoring
function initializePerfMonitoring() {
  if (typeof window !== 'undefined' && window.performance) {
    // Create Performance Observer
    try {
      const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Only log long tasks (>50ms)
          if (entry.duration > 50) {
            // Use debug level logging to not clutter console
            console.debug(`[Performance] Long task detected: ${entry.name || 'anonymous'} - ${Math.round(entry.duration)}ms`);
          }
        });
      });

      // Observe only longtasks to reduce overhead
      if ('PerformanceObserver' in window) {
        try {
          // Observe long tasks
          perfObserver.observe({ entryTypes: ['longtask'] });
        } catch (err) {
          // Type safe error handling
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.debug('LongTask performance monitoring not supported:', errorMsg);
        }
      }

      // Skip Web Vitals monitoring in development for performance
      if (import.meta.env.MODE === 'production' && window.performance.timing) {
        // Basic performance logging using Navigation Timing API
        window.addEventListener('load', () => {
          setTimeout(() => {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domComplete - timing.domLoading;
            
            console.log(`[Performance] Page load time: ${pageLoadTime}ms`);
            console.log(`[Performance] DOM ready time: ${domReadyTime}ms`);
          }, 0);
        });
      }
    } catch (err) {
      // PerformanceObserver might not be supported
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.debug('Performance monitoring not supported:', errorMsg);
    }
  }
}

// Add resource hints to improve loading performance
function addResourceHints() {
  if (typeof document === 'undefined') return;
  
  // Add preconnect for external domains
  RESOURCE_HINTS.preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    // Also add dns-prefetch as fallback
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = url;
    document.head.appendChild(dnsPrefetch);
  });
  
  // Prefetch critical resources
  RESOURCE_HINTS.prefetch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    // Set appropriate as value based on file extension
    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.webp') || url.endsWith('.png') || url.endsWith('.jpg')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Initialize client-side functionality - main entry point
if (typeof window !== 'undefined') {
  // Execute high priority optimizations immediately
  addResourceHints();
  
  // Don't manually register service worker - SvelteKit will handle it
  // The service worker is now imported from src/service-worker.js

  // Execute lower priority tasks after important content has loaded
  window.addEventListener('load', () => {
    // Initialize performance monitoring
    initializePerfMonitoring();
    
    // Wait for first user interaction or idle time to load non-critical scripts
    const triggerDeferredLoad = () => {
      setTimeout(loadDeferredScripts, 2000);
      
      // Remove listeners after first trigger
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => 
        window.removeEventListener(evt, triggerDeferredLoad)
      );
    };
    
    // Set up listeners for user interaction
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => 
      window.addEventListener(evt, triggerDeferredLoad, { once: true })
    );
    
    // If no interaction after 5 seconds, load scripts anyway
    setTimeout(triggerDeferredLoad, 5000);
  });
}

// Temporary error handler - Simplifying this as Sentry is removed
export async function handleError({ error, event }) {
  console.error("An unexpected error occurred:", error, "Event:", event);
  return {
    message: 'An unexpected error occurred. Please try again later.',
    // Optionally, add more details or a tracking ID if you have a different logging system
  };
}

// Function to extract the dominant color from an image
/*
async function getDominantColor(imageSrc) {
    try {
        const color = await 평균색(imageSrc);
        return color;
    } catch (error) {
        // console.error(`Error extracting dominant color for ${imageSrc}:`, error);
        return '#cccccc'; // Fallback color
    }
}
*/

// Custom event for theme color changes
/*
async function updateThemeColor(event) {
    const imageElement = event.target;
    if (imageElement && imageElement.tagName === 'IMG') {
        const dominantColor = await getDominantColor(imageElement.src);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', dominantColor);
        }
    }
}
*/

// Apply the theme color logic to images with a specific class
/*
function applyDynamicThemeColor() {
    const themedImages = document.querySelectorAll('.themed-image');
    themedImages.forEach(img => {
        if (img.complete) {
            updateThemeColor({ target: img });
        } else {
            img.addEventListener('load', updateThemeColor);
        }
    });
}
*/

// Performance logging (example)
function logPerformanceMetrics() {
    if (typeof window !== "undefined" && window.performance) {
        const navigationEntry = performance.getEntriesByType("navigation")[0];
        if (navigationEntry) {
            // const pageLoadTime = Math.round(navigationEntry.duration); // Commented out unused variable
            // const domReadyTime = Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime); // Commented out unused variable
            // console.log(`[Performance] Page load time: ${pageLoadTime}ms`);
            // console.log(`[Performance] DOM ready time: ${domReadyTime}ms`);
        }
    }
}

// Call on mount or after page navigation
if (typeof window !== "undefined") {
    // Using requestIdleCallback to defer non-critical tasks
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
            // applyDynamicThemeColor(); // Removed call
            logPerformanceMetrics();
        });
    } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
            // applyDynamicThemeColor(); // Removed call
            logPerformanceMetrics();
        }, 2000); 
    }
}
