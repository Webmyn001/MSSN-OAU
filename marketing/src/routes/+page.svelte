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
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/ui/button";
    import copyTextToClipboard from '$lib/utils/copy.js'
    import slugify from "$lib/utils/slugify.js"
    import SEO from '$lib/components/SEO.svelte';
    import { SITE_URL } from '$lib/config';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { dev } from '$app/environment';
    import HomeSkeleton from '$lib/components/home/HomeSkeleton.svelte';
    import ImagePreloader from '$lib/components/home/ImagePreloader.svelte';

    // Home section components — lazily loaded to reduce initial bundle parse time
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import Programmes from '$lib/components/sections/Programmes.svelte';

    // if (browser) {
    //     // console.log('homepage', data)
    // }


    let {data} = $props();
    
    const pageData = data.page;
    const info = data.info;

    // Collect every image shown on the home page so they can be pre-warmed once,
    // preventing the "re-loading on scroll back up" jank from lazy images.
    const homeImages = [
        '/images/bg-1.webp',
        '/images/pattern.svg',
        '/images/man_1.webp',
        '/images/woman_1.webp',
        '/images/man_2.webp',
        '/images/woman_2.webp',
        '/images/man_3.webp',
        '/images/woman_3.webp',
        '/images/man_4.webp',
        '/images/woman_4.webp',
        '/images/man_5.webp',
        '/images/woman_5.webp',
        '/images/man_6.webp',
        '/images/woman_6.webp',
        '/images/man_7.webp',
        '/images/woman_7.webp',
        ...(data.programmes || []).map(p => p.image).filter(Boolean),
        ...(data.events || []).map(e => e.image || e.imageUrl).filter(Boolean),
        ...(data.latestNews || []).map(n => n.image).filter(Boolean),
        ...(data.blogPosts || []).map(p => p.featured_image).filter(Boolean),
        ...(data.mosques || []).flatMap(m => (m.images || []).slice(0, 1)),
        ...((data.alumni?.sessions) || []).flatMap(s => [
            s.ameer?.photo, s.ameerah?.photo
        ]).filter(Boolean)
    ];

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

    // Dev-only: auto-refresh homepage data so dashboard saves appear immediately
    // without needing a manual reload. Does nothing in production.
    onMount(() => {
        if (!dev) return;
        const id = setInterval(() => invalidate(() => true), 5000);
        return () => clearInterval(id);
    });
</script>

<SEO 
    path="/"
    title="MSSNOAU - Great Ìfẹ́'s Student Muslim Community"
    description="Welcome to the Muslim Students Society of Nigeria, OAU Branch – the official community of Muslim students at Obafemi Awolowo University. Join us for academic excellence, Islamic education, and community engagement."
    images={[
        {
            url: '/images/bg-1.webp',
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
            "url": "/images/bg-1.webp"
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
<Programmes programmes={data?.programmes || []} />
<!-- End Events -->

<!-- Prayer Times -->
{#await import('$lib/components/home/PrayerTimesSection.svelte')}
    <HomeSkeleton />
{:then { default: PrayerTimesSection }}
    <PrayerTimesSection prayerTimes={data?.info?.prayer_times} prayerTimesUpdatedAt={data?.info?.prayerTimesUpdatedAt} hijriDate={data?.info?.hijriDate} shortHijriDate={data?.info?.shortHijriDate} mosques={data?.mosques || []} />
{/await}
<!-- End Prayer Times -->

<!-- Latest News Section -->
{#await import('$lib/components/home/LatestNewsSection.svelte')}
    <HomeSkeleton />
{:then { default: LatestNewsSection }}
    <LatestNewsSection items={data?.latestNews} />
{/await}
<!-- End Latest News Section -->

<!-- Upcoming Events Section -->
{#await import('$lib/components/home/UpcomingEvents.svelte')}
    <HomeSkeleton />
{:then { default: UpcomingEvents }}
    <UpcomingEvents events={data?.events} />
{/await}
<!-- End Upcoming Events Section -->

<!-- Blog Section -->
{#await import('$lib/components/home/BlogSection.svelte')}
    <HomeSkeleton />
{:then { default: BlogSection }}
    <BlogSection posts={data?.blogPosts} />
{/await}
<!-- End Blog Section -->

<!-- Alumni Section -->
{#await import('$lib/components/home/AlumniSection.svelte')}
    <HomeSkeleton />
{:then { default: AlumniSection }}
    <AlumniSection sessions={data?.alumni?.sessions || []} />
{/await}
<!-- End Alumni Section -->

<!-- Suggestions Section -->
{#await import('$lib/components/home/SuggestionsSection.svelte')}
    <HomeSkeleton />
{:then { default: SuggestionsSection }}
    <SuggestionsSection />
{/await}
<!-- End Suggestions Section -->

<!-- Preloads every home image once after first paint so scrolling never re-triggers loads -->
<ImagePreloader images={homeImages} />

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
