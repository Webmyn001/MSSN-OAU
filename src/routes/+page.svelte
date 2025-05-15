<script>
    import {
        BookOpenText,
        Copy,
        MapPinned,
        NotebookPen,
        Presentation,
        SquareArrowOutUpRight,
        UsersRound
    } from 'lucide-svelte'
    import { Image } from '$lib/components/ui/image'
    import {slide} from 'svelte/transition'
    import {toast} from 'svelte-sonner'
    import {JsonLd, MetaTags} from 'svelte-meta-tags';
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/ui/button";
    import copyTextToClipboard from '$lib/utils/copy.js'
    import slugify from "$lib/utils/slugify.js"
    
    // New component imports
    import HeroSection from '$lib/components/home/HeroSection.svelte';
    import PrayerTimesSection from '$lib/components/home/PrayerTimesSection.svelte';
    import UpcomingEvents from '$lib/components/home/UpcomingEvents.svelte';
    import Donate from '$lib/components/home/Donate.svelte';
    import Programmes from '$lib/components/sections/Programmes.svelte';
    import BlogSection from '$lib/components/home/BlogSection.svelte';
    import SuggestionsSection from '$lib/components/home/SuggestionsSection.svelte';
    import { programmes } from '$lib/data/programmes';

    let {data} = $props();

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

<!-- Meta Tags -->
<MetaTags
        title="We are OAU Great Ìfẹ́'s Muslim Community"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'We are OAU Great Ìfẹ́\'s Muslim Community | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'Website screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<JsonLd schema={{
            "@type": "WebPage",
            "name": "We are OAU Great Ìfẹ́'s Muslim Community | MSSNOAU",
            "description": "Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU.org"
            }
        }}
/>
<!-- End Meta Tags -->

<!-- Hero Section -->
<HeroSection />
<!-- End Hero Section -->

<!-- Programmes Section -->
<Programmes {programmes} />
<!-- End Programmes Section -->

<!-- Prayer Times Section -->
<PrayerTimesSection />
<!-- End Prayer Times Section -->

<!-- Upcoming Events Section -->
<UpcomingEvents {data} />
<!-- End Upcoming Events Section -->

<!-- Blog Section -->
<BlogSection posts={data.posts} />
<!-- End Blog Section -->

<!-- Donation CTA -->
{#if data.info && data.info.account}
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
