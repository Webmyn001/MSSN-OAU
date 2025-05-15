<script>
    import {Button} from "$lib/components/ui/button/index.js";
    import {format, register} from 'timeago.js'
    import {toast} from "svelte-sonner";
    import {formatDate, isPastDate, months} from "$lib/utils/dates.js";
    import {MetaTags, JsonLd} from "svelte-meta-tags";
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import {onMount} from "svelte";
    import slugify from "$lib/utils/slugify.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";

    export let data;

    /**
     * Processes and categorizes events into upcoming, past, and excluded events
     * @typedef {Object} ProcessedEvents
     * @property {Event[]} upcoming - Future events, sorted nearest to farthest
     * @property {Event[]} past - Recent past events (within 12 months), sorted newest to oldest
     * @property {Event[]} excluded - Events older than 12 months
     *
     * @param {Event[]} events
     * @returns {ProcessedEvents}
     */
    function processEvents(events) {
        // Input validation
        if (!Array.isArray(events)) {
            throw new TypeError('Events must be an array');
        }

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);

        // Cache Date objects to avoid repeated creation
        const dateCache = new Map();
        const getEventDate = (event) => {
            if (!dateCache.has(event)) {
                dateCache.set(event, new Date(event.date));
            }
            return dateCache.get(event);
        };

        /**
         * Adjusts periodical events to their next occurrence
         * @param {Event} event
         * @returns {Event}
         */
        function adjustPeriodicalEvent(event) {
            if (!event.periodical) return event;

            const eventDate = new Date(event.date);
            const {periodical, day} = event;

            // Validate periodical parameters
            if (!['weekly', 'monthly'].includes(periodical)) {
                throw new Error(`Invalid periodical type: ${periodical}`);
            }
            if (typeof day !== 'number' || day < 0 ||
                (periodical === 'weekly' && day > 6) ||
                (periodical === 'monthly' && day > 31)) {
                throw new Error(`Invalid day value: ${day} for ${periodical} event`);
            }

            // Adjust date based on periodical type
            if (periodical === 'weekly') {
                const currentDay = eventDate.getDay();
                const daysToAdd = (day - currentDay + 7) % 7;
                eventDate.setDate(eventDate.getDate() + daysToAdd);

                // If date is in the past, add weeks until it's in the future
                while (eventDate < now) {
                    eventDate.setDate(eventDate.getDate() + 7);
                }
            } else if (periodical === 'monthly') {
                eventDate.setDate(day);
                while (eventDate < now) {
                    eventDate.setMonth(eventDate.getMonth() + 1);
                }
            }

            return {...event, date: eventDate.toISOString()};
        }

        try {
            // Process all events at once
            const processedEvents = events.reduce((acc, event) => {
                const adjustedEvent = adjustPeriodicalEvent(event);
                const eventDate = getEventDate(adjustedEvent);

                if (eventDate >= now) {
                    acc.upcoming.push(adjustedEvent);
                } else if (eventDate >= twelveMonthsAgo) {
                    acc.past.push(adjustedEvent);
                } else {
                    acc.excluded.push(adjustedEvent);
                }
                return acc;
            }, {upcoming: [], past: [], excluded: []});

            // Sort the arrays
            processedEvents.upcoming.sort((a, b) => getEventDate(a) - getEventDate(b));
            processedEvents.past.sort((a, b) => getEventDate(b) - getEventDate(a));

            return processedEvents;
        } catch (error) {
            console.error('Error processing events:', error);
            throw error;
        }
    }


    /**
     * @type {ProcessedEvents}
     */
    let allEvents = {
        upcoming: [],
        past: [],
        excluded: [],
    }


    /**
     *
     * @param {number} number
     * @param {number} index
     * @returns {[string, string]}
     */
    const localeFunc = (number, index) => {
        // number: the timeago / timein number;
        // index: the index of array below;
        // totalSec: total seconds between date to be formatted and today's date;
        return [
            ['just now', 'happening right now'],
            ['%s seconds ago', 'in %s seconds'],
            ['1 minute ago', 'in 1 minute'],
            ['%s minutes ago', 'in %s minutes'],
            ['1 hour ago', 'in 1 hour'],
            ['%s hours ago', 'in %s hours'],
            ['yesterday', 'tomorrow'],
            ['%s days ago', 'in %s days'],
            ['1 week ago', 'in 1 week'],
            ['%s weeks ago', 'in %s weeks'],
            ['1 month ago', 'in 1 month'],
            ['%s months ago', 'in %s months'],
            ['1 year ago', 'in 1 year'],
            ['%s years ago', 'in %s years']
        ][index];
    };

    register('my-locale', localeFunc);


    $: open = false;

    /**
     * @type {'upcoming' | 'past'}
     */
    $: mode = "upcoming"

    /**
     * @type {Event[]}
     */
    $: events = allEvents[mode]

    /**
     * @type {Event}
     */
    $: currentEvent = events[0];

    let jsonLd;

    onMount(() => {
        allEvents = processEvents(data.events)
        jsonLd = [
            {
                "@context": "http://schema.org",
                "@type": "WebPage",
                "name": "Events",
                "description": "Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.",
                "publisher": {
                    "@type": "NonProfitOrganization",
                    "name": "MSSNOAU.org"
                }
            },
            ...allEvents.upcoming.map(event => {
                return {
                    "@type": "Event",
                    "name": event.title,
                    "url": "https://events.mssnoau.org/" + formatDate(event.date).date + '/' + slugify(event.title),
                    "description": event.summary,
                    "startDate": formatDate(event.date),
                    "endDate": formatDate(event.date),
                    "location": {
                        "@type": "Place",
                        "name": "Obafemi Awolowo University",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Obafemi Awolowo University",
                            "addressLocality": "Ile-Ife",
                            "addressRegion": "Osun",
                            "postalCode": "200211",
                            "addressCountry": "NG"
                        }
                    }
                }
            })
        ]
    })
</script>

<PageHeader>
    Our Events
    <br/>
    <Tabs.Root bind:value={mode}>
        <Tabs.List class="my-2">
            <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
            <Tabs.Trigger value="past">Last 12 Months</Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>
</PageHeader>

<!-- TODO: Add Event Meta Tags -->

<!-- Meta Tags -->
<MetaTags
        title="Our Events"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Our Events | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'MSSNOAU Website Screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<JsonLd schema={jsonLd} />
<!-- End Meta Tags -->

<div class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">

        <div class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">

            {#each events as event}
                <!-- Article Start -->
                <button id={slugify(event.title + " " + event.date)} onclick={() => {
                currentEvent = event
                        open = !open
                    }}
                        class="group relative flex mx-auto h-36 sm:h-48 aspect-video sm:aspect-square flex-col overflow-hidden rounded-xl bg-gray-100 shadow-lg md:h-64 lg:h-72">
                    <div
                            class="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition-all duration-500 hover:shadow-sm">
                        <!-- Date container - positioned absolutely and slides in from left -->
                        <div class="absolute -left-full top-0 h-full transition-all duration-500 group-hover:left-0">
                            <div class="flex h-full rotate-180 items-center justify-center p-2 [writing-mode:vertical-lr]">
                                <!-- large screens only-->
                                <time
                                        datetime="2022-10-10"
                                        class="md:hidden h-full flex font-mono items-center justify-between gap-4 text-xs font-bold uppercase text-white"
                                >
                                    <span>{new Date(event.date).getFullYear()}</span>
                                    <span class="w-px flex-1 bg-white/10"></span>
                                    <span>{months[new Date(event.date).getMonth()]} {new Date(event.date).getDate()}</span>
                                </time>
                                <!-- end large screens only-->
                                <!-- mobile only-->
                                <span
                                        class="hidden h-full font-mono items-center justify-between md:flex gap-4 text-xs font-bold uppercase text-white"
                                >
                                <span>{event.paid ? event.price : "₦0.00"}</span>
                                <span class="w-px flex-1 bg-white/10"></span>
                                <span>{event.paid ? "PAID" : "FREE"}</span>
                            </span>
                                <!-- end mobile only-->
                            </div>
                        </div>

                        <!-- Main content - slides right on hover -->
                        <div
                                class="h-full relative rounded-[10px] flex flex-col justify-between items-start bg-white p-4 pt-3 transition-all duration-500 group-hover:translate-x-8 sm:p-6 bg-no-repeat bg-cover bg-center"
                                style={`background-image: url('${event.image}')`}
                        >
                            <div class="absolute {isPastDate(event.date) ? '' : 'hidden'} inset-0 z-[11] rounded-[10px] backdrop-blur-sm opacity-60 bg-no-repeat bg-cover bg-center bg-[url('/images/ended.webp')]"></div>
                            <div class="absolute inset-0 {isPastDate(event.date) ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-sm rounded-[10px]"></div>
                            <time datetime="2022-10-10"
                                  class="block [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] font-mono z-10 text-xs text-neutral-200">
                                {formatDate(event.date).date}
                            </time>

                            <span
                                    class="mb-4 sm:line-clamp-3 line-clamp-2 overflow-hidden break-words text-ellipsis [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] sm:mb-0 mt-0.5 block text-center w-full text-md z-10 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium font-secondary text-white">
                            {event.title}
                        </span>

                            <!-- large screens only-->
                            <div class="mt-4 sm:hidden flex flex-wrap gap-1 z-10">
                        <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                            {event.paid ? "Paid" : "Free"}
                        </span>
                                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                                {event.paid ? event.price : "₦0.00"}
                            </span>
                                {#if event?.periodical}
                                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                                {event.periodical}
                            </span>
                                {/if}
                            </div>
                            <!-- end large screens only-->
                            <!-- mobile only-->
                            <div class="mt-4 sm:flex-wrap z-10 gap-1 hidden sm:flex">
                                {#if !isPastDate(event.date)}
                                    <Button class="bg-white text-primary-800 hover:bg-white active:bg-white">See More
                                    </Button>
                                {/if}
                                {#if event.paid && !isPastDate(event.date)}
                                    <Button onclick={() => {
                                        if (isPastDate(event.date)) {
                                            toast.error("This event has passed!")
                                            return;
                                        }
                                        currentEvent = event
                                        open = !open
                                    }}
                                            class="bg-primary-800 hover:bg-primary-800/90 text-white active:bg-primary-800/90">
                                        Register
                                    </Button>
                                {/if}
                            </div>
                            <!-- end mobile only-->
                        </div>
                    </div>
                </button>
                <!-- Article End -->
            {/each}

        </div>
    </div>
</div>


<AlertDialog.Root bind:open>
    <AlertDialog.Content class="scrollbar-hide lg:max-w-[60dvw] overflow-y-scroll max-h-screen">
        <AlertDialog.Header>
            <AlertDialog.Title class="text-2xl font-secondary">{currentEvent.title}</AlertDialog.Title>
            <AlertDialog.Description>
                {currentEvent.summary}
            </AlertDialog.Description>
        </AlertDialog.Header>
        
        <!-- Event Image -->
        {#if currentEvent.image}
            <div class="relative w-full h-48 sm:h-64 overflow-hidden rounded-xl mb-4">
                <img 
                    src={currentEvent.image} 
                    alt={currentEvent.title} 
                    class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-3 left-3 flex gap-2">
                    <span class="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-primary-700">
                        {formatDate(currentEvent.date).date}
                    </span>
                    <span class="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-primary-700">
                        {currentEvent.paid ? currentEvent.price : "FREE"}
                    </span>
                </div>
            </div>
        {/if}
        
        <div class="flow-root rounded-xl border border-gray-100 py-3 shadow-sm bg-white">
            <dl class="-my-3 divide-y divide-gray-100 text-sm">
                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Event Name</dt>
                    <dd class="text-gray-700 sm:col-span-2">{currentEvent.title}</dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Venue</dt>
                    <dd class="text-gray-700 sm:col-span-2">{currentEvent.venue}</dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Date</dt>
                    <dd class="text-gray-700 sm:col-span-2">
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center justify-center bg-primary-100 text-primary-800 size-8 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </span>
                            <div>
                                <span>{formatDate(currentEvent.date).time} on {formatDate(currentEvent.date).date}</span>
                                <span class="text-xs text-gray-500 ml-2">({format(currentEvent.date, 'my-locale')})</span>
                            </div>
                        </div>
                    </dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Price</dt>
                    <dd class="text-gray-700 sm:col-span-2">
                        <span class={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${currentEvent.paid ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {currentEvent.paid ? currentEvent.price : "FREE"}
                        </span>
                    </dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Details</dt>
                    <dd class="text-gray-700 sm:col-span-2 prose prose-sm max-w-none">
                        {#if currentEvent.description}
                            {@html currentEvent.description}
                        {:else}
                            {currentEvent.summary}
                        {/if}
                    </dd>
                </div>
                
                {#if currentEvent.periodical}
                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Schedule Type</dt>
                    <dd class="text-gray-700 sm:col-span-2">
                        <span class="inline-flex px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            {currentEvent.periodical === 'weekly' ? 'Weekly Event' : 'Monthly Event'}
                        </span>
                    </dd>
                </div>
                {/if}

            </dl>
        </div>
        
        <AlertDialog.Footer class="gap-2">
            <AlertDialog.Cancel class="rounded-lg">Cancel</AlertDialog.Cancel>
            {#if currentEvent.paid && !isPastDate(currentEvent.date)}
                <AlertDialog.Action 
                    class="bg-primary-700 hover:bg-primary-800 text-white rounded-lg" 
                    onclick={() => (window.open(currentEvent.url || '#', '_blank'))}
                >
                    Register Now
                </AlertDialog.Action>
            {/if}
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<!-- Empty state (when no events) -->
{#if events.length === 0}
<div class="bg-white py-12">
    <div class="mx-auto max-w-lg text-center px-4">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-sm">
            <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-800 mb-3">No {mode === "upcoming" ? "Upcoming" : "Past"} Events Available</h3>
            <p class="text-gray-600 mb-6">
                {#if mode === "upcoming"}
                    We don't have any upcoming events at the moment. Please check back soon for our future activities and gatherings.
                {:else}
                    We don't have any past events for the last 12 months on record. Try checking the upcoming events tab for future activities.
                {/if}
            </p>
            <div class="flex justify-center gap-3">
                {#if mode === "past"}
                    <button 
                        class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        onclick={() => mode = "upcoming"}
                    >
                        View Upcoming Events
                    </button>
                {:else}
                    <button 
                        class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        onclick={() => window.location.reload()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 22v-6h6"></path>
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                        </svg>
                        Refresh Page
                    </button>
                {/if}
                <a 
                    href="/contact"
                    class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                >
                    Contact Us
                </a>
            </div>
            <div class="border-t border-gray-100 pt-4 mt-6">
                <p class="text-sm text-gray-500">Follow our social media channels for the latest updates.</p>
            </div>
        </div>
    </div>
</div>
{/if}

