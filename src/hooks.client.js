// Sentry Fetch Proxy - Should be at the very top
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  if (originalFetch) {
      // Using bracket notation to assign to window to potentially bypass some linter checks
      // for undeclared properties on the window object in a .js file.
      window['_sentryFetchProxy'] = function() {
          // 'arguments' can be used here, but ensure Sentry's own full SDK,
          // when/if you enable it, handles fetch wrapping correctly.
          // This basic proxy might not be fully robust for all fetch use cases
          // or Sentry's deeper integrations.
          return originalFetch.apply(this, arguments);
      };
      window.fetch = function() {
          return window['_sentryFetchProxy'].apply(this, arguments);
      };
  }
}

// Temporarily commented out Sentry for build testing
import { handleErrorWithSentry, replayIntegration, feedbackIntegration } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';
import { deferScripts } from '$lib/utils/scriptLoader';

// Temporarily commented out Sentry initialization

Sentry.init({
  dsn: 'https://8a6c37d91d61d59f93315969a077bace@o4508522730946560.ingest.us.sentry.io/4508522732519424',

  beforeSend(event) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception && event.event_id) {
      Sentry.showReportDialog({
        eventId: event.event_id,
        title: "Assalamu aleikum!",
        subtitle: "It looks like we're having issues (probably a bug).",
        subtitle2: "Our dev team has been notified. Could you perhaps provide us more info on what happened?",
        successMessage: "We've received your feedback. JazakumuLlahu Khayran!"
      });
    }
    return event;
  },

  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [replayIntegration(
      {
        blockAllMedia: true
      }
  ),
    feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "light",
    })
  ],
});

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
    { src: 'https://cdn.jsdelivr.net/npm/preline@2.0.0/dist/preline.min.js', options: { id: 'preline-js', async: true, defer: true } }
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

// Temporary error handler
export const handleError = ({ error }) => {
  console.error('Application error:', error);
  // Return an object with message property
  return {
    message: 'An unexpected error occurred.'
    // Remove custom code property since it's not supported in the error type
  };
};
