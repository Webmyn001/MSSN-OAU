<script>
    export let src = '';
    export let alt = '';
    export let width = undefined;
    export let height = undefined;
    export let loading = 'lazy';
    export let decoding = 'async';
    export let fetchpriority = 'auto'; // high, low, auto
    export let className = '';
    export let sizes = undefined;
    export let onload = undefined;
    
    // TypeScript type assertions
    const loadingAttr = /** @type {'lazy' | 'eager' | null} */ (loading);
    const decodingAttr = /** @type {'async' | 'sync' | 'auto' | null} */ (decoding);
    const fetchPriorityAttr = /** @type {'auto' | 'high' | 'low' | null} */ (fetchpriority);
    
    // Generate srcset for responsive images
    let srcSet = undefined;
    
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
/> 