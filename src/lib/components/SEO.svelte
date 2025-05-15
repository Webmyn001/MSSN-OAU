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
     * @param {string} title - Page title 
     * @param {string} description - Page description
     * @param {string} path - Path for canonical URL and Open Graph URL (without domain)
     * @param {string} type - Open Graph type (default: 'website')
     * @param {Array} images - Array of Open Graph image objects
     * @param {Object} schema - Custom schema.org JSON-LD data
     * @param {string} keywords - SEO keywords (comma separated)
     */
    
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
        keywords = DEFAULT_KEYWORDS
    } = $props();
    
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
    keywords={keywords}
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