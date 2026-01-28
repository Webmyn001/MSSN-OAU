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
     * SEO Component for consistent metadata across the site.
     * @param {string} [title=""] - Page title.
     * @param {string} [description=DEFAULT_DESCRIPTION] - Page description.
     * @param {string} [path=""] - Path for canonical URL and Open Graph URL (without domain).
     * @param {string} [type="website"] - Open Graph type.
     * @param {Array<{url: string, width: number, height: number, alt: string}>} [images] - Array of Open Graph image objects. Defaults to DEFAULT_OG_IMAGE.
     * @param {Object} [schema=null] - Custom schema.org JSON-LD data.
     * @param {string[]} [keywords] - SEO keywords (array of strings). Defaults to formatted DEFAULT_KEYWORDS.
     */
    
    /**
     * Helper to convert comma-separated string to string array, or use existing array.
     * @param {string | string[]} kw - The keyword(s) to format.
     * @returns {string[]}
     */
    const formatKeywords = (kw) => {
        if (Array.isArray(kw)) return kw;
        if (typeof kw === 'string') return kw.split(',').map(k => k.trim()).filter(k => k);
        return [];
    };
    
    // Props with defaults
    let {
        title = "",
        description = /** @type {string} */ (DEFAULT_DESCRIPTION),
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
        keywords = formatKeywords(DEFAULT_KEYWORDS) // Default is now processed
    } = $props();
    
    // Ensure externally passed keywords are also formatted if they are a string by mistake
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
        siteName: SITE_NAME, // Corrected from site_name
        type
    }}
    twitter={{
        creator: TWITTER_HANDLE, // Use 'creator' for user handle
        site: TWITTER_HANDLE,    // Often the same as creator or the site's main handle
        cardType: 'summary_large_image'
        // title: formattedTitle, // Usually not needed if cardType is summary_large_image and pulls from OG
        // description: description // Usually not needed if cardType is summary_large_image and pulls from OG
    }}
/>

{#if schema}
<JsonLd schema={schema} />
{/if} 