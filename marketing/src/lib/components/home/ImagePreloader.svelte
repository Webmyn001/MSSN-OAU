<script>
    import { onMount } from 'svelte';

    let { images = [] } = $props();

    function warmCache(urls) {
        const seen = new Set();
        for (const url of urls) {
            if (!url || seen.has(url)) continue;
            seen.add(url);
            const img = new Image();
            img.src = url;
        }
    }

    onMount(() => {
        const all = (Array.isArray(images) ? images : [images]).flat().filter(Boolean);
        // Warm after first paint + idle so it never competes with the LCP image
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => warmCache(all), { timeout: 4000 });
        } else {
            setTimeout(() => warmCache(all), 2000);
        }
    });
</script>
