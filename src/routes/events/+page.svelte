<script>
    import {Button} from "$lib/components/ui/button/index.js";
    import {format, register} from 'timeago.js'
    import {toast} from "svelte-sonner";
    import {formatDate, isPastDate, months} from "$lib/utils/dates.js";
    import {MetaTags, JsonLd} from "svelte-meta-tags";
    import PageHeader from "$lib/components/PageHeader.svelte";
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
                    "@context": "https://www.schema.org",
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
        alt: 'Website screenshot'
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
    <AlertDialog.Content class="lg:max-w-[60dvw] overflow-y-scroll max-h-screen">
        <AlertDialog.Header>
            <AlertDialog.Title>{currentEvent.title}</AlertDialog.Title>
            <AlertDialog.Description>
                {currentEvent.summary}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <div class="flow-root rounded-xl border border-gray-100 py-3 shadow-sm">
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
                    <dd class="text-gray-700 sm:col-span-2">{formatDate(currentEvent.date).time}
                        on {formatDate(currentEvent.date).date} ({format(currentEvent.date)}
                        )
                    </dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Price</dt>
                    <dd class="text-gray-700 sm:col-span-2">{currentEvent.paid ? currentEvent.price : "FREE"}</dd>
                </div>

                <div class="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                    <dt class="font-medium text-gray-900">Details</dt>
                    <dd class="text-gray-700 sm:col-span-2">{currentEvent.summary}</dd>
                </div>

            </dl>
        </div>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            {#if currentEvent.paid && !isPastDate(currentEvent.date)}
                <AlertDialog.Action onclick={() => (window.open(event.url, '_blank'))}>Register</AlertDialog.Action>
            {/if}
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>