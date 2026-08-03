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
    
    // Define website-wide SEO constants
</script>

<JsonLd
        schema={[
            {
                "@context": "https://schema.org",
                "@type": "NonProfitOrganization",
                "@id": ORGANIZATION.url + '#organization',
                "name": ORGANIZATION.name,
                "alternateName": ORGANIZATION.shortName,
                "url": ORGANIZATION.url,
                "logo": ORGANIZATION.logo,
                "image": ORGANIZATION.ogImage,
                "description": ORGANIZATION.description,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": ORGANIZATION.address.street,
                    "addressLocality": ORGANIZATION.address.city,
                    "addressRegion": ORGANIZATION.address.state,
                    "postalCode": ORGANIZATION.address.postalCode,
                    "addressCountry": ORGANIZATION.address.country
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": ORGANIZATION.coordinates.latitude,
                    "longitude": ORGANIZATION.coordinates.longitude
                },
                "hasMap": ORGANIZATION.map,
                "contactPoint": [
                    {
                        "@type": "ContactPoint",
                        "email": ORGANIZATION.email,
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
                    ORGANIZATION.socialMedia.facebook
                ],
                "foundingDate": ORGANIZATION.foundingYear,
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
                    { "@type": "Organization", "name": "Programmes and Events", "url": ORGANIZATION.url + "/programmes" },
                    { "@type": "Organization", "name": "Executive Council", "url": ORGANIZATION.url + "/our-excos" },
                    { "@type": "Organization", "name": "Advisory Board", "url": ORGANIZATION.url + "/our-advisors" },
                    { "@type": "Organization", "name": "Alumnae Relations", "url": ORGANIZATION.url + "/alumni" }
                ],
                "knowsAbout": ["Islam", "Student Development", "Community Service", "Islamic Education", "Spiritual Growth", "Academic Excellence"],
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": ORGANIZATION.url
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": ORGANIZATION.url + '#website',
                "name": ORGANIZATION.name,
                "url": ORGANIZATION.url,
                "publisher": {
                    "@id": ORGANIZATION.url + '#organization'
                },
                "inLanguage": "en-NG",
                "about": {
                    "@id": ORGANIZATION.url + '#organization'
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": ORGANIZATION.url + "/search?q={search_term_string}"
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
                        "item": ORGANIZATION.url
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
