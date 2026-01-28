<script>
    /**
     * @typedef {Object} Props
     * @property {string} [src]
     * @property {string} [alt]
     * @property {any} [width]
     * @property {any} [height]
     * @property {string} [loading]
     * @property {string} [decoding]
     * @property {string} [fetchpriority] - high, low, auto
     * @property {string} [className]
     * @property {any} [sizes]
     * @property {any} [onload]
     * @property {any} [onerror]
     */

    /** @type {Props} */
    let {
        src = '',
        alt = '',
        width = undefined,
        height = undefined,
        loading = 'lazy',
        decoding = 'async',
        fetchpriority = 'auto',
        className = '',
        sizes = undefined,
        onload = undefined,
        onerror = undefined
    } = $props();
    
    // TypeScript type assertions
    const loadingAttr = /** @type {'lazy' | 'eager' | null} */ (loading);
    const decodingAttr = /** @type {'async' | 'sync' | 'auto' | null} */ (decoding);
    const fetchPriorityAttr = /** @type {'auto' | 'high' | 'low' | null} */ (fetchpriority);
    
    // Generate srcset for responsive images
    let srcSet = $state(undefined);
    
    if (src && src.startsWith('/')) {
        // For local images, we can generate srcset
        const parts = src.split('.');
        const extension = parts.pop();
        const basePath = parts.join('.');
        
        // Only use the 1x version without trying to load @2x versions that may not exist
        if (extension !== 'svg') {
            srcSet = `${basePath}.${extension} 1x`;
        }
    }

    function handleLoad(event) {
        if (onload) onload(event);
    }
    
    function handleError(event) {
        if (onerror) onerror(event);
    }
</script>

<img
    {src}
    {alt}
    class={className}
    {width}
    {height}
    loading={loadingAttr}
    decoding={decodingAttr}
    fetchpriority={fetchPriorityAttr}
    srcset={srcSet}
    {sizes}
    onload={handleLoad}
    onerror={handleError}
/> 