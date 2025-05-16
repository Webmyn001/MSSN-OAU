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

    // Home section components
    import UpcomingEvents from '$lib/components/home/UpcomingEvents.svelte';
    import BlogSection from '$lib/components/home/BlogSection.svelte';
    import Donate from '$lib/components/home/Donate.svelte';
    import SuggestionsSection from '$lib/components/home/SuggestionsSection.svelte';
    import PrayerTimesSection from '$lib/components/home/PrayerTimesSection.svelte';

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
    console.log(data?.info?.account)
</script>

<SEO 
    path="/"
    title=""
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
        "@id": "https://mssnoau.org/#webpage",
        "url": "https://mssnoau.org/",
        "name": "Muslim Students Society of Nigeria, OAU Branch | MSSNOAU",
        "isPartOf": {
            "@id": "https://mssnoau.org/#website"
        },
        "about": {
            "@id": "https://mssnoau.org/#organization"
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
<section class="py-32 mx-auto w-full">
    <div class="container flex flex-col items-center text-center w-full">
        <h1 class="text-primary-900 oau -translate-x-3 my-6 text-pretty text-4xl font-bold lg:text-6xl" id="hero-text">We
            are Great <span
                    class="relative oau inline ml-2 mr-12 sm:ml-2 sm:mr-2 lg:ml-4 top-[-6px]"><span
                    class="yoruba oau top-[8px] sm:top-[10px] lg:top-[12px] absolute text-[#28145B] scale-105">Ife's</span><span
                    class="scale-105 oau yoruba absolute -z-10 text-[#EBB957]">Ìfẹ́'s</span></span>
        </h1>
        <!-- #EBB957, #28145B -->
        <p class="mb-8 max-w-3xl text-zinc-600 lg:text-xl">
            community of diverse, forward-thinking and progressive muslim men and women united in faith.
        </p>
            {#await import("$lib/components/Sparkles/Sparkles.svelte") then S}
                {@const Sparkles = S.default}
        <Sparkles
                minSize={0.8}
                maxSize={5}
                particleDensity={400}
                className="w-full mx-[10dvw] h-[20dvh]"
                particleColor="#026d3b"
        />
                {/await}
        <div class="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <button
                    onclick={() => goto('/about')}
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-900 text-white hover:bg-primary-900/90 h-10 px-4 py-2 w-full sm:w-auto">
                About Us
            </button>
            <button
                    onclick={() => goto('our-excos')}
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-primary-100 tet-primary-800 h-10 px-4 py-2 w-full sm:w-auto">
                Our Excos
            </button>
        </div>
    </div>
    <div class="mt-12 aspect-video overflow-clip sm:mt-32 md:aspect-auto md:h-[420px]">
        <div class="relative mx-auto flex max-w-3xl flex-col">
            <div
                    class="absolute right-[calc(100%+63px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_1.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+195px)] top-[52px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_1.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+34px)] top-[144px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_2.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+268px)] top-[164px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_2.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+156px)] top-[240px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_3.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+242px)] top-[340px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_3.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+66px)] top-[366px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_4.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+53px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_4.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+202px)] top-[34px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_5.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+97px)] top-[141px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_5.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+282px)] top-[138px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_6.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+42px)] top-[262px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_6.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+234px)] top-[282px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_7.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+112px)] top-[365px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_7.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div class="container mx-auto">
                <img
                        src="/images/bg-1.webp"
                        loading="lazy"
                        style="object-fit: cover; object-position: center"
                        alt="central mosque of unity"
                        class="mt-2 flex aspect-[16/9] min-h-[300px] max-h-[500px] w-full flex-col items-center overflow-clip rounded-md border border-border bg-zinc-100 shadow-sm sm:rounded-xl"/>

                <!--                <img-->
                <!--                        src="/images/bg-2.webp"-->
                <!--                        style="object-fit: cover; object-position: center"-->
                <!--                        alt="central mosque of unity"-->
                <!--                        class="mt-6 flex aspect-[27/10] max-h-[300px] w-full flex-col items-center overflow-clip rounded-xl border border-border bg-zinc-100 shadow-sm" />-->
            </div>
        </div>
    </div>
</section>
<!-- End Hero -->

<!-- Events -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <div class="relative p-6 md:p-16">
        <!-- Grid -->
        <div class="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div class="mb-10 lg:mb-0 lg:col-span-6 lg:col-start-8 lg:order-2">
                <h2 class="text-2xl text-neutral-800 font-bold sm:text-3xl font-primary">
                    Our Programmes
                </h2>

                <!-- Tab Navs -->
                <nav class="grid gap-4 mt-5 md:mt-10">

                    {#each programmes as programme}
                        <button type="button"
                                onclick={() => {
                                    selectedEvent = programme.title
                                }}
                                class="{selectedEvent === programme.title ? 'bg-white shadow-md hover:border-transparent' : ''} text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                                id={programme.title} aria-selected={selectedEvent === programme.title}>
            <span class="flex gap-x-6">
    {#if programme.title === "Tutorials"}
        <BookOpenText
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Madrasah"}
        <NotebookPen
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Al-Usrah"}
        <Presentation
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Sisters' Circle"}
        <UsersRound
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {/if}
                <span class="grow">
                <span class="block text-lg font-semibold font-secondary {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800">{programme.title}</span>
                    {#if selectedEvent === programme.title}
                <span in:slide out:slide class="block mt-1 text-neutral-800 font-tertiary">{programme.text}</span>
                      {/if}
              </span>
            </span>
                        </button>
                    {/each}

                    <button type="button"
                            onclick={() => {
                                    goto('/programmes')
                                }}
                            class="text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                    >
            <span class="flex gap-x-6">
                <SquareArrowOutUpRight class="shrink-0 mt-2 size-6 md:size-7    text-neutral-800 cursor-pointer"/>
              <span class="grow">
                <span class="block text-lg font-semibold text-neutral-800">See More</span>
              </span>
            </span>
                    </button>

                </nav>
                <!-- End Tab Navs -->
            </div>
            <!-- End Col -->

            <div class="lg:col-span-6">
                <div class="relative">
                    <!-- Tab Content -->
                    <div>
                        <div id="tabs-with-card-1" role="tabpanel" aria-labelledby="tabs-with-card-item-1">
                            {#key selectedImage}
                                <img loading="lazy" class="shadow-xl shadow-gray-200 rounded-xl"
                                     src={selectedImage}
                                     alt={selectedEvent}/>
                            {/key}
                        </div>
                    </div>
                    <!-- End Tab Content -->

                    <!-- SVG Element -->
                    <div class="hidden absolute top-0 end-0 translate-x-20 md:block lg:translate-x-20">
                        <svg class="w-16 h-auto text-primary-800" width="121" height="135" viewBox="0 0 121 135"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                            <path d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                            <path d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <!-- End SVG Element -->
                </div>
            </div>
            <!-- End Col -->
        </div>
        <!-- End Grid -->

        <!-- Background Color -->
        <div class="absolute inset-0 grid grid-cols-12 size-full">
            <div class="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full"></div>
        </div>
        <!-- End Background Color -->
    </div>
</div>
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
