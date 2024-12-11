<script>
    import Sparkles from "$lib/components/Sparkles/Sparkles.svelte";
    import {Clock} from 'lucide-svelte'
    import {slide} from 'svelte/transition'


    const events = [
        {
            title: "Tutorials",
            text: "Academic tutorials organised by the Academic Committee.",
            image: "/images/chalkboard.png"
        },
        {
            title: "Madrasah",
            text: "Classes on Islamic Education organised by the Islamic Affairs Board.",
            image: "/images/madrasah.png"
        },
        {
            title: "Al-Usrah",
            text: "A weekly meetup centering on Islamic perspective of certain issues.",
            image: "/images/al-usrah.png"
        }, {
            title: "Freshers' Orientation",
            text: "An programme to welcome and offer guidance to freshmen.",
            image: "/images/freshers.png"
        }, {
            title: "Sisters' Circle",
            text: "A weekly sisters-only meetup that aims to strengthen the bonds between sisters, and discuss issues pertaining to them.",
            image: "/images/sisters-circle.png"
        }, {
            title: "Bro Code",
            text: "A one-of-a-kind brother-only meetup session for letting off some steam and engaging in fun activities.",
            image: "/images/brocode.png"
        }, {
            title: "Eid Fest",
            text: "Once in a year, a special day to celebrate another special day, only without the stress.",
            image: "/images/eid-fest.png"
        }, {
            title: "Taraweeh",
            text: "Throughout the holy month of Ramadhan in all the hall mosques and at the Central Mosque of Unity.",
            image: "/images/taraweeh.png"
        },
    ]

    let selectedEvent = "Tutorials"

    $: selectedImage = events.find(event => event.title === selectedEvent)?.image
</script>
<!-- Hero -->
<section class="py-32 mx-auto">
    <div class="container flex flex-col items-center text-center w-full">
        <h1 class="text-primary-900 my-6 text-pretty text-4xl font-bold lg:text-6xl" id="hero-text">We are Great <span
                class="relative inline ml-2 mr-12 sm:ml-2 sm:mr-2 lg:ml-4"><span
                class="yoruba top-[8px] sm:top-[10px] lg:top-[12px] absolute text-[#28145B] scale-105">Ife's</span><span
                class="scale-105 yoruba absolute -z-10 text-[#EBB957]">Ìfẹ́'s</span></span>
        </h1>
        <!-- #EBB957, #28145B -->
        <p class="mb-8 max-w-3xl text-zinc-600 lg:text-xl">
            community of diverse, forward-thinking and progressive muslim men and women united in faith.
        </p>
        <Sparkles
                minSize={0.8}
                maxSize={5}
                particleDensity={400}
                className="w-full h-[20dvh]"
                particleColor="#026d3b"
        />
        <div class="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <button
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-900 text-white hover:bg-primary-900/90 h-10 px-4 py-2 w-full sm:w-auto">
                About Us
            </button>
            <button
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-primary-100 tet-primary-800 h-10 px-4 py-2 w-full sm:w-auto">
                Our Excos
            </button>
        </div>
    </div>
    <div class="mt-12 aspect-video overflow-clip sm:mt-32 md:aspect-auto md:h-[420px]">
        <div class="relative mx-auto flex max-w-3xl flex-col">
            <div
                    class="absolute right-[calc(100%+63px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_1.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+195px)] top-[52px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_1.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+34px)] top-[144px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_2.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+268px)] top-[164px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_2.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+156px)] top-[240px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_3.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+242px)] top-[340px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_3.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+66px)] top-[366px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_4.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+53px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_4.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+202px)] top-[34px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_5.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+97px)] top-[141px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_5.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+282px)] top-[138px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_6.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+42px)] top-[262px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_6.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+234px)] top-[282px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_7.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+112px)] top-[365px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_7.png" alt="placeholder hero"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div class="container mx-auto">
                <img
                        src="/images/bg-1.png"
                        style="object-fit: cover; object-position: center"
                        alt="central mosque of unity"
                        class="mt-2 flex aspect-[16/9] min-h-[300px] max-h-[500px] w-full flex-col items-center overflow-clip rounded-md border border-border bg-zinc-100 shadow-sm sm:rounded-xl"/>

                <!--                <img-->
                <!--                        src="/images/bg-2.jpg"-->
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
                <h2 class="text-2xl text-gray-800 font-bold sm:text-3xl font-primary">
                    Our Events
                </h2>

                <!-- Tab Navs -->
                <nav class="grid gap-4 mt-5 md:mt-10">

                    {#each events as event}
                        <button type="button"
                                on:click={() => {
                                    selectedEvent = event.title
                                }}
                                class="{selectedEvent === event.title ? 'bg-white shadow-md hover:border-transparent' : ''} text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                                id={event.title} aria-selected={selectedEvent === event.title}>
            <span class="flex gap-x-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === event.title ? 'text-primary-700' : ''} text-gray-800 cursor-pointer"><path
                        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path
                        d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path
                        d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path
                        d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
              <span class="grow">
                <span class="block text-lg font-semibold {selectedEvent === event.title ? 'text-primary-700' : ''} text-gray-800">{event.title}</span>
                  {#if selectedEvent === event.title}
                <span in:slide out:slide class="block mt-1 text-gray-800">{event.text}</span>
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
                                <img class="shadow-xl shadow-gray-200 rounded-xl"
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


<!-- Prayer Times -->
<div id="prayer-times" class="mx-[20dvw]">
    <h1 class="mx-auto font-primary text-primary-800 text-2xl sm:text-3xl my-8">Prayer Times</h1>
    <!-- Item -->
    <div class="group relative flex gap-x-5">
        <!-- Icon -->
        <div class="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-primary-200">
            <div class="relative z-10 size-6 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="shrink-0 size-6 text-primary-700">
                    <path d="M23.925781 3.9257812C22.918781 3.9257812 21.957625 4.2234375 21.140625 4.7734375L28.09375 11.689453C28.63475 10.877453 28.925781 9.9237812 28.925781 8.9257812C28.925781 7.5897812 28.404937 6.335625 27.460938 5.390625C26.516938 4.445625 25.261781 3.9257812 23.925781 3.9257812 z M 20.369141 5.4140625C18.443141 7.3650625 18.448625 10.518937 20.390625 12.460938C21.334625 13.404938 22.589781 13.925781 23.925781 13.925781C25.259781 13.925781 26.511078 13.405844 27.455078 12.464844L20.369141 5.4140625 z M 29.519531 16.083984C27.738531 16.083984 26.264766 16.945969 24.884766 18.792969L21.003906 23.886719L16.144531 19.849609C14.871531 18.791609 12.977922 18.969188 11.919922 20.242188C10.862922 21.514187 11.037547 23.408797 12.310547 24.466797L19.667969 30.572266C19.689969 30.590266 19.730813 30.616859 19.757812 30.630859C21.024812 31.565859 22.799547 31.354109 23.810547 30.162109L28.144531 24.447266C28.312531 24.227266 28.62575 24.185562 28.84375 24.351562C29.06475 24.518563 29.108406 24.831734 28.941406 25.052734L24.146484 31.376953L24.146484 34.515625L17.042969 39.699219C15.961969 40.523219 15.569813 42.079313 16.132812 43.320312C16.244416 43.566503 16.394083 43.794451 16.570312 44L12 44C11.447 44 11 44.448 11 45C11 45.552 11.447 46 12 46L43 46C43.553 46 44 45.552 44 45C44 44.448 43.553 44 43 44L37.476562 44C37.912841 43.478911 38.1875 42.816996 38.1875 42.085938C38.1875 40.431938 36.8425 39.082031 35.1875 39.082031L33.298828 39.082031C33.307828 39.075031 33.313266 39.0685 33.322266 39.0625L29.070312 39.0625C28.794313 39.0625 28.570312 38.8385 28.570312 38.5625C28.570312 38.2865 28.794313 38.0625 29.070312 38.0625L34.267578 38.0625C34.818578 37.2855 35.146484 36.339406 35.146484 35.316406L35.146484 21.457031C35.146484 18.494031 32.736437 16.083984 29.773438 16.083984L29.519531 16.083984 z"
                          fill="#007C40"/>
                </svg>
            </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pb-8 group-last:pb-0">
            <h3 class="mb-1 text-xs text-primary-700 font-bold font-secondary">
                Subhi
            </h3>

            <ul class="list-disc ms-6 mt-3 space-y-1.5">
                <li class="ps-1 text-sm text-gray-600">
                    Adhan
                    <span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:30 AM
                    </span>
                </span>
                </li>
                <li class="ps-1 text-sm text-gray-600">
                    Iqamah<span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:45 AM
                    </span>
                </span>
                </li>
            </ul>
            
        </div>
        <!-- End Right Content -->
    </div>
    <!-- End Item -->

    <!-- Item -->
    <div class="group relative flex gap-x-5">
        <!-- Icon -->
        <div class="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-primary-200">
            <div class="relative z-10 size-6 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="shrink-0 size-6 text-primary-700">
                    <path d="M23.925781 3.9257812C22.918781 3.9257812 21.957625 4.2234375 21.140625 4.7734375L28.09375 11.689453C28.63475 10.877453 28.925781 9.9237812 28.925781 8.9257812C28.925781 7.5897812 28.404937 6.335625 27.460938 5.390625C26.516938 4.445625 25.261781 3.9257812 23.925781 3.9257812 z M 20.369141 5.4140625C18.443141 7.3650625 18.448625 10.518937 20.390625 12.460938C21.334625 13.404938 22.589781 13.925781 23.925781 13.925781C25.259781 13.925781 26.511078 13.405844 27.455078 12.464844L20.369141 5.4140625 z M 29.519531 16.083984C27.738531 16.083984 26.264766 16.945969 24.884766 18.792969L21.003906 23.886719L16.144531 19.849609C14.871531 18.791609 12.977922 18.969188 11.919922 20.242188C10.862922 21.514187 11.037547 23.408797 12.310547 24.466797L19.667969 30.572266C19.689969 30.590266 19.730813 30.616859 19.757812 30.630859C21.024812 31.565859 22.799547 31.354109 23.810547 30.162109L28.144531 24.447266C28.312531 24.227266 28.62575 24.185562 28.84375 24.351562C29.06475 24.518563 29.108406 24.831734 28.941406 25.052734L24.146484 31.376953L24.146484 34.515625L17.042969 39.699219C15.961969 40.523219 15.569813 42.079313 16.132812 43.320312C16.244416 43.566503 16.394083 43.794451 16.570312 44L12 44C11.447 44 11 44.448 11 45C11 45.552 11.447 46 12 46L43 46C43.553 46 44 45.552 44 45C44 44.448 43.553 44 43 44L37.476562 44C37.912841 43.478911 38.1875 42.816996 38.1875 42.085938C38.1875 40.431938 36.8425 39.082031 35.1875 39.082031L33.298828 39.082031C33.307828 39.075031 33.313266 39.0685 33.322266 39.0625L29.070312 39.0625C28.794313 39.0625 28.570312 38.8385 28.570312 38.5625C28.570312 38.2865 28.794313 38.0625 29.070312 38.0625L34.267578 38.0625C34.818578 37.2855 35.146484 36.339406 35.146484 35.316406L35.146484 21.457031C35.146484 18.494031 32.736437 16.083984 29.773438 16.083984L29.519531 16.083984 z"
                          fill="#007C40"/>
                </svg>
            </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pb-8 group-last:pb-0">
            <h3 class="mb-1 text-xs text-primary-700 font-bold font-secondary">
                Dhuhr
            </h3>

            <ul class="list-disc ms-6 mt-3 space-y-1.5">
                <li class="ps-1 text-sm text-gray-600">
                    Adhan
                    <span
                            class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:30 AM
                    </span>
                </span>
                </li>
                <li class="ps-1 text-sm text-gray-600">
                    Iqamah<span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:45 AM
                    </span>
                </span>
                </li>
            </ul>

        </div>
        <!-- End Right Content -->
    </div>
    <!-- End Item -->

    <!-- Item -->
    <div class="group relative flex gap-x-5">
        <!-- Icon -->
        <div class="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-primary-200">
            <div class="relative z-10 size-6 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="shrink-0 size-6 text-primary-700">
                    <path d="M23.925781 3.9257812C22.918781 3.9257812 21.957625 4.2234375 21.140625 4.7734375L28.09375 11.689453C28.63475 10.877453 28.925781 9.9237812 28.925781 8.9257812C28.925781 7.5897812 28.404937 6.335625 27.460938 5.390625C26.516938 4.445625 25.261781 3.9257812 23.925781 3.9257812 z M 20.369141 5.4140625C18.443141 7.3650625 18.448625 10.518937 20.390625 12.460938C21.334625 13.404938 22.589781 13.925781 23.925781 13.925781C25.259781 13.925781 26.511078 13.405844 27.455078 12.464844L20.369141 5.4140625 z M 29.519531 16.083984C27.738531 16.083984 26.264766 16.945969 24.884766 18.792969L21.003906 23.886719L16.144531 19.849609C14.871531 18.791609 12.977922 18.969188 11.919922 20.242188C10.862922 21.514187 11.037547 23.408797 12.310547 24.466797L19.667969 30.572266C19.689969 30.590266 19.730813 30.616859 19.757812 30.630859C21.024812 31.565859 22.799547 31.354109 23.810547 30.162109L28.144531 24.447266C28.312531 24.227266 28.62575 24.185562 28.84375 24.351562C29.06475 24.518563 29.108406 24.831734 28.941406 25.052734L24.146484 31.376953L24.146484 34.515625L17.042969 39.699219C15.961969 40.523219 15.569813 42.079313 16.132812 43.320312C16.244416 43.566503 16.394083 43.794451 16.570312 44L12 44C11.447 44 11 44.448 11 45C11 45.552 11.447 46 12 46L43 46C43.553 46 44 45.552 44 45C44 44.448 43.553 44 43 44L37.476562 44C37.912841 43.478911 38.1875 42.816996 38.1875 42.085938C38.1875 40.431938 36.8425 39.082031 35.1875 39.082031L33.298828 39.082031C33.307828 39.075031 33.313266 39.0685 33.322266 39.0625L29.070312 39.0625C28.794313 39.0625 28.570312 38.8385 28.570312 38.5625C28.570312 38.2865 28.794313 38.0625 29.070312 38.0625L34.267578 38.0625C34.818578 37.2855 35.146484 36.339406 35.146484 35.316406L35.146484 21.457031C35.146484 18.494031 32.736437 16.083984 29.773438 16.083984L29.519531 16.083984 z"
                          fill="#007C40"/>
                </svg>
            </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pb-8 group-last:pb-0">
            <h3 class="mb-1 text-xs text-primary-700 font-bold font-secondary">
                Asr
            </h3>

            <ul class="list-disc ms-6 mt-3 space-y-1.5">
                <li class="ps-1 text-sm text-gray-600">
                    Adhan
                    <span
                            class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:30 AM
                    </span>
                </span>
                </li>
                <li class="ps-1 text-sm text-gray-600">
                    Iqamah<span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:45 AM
                    </span>
                </span>
                </li>
            </ul>

        </div>
        <!-- End Right Content -->
    </div>
    <!-- End Item -->


    <!-- Item -->
    <div class="group relative flex gap-x-5">
        <!-- Icon -->
        <div class="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-primary-200">
            <div class="relative z-10 size-6 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="shrink-0 size-6 text-primary-700">
                    <path d="M23.925781 3.9257812C22.918781 3.9257812 21.957625 4.2234375 21.140625 4.7734375L28.09375 11.689453C28.63475 10.877453 28.925781 9.9237812 28.925781 8.9257812C28.925781 7.5897812 28.404937 6.335625 27.460938 5.390625C26.516938 4.445625 25.261781 3.9257812 23.925781 3.9257812 z M 20.369141 5.4140625C18.443141 7.3650625 18.448625 10.518937 20.390625 12.460938C21.334625 13.404938 22.589781 13.925781 23.925781 13.925781C25.259781 13.925781 26.511078 13.405844 27.455078 12.464844L20.369141 5.4140625 z M 29.519531 16.083984C27.738531 16.083984 26.264766 16.945969 24.884766 18.792969L21.003906 23.886719L16.144531 19.849609C14.871531 18.791609 12.977922 18.969188 11.919922 20.242188C10.862922 21.514187 11.037547 23.408797 12.310547 24.466797L19.667969 30.572266C19.689969 30.590266 19.730813 30.616859 19.757812 30.630859C21.024812 31.565859 22.799547 31.354109 23.810547 30.162109L28.144531 24.447266C28.312531 24.227266 28.62575 24.185562 28.84375 24.351562C29.06475 24.518563 29.108406 24.831734 28.941406 25.052734L24.146484 31.376953L24.146484 34.515625L17.042969 39.699219C15.961969 40.523219 15.569813 42.079313 16.132812 43.320312C16.244416 43.566503 16.394083 43.794451 16.570312 44L12 44C11.447 44 11 44.448 11 45C11 45.552 11.447 46 12 46L43 46C43.553 46 44 45.552 44 45C44 44.448 43.553 44 43 44L37.476562 44C37.912841 43.478911 38.1875 42.816996 38.1875 42.085938C38.1875 40.431938 36.8425 39.082031 35.1875 39.082031L33.298828 39.082031C33.307828 39.075031 33.313266 39.0685 33.322266 39.0625L29.070312 39.0625C28.794313 39.0625 28.570312 38.8385 28.570312 38.5625C28.570312 38.2865 28.794313 38.0625 29.070312 38.0625L34.267578 38.0625C34.818578 37.2855 35.146484 36.339406 35.146484 35.316406L35.146484 21.457031C35.146484 18.494031 32.736437 16.083984 29.773438 16.083984L29.519531 16.083984 z"
                          fill="#007C40"/>
                </svg>
            </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pb-8 group-last:pb-0">
            <h3 class="mb-1 text-xs text-primary-700 font-bold font-secondary">
                Maghrib
            </h3>

            <ul class="list-disc ms-6 mt-3 space-y-1.5">
                <li class="ps-1 text-sm text-gray-600">
                    Adhan
                    <span
                            class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:30 AM
                    </span>
                </span>
                </li>
                <li class="ps-1 text-sm text-gray-600">
                    Iqamah<span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:45 AM
                    </span>
                </span>
                </li>
            </ul>

        </div>
        <!-- End Right Content -->
    </div>
    <!-- End Item -->

    <!-- Item -->
    <div class="group relative flex gap-x-5">
        <!-- Icon -->
        <div class="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-primary-200">
            <div class="relative z-10 size-6 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="shrink-0 size-6 text-primary-700">
                    <path d="M23.925781 3.9257812C22.918781 3.9257812 21.957625 4.2234375 21.140625 4.7734375L28.09375 11.689453C28.63475 10.877453 28.925781 9.9237812 28.925781 8.9257812C28.925781 7.5897812 28.404937 6.335625 27.460938 5.390625C26.516938 4.445625 25.261781 3.9257812 23.925781 3.9257812 z M 20.369141 5.4140625C18.443141 7.3650625 18.448625 10.518937 20.390625 12.460938C21.334625 13.404938 22.589781 13.925781 23.925781 13.925781C25.259781 13.925781 26.511078 13.405844 27.455078 12.464844L20.369141 5.4140625 z M 29.519531 16.083984C27.738531 16.083984 26.264766 16.945969 24.884766 18.792969L21.003906 23.886719L16.144531 19.849609C14.871531 18.791609 12.977922 18.969188 11.919922 20.242188C10.862922 21.514187 11.037547 23.408797 12.310547 24.466797L19.667969 30.572266C19.689969 30.590266 19.730813 30.616859 19.757812 30.630859C21.024812 31.565859 22.799547 31.354109 23.810547 30.162109L28.144531 24.447266C28.312531 24.227266 28.62575 24.185562 28.84375 24.351562C29.06475 24.518563 29.108406 24.831734 28.941406 25.052734L24.146484 31.376953L24.146484 34.515625L17.042969 39.699219C15.961969 40.523219 15.569813 42.079313 16.132812 43.320312C16.244416 43.566503 16.394083 43.794451 16.570312 44L12 44C11.447 44 11 44.448 11 45C11 45.552 11.447 46 12 46L43 46C43.553 46 44 45.552 44 45C44 44.448 43.553 44 43 44L37.476562 44C37.912841 43.478911 38.1875 42.816996 38.1875 42.085938C38.1875 40.431938 36.8425 39.082031 35.1875 39.082031L33.298828 39.082031C33.307828 39.075031 33.313266 39.0685 33.322266 39.0625L29.070312 39.0625C28.794313 39.0625 28.570312 38.8385 28.570312 38.5625C28.570312 38.2865 28.794313 38.0625 29.070312 38.0625L34.267578 38.0625C34.818578 37.2855 35.146484 36.339406 35.146484 35.316406L35.146484 21.457031C35.146484 18.494031 32.736437 16.083984 29.773438 16.083984L29.519531 16.083984 z"
                          fill="#007C40"/>
                </svg>
            </div>
        </div>
        <!-- End Icon -->

        <!-- Right Content -->
        <div class="grow pb-8 group-last:pb-0">
            <h3 class="mb-1 text-xs text-primary-700 font-bold font-secondary">
                Isha
            </h3>

            <ul class="list-disc ms-6 mt-3 space-y-1.5">
                <li class="ps-1 text-sm text-gray-600">
                    Adhan
                    <span
                            class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:30 AM
                    </span>
                </span>
                </li>
                <li class="ps-1 text-sm text-gray-600">
                    Iqamah<span
                        class="inline-flex flex-nowrap items-center bg-white border border-gray-200 rounded-full p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        5:45 AM
                    </span>
                </span>
                </li>
            </ul>

        </div>
        <!-- End Right Content -->
    </div>
    <!-- End Item -->
</div>
<!-- End Prayer Times -->

<!-- Blog Section -->
<!-- Card Blog -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Title -->
    <div class="max-w-2xl mx-auto text-left mb-10 lg:mb-14">
        <h2 class="text-2xl font-bold md:text-4xl md:leading-tight">From the Press</h2>
        <p class="mt-1 text-gray-600">Value Packed Insights and Publications from An-Nur Press</p>
    </div>
    <!-- End Title -->

    <!-- Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card -->
        <a class="group flex flex-col h-full border border-gray-200 hover:border-transparent hover:shadow-lg focus:outline-none focus:border-transparent focus:shadow-lg transition duration-300 rounded-xl p-5" href="https://annuurpress.org.ng/ink-and-ashes/">
                <div class="aspect-w-16 aspect-h-11">
                    <img class="w-full object-cover rounded-xl h-[210px]" src="https://annuurpress.org.ng/wp-content/uploads/2024/12/41507-e1733481937229.jpg" alt="Inks and Ashes">
            </div>
            <div class="my-6">
                <h3 class="text-xl font-semibold text-gray-800">
                    Ink and Ashes
                </h3>
                <p class="mt-5 text-gray-600">
                    I still remember how we used to  run around in circles as though we couldn't stop, how we suckle sweets...
                </p>
            </div>
            <div class="mt-auto flex items-center gap-x-3">
                <img class="size-8 rounded-full" src="/images/woman_1.png" alt="Aishat Elusogbon">
                <div>
                    <h5 class="text-sm text-gray-800">By Aishat Elusogbon</h5>
                </div>
            </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group flex flex-col h-full border border-gray-200 hover:border-transparent hover:shadow-lg focus:outline-none focus:border-transparent focus:shadow-lg transition duration-300 rounded-xl p-5" href="https://annuurpress.org.ng/hardship-is-temporary/">
            <div class="aspect-w-16 aspect-h-11">
                <img class="w-full object-cover rounded-xl h-[210px]" src="https://annuurpress.org.ng/wp-content/uploads/2024/12/alone-4672965_1920-e1733482581401-1536x866.jpg" alt="Hardship is Temporary">
            </div>
            <div class="my-6">
                <h3 class="text-xl font-semibold text-gray-800">
                    Hardship is Temporary
                </h3>
                <p class="mt-5 text-gray-600">
                    Hardship is defined as: Phonologically – /hɑ:dʃɪp/ Dictionary-wise – Difficulty To be in hardship means to be burdened or troubled.Oftentimes, when people...
                </p>
            </div>
            <div class="mt-auto flex items-center gap-x-3">
                <img class="size-8 rounded-full" src="/images/woman_2.png" alt="Rōdhiyah Adesina">
                <div>
                    <h5 class="text-sm text-gray-800">By Rōdhiyah Adesina</h5>
                </div>
            </div>
        </a>
        <!-- End Card -->

        <!-- Card -->
        <a class="group flex flex-col h-full border border-gray-200 hover:border-transparent hover:shadow-lg focus:outline-none focus:border-transparent focus:shadow-lg transition duration-300 rounded-xl p-5" href="https://annuurpress.org.ng/cheers-to-better-days/">
            <div class="aspect-w-16 aspect-h-11">
                <img class="w-full object-cover rounded-xl h-[210px]" src="https://annuurpress.org.ng/wp-content/uploads/2024/11/tree-164915_1280.jpg" alt="Cheers to Better Days">
            </div>
            <div class="my-6">
                <h3 class="text-xl font-semibold text-gray-800">
                    Cheers to Better Days
                </h3>
                <p class="mt-5 text-gray-600">
                    Enjoying my busy sleep as I lay,Lay on my weary thatched bed—Oh, I mean a thatched mattress,Or maybe some cartons...
                </p>
            </div>
            <div class="mt-auto flex items-center gap-x-3">
                <img class="size-8 rounded-full" src="/images/woman_3.png" alt="Ruqoyyah Idris">
                <div>
                    <h5 class="text-sm text-gray-800">By Ruqoyyah Idris</h5>
                </div>
            </div>
        </a>
        <!-- End Card -->
    </div>
    <!-- End Grid -->

    <!-- Card -->
    <div class="mt-12 text-center">
        <a class="py-3 px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" href="https://annuurpress.org.ng/">
            Read more
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </a>
    </div>
    <!-- End Card -->
</div>
<!-- End Card Blog -->
<!-- End Blog Section -->

<style>
    .yoruba {
        font-family: "Charis SIL", sans-serif;
        top: 8px;
        left: 0;
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
</style>
