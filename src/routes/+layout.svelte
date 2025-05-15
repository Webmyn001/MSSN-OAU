<script>
    import '../app.css';
    import {JsonLd} from 'svelte-meta-tags';
    import NavBar from "$lib/components/layout/NavBar.svelte";
    import {Toaster} from "$lib/components/ui/sonner";
    import Footer from "$lib/components/layout/Footer.svelte";
    import PageTransition from "$lib/components/layout/transition/PageTransition.svelte";
    import ViewportContainer from "$lib/components/layout/ViewportContainer.svelte";

    let {children, data} = $props();

    const info = $state(data.info)
    
    // Define website-wide SEO constants
    const SITE_NAME = "MSSNOAU"; 
    const SITE_URL = "https://mssnoau.org";
    const DEFAULT_DESCRIPTION = "Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus.";
    const DEFAULT_OG_IMAGE = "https://mssnoau.sirv.com/mssn-logo.png";
    const TWITTER_HANDLE = "@Mssngreatife1";
    const KEYWORDS = "MSSN, MSSNOAU, Muslim Students Society, Obafemi Awolowo University, OAU, Islamic organization, Students society, Nigerian Muslim students, Great Ife";

</script>

<JsonLd
        schema={[
            {
                "@context": "https://schema.org",
                "@type": "NonProfitOrganization",
                "name": "Muslim Students' Society of Nigeria, OAU Branch",
                "alternateName": "MSSNOAU",
                "url": SITE_URL,
                "logo": "https://mssnoau.sirv.com/mssn-logo.png",
                "image": "https://mssnoau.sirv.com/mssn-logo.png",
                "description": "The Muslim Students' Society of Nigeria (MSSN) at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus. Established in 1954, MSSN has grown into a significant presence in Nigerian universities, with the OAU branch playing a pivotal role in the university's spiritual and social life.",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "MSSN OAU Secretariat, Inside Fajuyi Hall, Obafemi Awolowo University.",
                    "addressLocality": "Ile-Ife",
                    "addressRegion": "Osun",
                    "postalCode": "220282",
                    "addressCountry": "Nigeria"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "7.5171491",
                    "longitude": "4.51768994109481"
                },
                "hasMap": "https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7",
                "openingHours": "Mo 09:00-17:00 Tu 09:00-17:00 We 09:00-17:00 Th 09:00-17:00 Fr 09:00-17:00 Sa 09:00-17:00 Su Closed",
                "sameAs": [
                    "https://facebook.com/mssnoau",
                    "https://x.com/Mssngreatife1",
                    "https://www.instagram.com/mssn_oau"
                ],
                "foundingDate": "1954",
                "founder": {
                    "@type": "Person",
                    "name": "Muslim Students' Society of Nigeria"
                },
                "member": {
                    "@type": "OrganizationRole",
                    "member": {
                        "@type": "Person",
                        "name": "Muslim students at Obafemi Awolowo University"
                    }
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "MSSNOAU",
                "url": SITE_URL,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": SITE_URL + "/search?q={search_term_string}"
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
                        "item": SITE_URL
                    }
                ]
            }
        ]}
/>

{#if info && !(info?.maintenance && info?.maintenance_ends)}
    <Toaster richColors/>
    <NavBar/>
    
    <main>
      <PageTransition>
        {@render children()}
      </PageTransition>
    </main>
    
    <ViewportContainer estimatedHeight={600}>
      <Footer/>
    </ViewportContainer>
{:else}
    {#if page.url.pathname !== '/maintenance' && data.showMaintenancePage}
        {#await import("$lib/components/global/Maintenance.svelte") then M}
            <svelte:component this={M.default} />
        {/await}
    {/if}
{/if}
