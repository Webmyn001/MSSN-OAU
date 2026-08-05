<script>
    import '../app.css';
    import {JsonLd} from 'svelte-meta-tags';
    import NavBar from "$lib/components/layout/NavBar.svelte";
    import {Toaster} from "$lib/components/ui/sonner";
    import Footer from "$lib/components/layout/Footer.svelte";
    import PageTransition from "$lib/components/layout/transition/PageTransition.svelte";
    import ViewportContainer from "$lib/components/layout/ViewportContainer.svelte";
	import { page } from '$app/state';
    import { ORGANIZATION } from "$lib/config";
    let {children, data} = $props();

    const info = $derived(data?.info)

    // Use the live request origin so JSON-LD, canonical and OG URLs always match the deployed domain
    const org = $derived({ ...ORGANIZATION, url: page?.url?.origin || ORGANIZATION.url })
</script>

<JsonLd
        schema={[
            {
                "@context": "https://schema.org",
                "@type": "NonProfitOrganization",
                "@id": org.url + '#organization',
                "name": org.name,
                "alternateName": org.shortName,
                "url": org.url,
                "logo": org.logo,
                "image": org.ogImage,
                "description": org.description,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": org.address.street,
                    "addressLocality": org.address.city,
                    "addressRegion": org.address.state,
                    "postalCode": org.address.postalCode,
                    "addressCountry": org.address.country
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": org.coordinates.latitude,
                    "longitude": org.coordinates.longitude
                },
                "hasMap": org.map,
                "contactPoint": [
                    {
                        "@type": "ContactPoint",
                        "email": org.email,
                        "contactType": "General Enquiry",
                        "areaServed": "NG",
                        "availableLanguage": ["en", "yo"]
                    },
                    {
                        "@type": "ContactPoint",
                        "telephone": "+234-814-685-1394",
                        "contactType": "Financial Enquiries",
                        "areaServed": "NG",
                        "availableLanguage": ["en", "yo"]
                    }
                ],
                "openingHours": "Mo 09:00-17:00 Tu 09:00-17:00 We 09:00-17:00 Th 09:00-17:00 Fr 09:00-17:00 Sa 09:00-17:00 Su Closed",
                "sameAs": [
                    org.socialMedia.facebook
                ],
                "foundingDate": org.foundingYear,
                "founder": {
                    "@type": "Organization",
                    "name": "Muslim Students' Society of Nigeria"
                },
                "member": {
                    "@type": "OrganizationRole",
                    "member": {
                        "@type": "Person",
                        "name": "Muslim students at Obafemi Awolowo University"
                    },
                    "roleName": "Member"
                },
                "department": [
                    { "@type": "Organization", "name": "Programmes and Events", "url": org.url + "/programmes" },
                    { "@type": "Organization", "name": "Executive Council", "url": org.url + "/our-excos" },
                    { "@type": "Organization", "name": "Advisory Board", "url": org.url + "/our-advisors" },
                    { "@type": "Organization", "name": "Alumnae Relations", "url": org.url + "/alumni" }
                ],
                "knowsAbout": ["Islam", "Student Development", "Community Service", "Islamic Education", "Spiritual Growth", "Academic Excellence"],
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": org.url
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": org.url + '#website',
                "name": org.name,
                "url": org.url,
                "publisher": {
                    "@id": org.url + '#organization'
                },
                "inLanguage": "en-NG",
                "about": {
                    "@id": org.url + '#organization'
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": org.url + "/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": org.url
                    }
                ]
            }
        ]}
/>

{#if info && !(info?.maintenance && info?.maintenance_ends)}
    <Toaster richColors/>
    <NavBar/>
    <div id="modal-portal"></div>
    
    <main>
      <PageTransition>
        {@render children()}
      </PageTransition>
    </main>
    
    <ViewportContainer estimatedHeight={600}>
      <Footer/>
    </ViewportContainer>
{:else}
    {#if page.url.pathname !== '/maintenance' && info?.maintenance} 
        {#await import("$lib/components/global/Maintenance.svelte") then M}
        {@const Maintenance = M.default}
            <Maintenance time={info?.maintenance_ends} />
        {/await}
    {/if}
{/if}
