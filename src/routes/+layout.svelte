<script>
    import '../app.css';
    import {JsonLd} from 'svelte-meta-tags';
    import {afterNavigate} from "$app/navigation";
    import NavBar from "$lib/components/NavBar.svelte";
    import {Toaster} from "$lib/components/ui/sonner";
    import Footer from "$lib/components/Footer.svelte";

    let {children, data} = $props();

    const info = $state(data.info)




    afterNavigate(() => {
        window.HSStaticMethods.autoInit();
    });
</script>

<JsonLd
        schema={[{
            "@context": "http://www.schema.org",
            "@type": ["EducationalOrganization", "NonProfitOrganization"],
            "name": "MSSNOAU",
            "url": "https://mssnoau-frontend.vercel.app",
            "logo": "https://mssnoau.sirv.com/mssn-logo.png",
            "image": "https://mssnoau.sirv.com/mssn-logo.png",
            "description": "The Muslim Students' Society of Nigeria (MSSN) at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus. Established in 1954, MSSN has grown into a significant presence in Nigerian universities, with the OAU branch playing a pivotal role in the university's spiritual and social life.",
            "address": {
            "@type": "PostalAddress",
                "streetAddress": "MSSN OAU Secretariat, Inside Fajuyi Hall, Obafemi Awolowo University.",
                "addressLocality": "Ile-Ife",
                "addressRegion": "Osun",
                "addressCountry": "Nigeria"
        },
            "geo": {
            "@type": "GeoCoordinates",
                "latitude": "7.5171491",
                "longitude": "4.51768994109481"
        },
            "hasMap": "https://maps.app.goo.gl/r4T4g5NCUW36dGeZ7",
            "openingHours": "Mo 09:00-17:00 Tu 09:00-17:00 We 09:00-17:00 Th 09:00-17:00 Fr 09:00-17:00 Sa 09:00-17:00 Su Closed"
        },{
"@context": "http://schema.org",
"@type": "WebSite",
  "name": "MSSNOAU.org",
  "url": "https://mssnoau-frontend.vercel.app",
}
]}
/>

{#if info && !(info?.maintenance && info?.maintenance_ends)}
    <Toaster richColors/>
    <NavBar/>
    {@render children()}
    <Footer/>
{:else}
        {#await import("$lib/components/Maintenance.svelte") then M}
            {@const Maintenance = M.default}
            <Maintenance time={info?.maintenance_ends} />
            {:catch error}
            <p>{error?.message}</p>
        {/await}
{/if}
