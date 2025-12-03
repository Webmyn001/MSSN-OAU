<script>
    import {
        BookOpenText,
        Copy,
        Clock,
        MapPinned,
        NotebookPen,
        Presentation,
        SquareArrowOutUpRight,
        UsersRound
    } from '@lucide/svelte'
    import { Image } from '$lib/components/ui/image'
    import {slide} from 'svelte/transition'
    import {toast} from 'svelte-sonner'
    import {Badge} from "$lib/components/ui/badge/index.js";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/ui/button";
    import copyTextToClipboard from '$lib/utils/copy.js'
    import slugify from "$lib/utils/slugify.js"
    import SEO from '$lib/components/SEO.svelte';
    import { programmes } from '$lib/data/programmes';
    import { browser } from '$app/environment';
    import { SITE_URL } from '$lib/config';

    // Home section components
    import UpcomingEvents from '$lib/components/home/UpcomingEvents.svelte';
    import BlogSection from '$lib/components/home/BlogSection.svelte';
    import Donate from '$lib/components/home/Donate.svelte';
    import SuggestionsSection from '$lib/components/home/SuggestionsSection.svelte';
    import PrayerTimesSection from '$lib/components/home/PrayerTimesSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import Programmes from '$lib/components/sections/Programmes.svelte';
    import Footer from '$lib/components/layout/Footer.svelte';

    // if (browser) {
    //     // console.log('homepage', data)
    // }


    let {data} = $props();
    
    const pageData = data.page;
    const info = data.info;

    const copyAccNumber = async () => {
        if (!data.info || !data.info.account) return;
        
        const copy = await copyTextToClipboard(data.info.account.number)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        if (!data.info || !data.info.account) return;
        
        const copy = await copyTextToClipboard(`Bank Name: ${data.info.account.bank}\nAccount Name: ${data.info.account.name}\nAccount Number: ${data.info.account.number}`)
        if (copy) {
            toast.success("Account Details Copied!")
        } else {
            toast.error("Failed to copy Account Details!")
        }
    }

    let selectedEvent = $state("Tutorials")
    let selectedMosqueObject = $state(null)
    let showMosqueModal = $state(false);

    const selectedImage = $derived(programmes.find(event => event.title === selectedEvent)?.image)

    onMount(() => {
        if (data.posts && data.posts.length === 0) {
            toast.error("Blog server is temporarily unavailable.", {
                duration: Number.POSITIVE_INFINITY,
                action: {
                    label: "Go to blog",
                    onClick: () => window.open("https://annuurpress.org.ng")
                }
            })
        }
    })
</script>

<SEO 
    path="/"
    title="MSSNOAU - Great Ìfẹ́'s Student Muslim Community"
    description="Welcome to the Muslim Students Society of Nigeria, OAU Branch – the official community of Muslim students at Obafemi Awolowo University. Join us for academic excellence, Islamic education, and community engagement."
    images={[
        {
            url: 'https://mssnoau.sirv.com/mssn-home.jpg',
            width: 1200,
            height: 630,
            alt: 'MSSNOAU - Muslim Students Society of Nigeria, OAU Branch'
        }
    ]}
    keywords="MSSN, MSSNOAU, Muslim Students Society, Obafemi Awolowo University, OAU, Islamic organization, Muslim community, prayer times, Islamic events, donate to MSSN, Great Ife"
    schema={{
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        "url": `${SITE_URL}/`,
        "name": "Muslim Students Society of Nigeria, OAU Branch | MSSNOAU",
        "isPartOf": {
            "@id": `${SITE_URL}/#website`
        },
        "about": {
            "@id": `${SITE_URL}/#organization`
        },
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": "https://mssnoau.sirv.com/mssn-home.jpg"
        },
        "inLanguage": "en-US"
    }}
/>

<!-- Meta Tags -->
<!-- Removed direct MetaTags and JsonLd usage -->
<!-- End Meta Tags -->

<!-- Hero -->
<HeroSection />
<!-- End Hero -->

<!-- Events -->
<Programmes />
<!-- End Events -->

<!-- Prayer Times -->
<PrayerTimesSection />
<!-- End Prayer Times -->

<!-- Upcoming Events Section -->
<UpcomingEvents events={data?.events} />
<!-- End Upcoming Events Section -->

<!-- Blog Section -->
<BlogSection posts={data.posts} />
<!-- End Blog Section -->

<!-- Donation CTA -->
 <i class="hidden" id="donate"></i>
{#if data.info && data.info.info && data.info.info.account}
<Donate />
{/if}
<!-- End Donation CTA -->

<!-- Suggestions Section -->
<SuggestionsSection />
<!-- End Suggestions Section -->

<style>
    .yoruba {
        font-family: "Charis SIL", sans-serif;
        top: 12px;
    }

    /* charis-sil-latin-400-normal */
    @font-face {
        font-family: 'Charis SIL';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff) format('woff');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    .oau {
        cursor: url('/oau-logo.png') 32 32, auto;
    }
</style>
