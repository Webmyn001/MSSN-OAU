<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import {slide} from 'svelte/transition'
    import {onMount} from "svelte";
    import {MetaTags} from "svelte-meta-tags";


    /**
     * @type {MiniEvent[]}
     */
    const programmes = [
        {
            title: "Tutorials",
            text: "Academic tutorials organised by the Academic Committee.",
            icon: "/images/svgs/book_and_pencil.svg",
            image: "/images/chalkboard.webp"
        },
        {
            title: "Madrasah",
            text: "Classes on Islamic Education organised by the Islamic Affairs Board.",
            icon: "/images/svgs/book_reading.svg",
            image: "/images/madrasah.webp"
        },
        {
            title: "Al-Usrah",
            text: "A weekly meetup centering on Islamic perspective of certain issues.",
            icon: "/images/svgs/classroom.svg",
            image: "/images/al-usrah.webp"
        },
        {
            title: "Freshers' Orientation",
            text: "A programme to welcome and offer guidance to freshmen.",
            icon: "/images/svgs/student_male.svg",
            image: "/images/freshers.webp"
        },
        {
            title: "Sisters' Circle",
            text: "A weekly sisters-only meetup that aims to strengthen the bonds between sisters, and discuss issues pertaining to them.",
            icon: "/images/svgs/female.svg",
            image: "/images/sisters-circle.webp"
        },
        {
            title: "Bro Code",
            text: "A one-of-a-kind brother-only meetup session for letting off some steam and engaging in fun activities.",
            icon: "/images/svgs/rodeo.svg",
            image: "/images/brocode.webp"
        },
        {
            title: "Eid Fest",
            text: "Once in a year, a special day to celebrate another special day, only without the stress.",
            icon: "/images/svgs/food.svg",
            image: "/images/eid-fest.webp"
        },
        {
            title: "Taraweeh",
            text: "Throughout the holy month of Ramadhan in all the hall mosques and at the Central Mosque of Unity.",
            icon: "/images/svgs/night.svg",
            image: "/images/taraweeh.webp"
        },
    ];


    let selectedProgramme = "Tutorials"
    $: selectedImage = programmes.find(event => event.title === selectedProgramme)?.image

    let mode = 1;

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') ?? 1;
        mode = Number(type)
    })
</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Programmes"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Our Programmes | MSSNOAU',
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
<!-- End Meta Tags -->

<PageHeader>
    Our Programmes
</PageHeader>

{#if mode === 2}
<!-- Programmes -->
<section class="py-6">
    <div class="mx-auto max-w-5xl space-y-16 px-6">

        <div class="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
            {#each programmes as programme}
            <div class="space-y-2">
                <div class="flex items-center flex-col gap-4">
                    <img class="size-12 sm:size-16 md:size-20 lg:size-24" alt={programme.title} src={programme.image} />
                    <h3 class="text-title text-sm font-medium">{programme.title}</h3>
                </div>
                <p class="text-body text-center text-sm">{programme.text}</p>
            </div>
                {/each}
        </div>
    </div>
</section>
<!-- End Programmes -->

{:else}
<!-- Programmes -->
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
                                    selectedProgramme = programme.title
                                }}
                                class="{selectedProgramme === programme.title ? 'bg-white shadow-md hover:border-transparent' : ''} text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                                id={programme.title} aria-selected={selectedProgramme === programme.title}>
            <span class="flex gap-x-6">
                <img class="shrink-0 mt-2 size-12 md:size-14 {selectedProgramme === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer" src={programme.icon} alt={programme.title} />
                <span class="grow">
                <span class="block text-lg font-semibold font-secondary {selectedProgramme === programme.title ? 'text-primary-700' : ''} text-neutral-800">{programme.title}</span>
                    {#if selectedProgramme === programme.title}
                <span in:slide out:slide class="block mt-1 text-neutral-800 font-tertiary">{programme.text}</span>
                      {/if}
              </span>
            </span>
                        </button>
                    {/each}

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
                                     alt={selectedProgramme}/>
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
<!-- End Programmes -->
    {/if}