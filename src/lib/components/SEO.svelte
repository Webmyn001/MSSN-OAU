<script>
    import { MetaTags, JsonLd } from 'svelte-meta-tags';
    import { 
        SITE_NAME, 
        SITE_URL, 
        DEFAULT_DESCRIPTION, 
        DEFAULT_KEYWORDS,
        DEFAULT_OG_IMAGE,
        TWITTER_HANDLE
    } from '$lib/config';

    /**
     * SEO Component for consistent metadata across the site
     * @type {{ 
     *   title?: string,
     *   description?: string,
     *   path?: string,
     *   type?: string,
     *   images?: Array<{url: string, width: number, height: number, alt: string}>,
     *   schema?: Object,
     *   keywords?: string[]
     * }}
     */
    
    // Helper to convert comma-separated string to string array, or use existing array
    const formatKeywords = (kw) => {
        if (Array.isArray(kw)) return kw;
        if (typeof kw === 'string') return kw.split(',').map(k => k.trim()).filter(k => k);
        return [];
    };

    // Props with defaults
    let {
        title = "",
        description = DEFAULT_DESCRIPTION,
        path = "",
        type = "website",
        images = [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: SITE_NAME
            }
        ],
        schema = null,
        keywords = formatKeywords(DEFAULT_KEYWORDS)
    } = $props();
    
    // Ensure externally passed keywords are also formatted if they are a string by mistake
    // However, ideally, consumers should pass string[] directly.
    // Forcing to array if it's a string passed as prop:
    const finalKeywords = $derived(formatKeywords(keywords));

    // Format the canonical and OG URLs
    const url = path ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}` : SITE_URL;
    
    // Format the title
    const formattedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
</script>

<MetaTags
    title={title}
    titleTemplate={title ? `%s | ${SITE_NAME}` : SITE_NAME}
    description={description}
    canonical={url}
    keywords={finalKeywords}
    openGraph={{
        url,
        title: formattedTitle,
        description,
        images,
        site_name: SITE_NAME,
        type
    }}
    twitter={{
        handle: TWITTER_HANDLE,
        site: TWITTER_HANDLE,
        cardType: 'summary_large_image'
    }}
/>

{#if schema}
<JsonLd schema={schema} />
{/if} 