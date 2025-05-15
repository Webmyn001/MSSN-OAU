/**
 * Defer script loading to improve initial page performance
 * 
 * @param {string} src - Script URL to load
 * @param {Object} options - Options for script loading
 * @param {boolean} [options.async=true] - Whether to load the script asynchronously
 * @param {boolean} [options.defer=true] - Whether to defer loading the script
 * @param {Function} [options.callback] - Callback function to run when script loads
 * @param {string} [options.id] - Optional ID to assign to the script element
 * @returns {HTMLScriptElement|null} The created script element or null
 */
export function loadScript(src, options = {}) {
    const { 
        async = true,
        defer = true,
        callback = null,
        id = null
    } = options;
    
    if (typeof window === 'undefined') return null; // SSR check
    
    // Check if script is already loaded
    if (id && document.getElementById(id)) {
        if (callback) callback();
        return null;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    if (id) script.id = id;
    
    if (callback && typeof callback === 'function') {
        script.onload = (event) => {
            callback(event);
        };
    }
    
    document.body.appendChild(script);
    return script;
}

/**
 * Defer loading of scripts until after the page is interactive
 * 
 * @param {Array<{src: string, options?: Object}>} scripts - Array of script objects to load
 */
export function deferScripts(scripts) {
    if (typeof window === 'undefined') return; // SSR check
    
    // Wait until page is interactive
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => loadScriptsSequentially(scripts), 1000);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => loadScriptsSequentially(scripts), 1000);
        });
    }
}

/**
 * Load scripts sequentially to avoid blocking the main thread
 * 
 * @param {Array<{src: string, options?: Object}>} scripts - Array of script objects to load
 * @param {number} index - Current index in the scripts array
 */
function loadScriptsSequentially(scripts, index = 0) {
    if (index >= scripts.length) return;
    
    const { src, options = {} } = scripts[index];
    
    loadScript(src, {
        ...options,
        callback: () => {
            // Load next script after this one is loaded
            loadScriptsSequentially(scripts, index + 1);
        }
    });
}

/**
 * Defer loading of non-critical CSS
 * 
 * @param {string} href - CSS URL to load
 * @param {string|null} [id=null] - Optional ID for the stylesheet
 * @returns {HTMLLinkElement|null} The created link element or null
 */
export function loadCSS(href, id = null) {
    if (typeof window === 'undefined') return null; // SSR check
    
    // Check if stylesheet is already loaded
    if (id && document.getElementById(id)) {
        return null;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
        link.media = 'all';
    };
    
    if (id) link.id = id;
    
    document.head.appendChild(link);
    return link;
} 