<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<script>
    import {Button, buttonVariants} from "$lib/components/ui/button/index.js";
    import {format, register} from 'timeago.js'
    import {toast} from "svelte-sonner";
    import {formatDate, isPastDate, months} from "$lib/utils/dates.js";
    import Seo from "$lib/components/SEO.svelte";
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import {onMount} from "svelte";
    import slugify from "$lib/utils/slugify.js";
    import ResponsiveModal from "$lib/components/layout/ResponsiveModal.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { browser } from '$app/environment';
    import { CalendarDays, MapPin, Ticket, ExternalLink, X, Info, UserCircle } from '@lucide/svelte';


    /** @type {{data: any}} */
    let { data } = $props(); 

    /**
     * @typedef {Object} Event
     * @property {string} title
     * @property {string} [image]
     * @property {string} summary
     * @property {boolean} paid
     * @property {string} [price]
     * @property {string} date
     * @property {string} venue
     * @property {string} [url]
     * @property {'weekly' | 'monthly'} [periodical]
     * @property {number} [day] Day of week (0-6) or day of month (1-31)
     * @property {string} [host]
     * @property {string} [contact]
     * @property {string} [category]
     * @property {string[]} [tags]
     * @property {number} [capacity]
     * @property {string} [registration_deadline]
     * @property {string} [additional_details]
     */

    /**
     * @typedef {Object} ProcessedEvents
     * @property {Event[]} upcoming
     * @property {Event[]} past
     * @property {Event[]} excluded
     */

    /**
     * Processes and categorizes events into upcoming, past, and excluded events
     * @param {Event[]} events
     * @returns {ProcessedEvents}
     */
    function processEvents(events) {
        // Input validation
        if (!Array.isArray(events)) {
            // Instead of throwing, handle gracefully or log error
            console.error('Events must be an array, received:', events);
            return { upcoming: [], past: [], excluded: [] };
        }

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);

        // Cache Date objects to avoid repeated creation
        const dateCache = new Map();
        
        /**
         * Gets cached date for an event
         * @param {Event} event
         * @returns {Date}
         */
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

            const eventDate = new Date(event.date); // Create a new Date object to avoid modifying the original
            const {periodical, day} = event;

            // Validate periodical parameters
            if (!['weekly', 'monthly'].includes(periodical)) {
                 console.error(`Invalid periodical type: ${periodical}`);
                 return event; // Return original event if type is invalid
            }
            if (typeof day !== 'number' || day < 0 ||
                (periodical === 'weekly' && day > 6) ||
                (periodical === 'monthly' && day > 31)) {
                console.error(`Invalid day value: ${day} for ${periodical} event`);
                return event; // Return original event if day is invalid
            }
            
            const newEvent = { ...event, date: new Date(event.date).toISOString() };
            const newEventDate = new Date(newEvent.date);


            // Adjust date based on periodical type
            if (periodical === 'weekly') {
                const currentDay = newEventDate.getDay();
                const daysToAdd = (day - currentDay + 7) % 7;
                newEventDate.setDate(newEventDate.getDate() + daysToAdd);

                // If date is in the past, add weeks until it's in the future
                while (newEventDate < now) {
                    newEventDate.setDate(newEventDate.getDate() + 7);
                }
            } else if (periodical === 'monthly') {
                newEventDate.setDate(day); // Set to the specified day of the month
                 // If this makes the date go to the past month (e.g. Feb 30 -> Mar 2 for current month Jan)
                // or if the date is simply in the past, advance month by month
                while (newEventDate < now || (newEventDate.getMonth() === now.getMonth() && newEventDate.getFullYear() === now.getFullYear() && newEventDate.getDate() < day && newEventDate < now )) {
                    newEventDate.setMonth(newEventDate.getMonth() + 1);
                     // Ensure the day is still correct after month change (e.g. Jan 31 + 1 month = Feb 28/29)
                    newEventDate.setDate(day);
                    // If setting the day made it roll over to the next month (e.g. Feb 30 -> Mar 2), fix it.
                    if (newEventDate.getDate() !== day) {
                        newEventDate.setDate(0); // Go to last day of previous month
                        newEventDate.setDate(day); // Then set the correct day
                         if (newEventDate < now) { // If still in past, advance one more month
                             newEventDate.setMonth(newEventDate.getMonth() + 1);
                             newEventDate.setDate(day);
                         }

                    }
                }
            }
            newEvent.date = newEventDate.toISOString();
            return newEvent;
        }

        try {
            // Process all events at once
            const categorizedEvents = events.reduce((acc, event) => {
                if (!event || typeof event.date !== 'string') { // Basic validation for event object
                    console.warn('Skipping invalid event object:', event);
                    return acc;
                }
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
            categorizedEvents.upcoming.sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
            categorizedEvents.past.sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime());

            return categorizedEvents;
        } catch (error) {
            console.error('Error processing events:', error);
            // Instead of re-throwing, return empty/default state or handle as appropriate
            return { upcoming: [], past: [], excluded: [] };
        }
    }


    /** @type {ProcessedEvents} */
    let allEvents = $state({
        upcoming: [],
        past: [],
        excluded: [],
    });


    /**
     * Custom locale function for timeago
     * @param {number} number The timeago/timein number
     * @param {number} index The index in the locale array
     * @returns {[string, string]} Tuple of [past, future] strings
     */
    const localeFunc = (number, index) => {
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

    /** @type {boolean} */
    let open = $state(false); // This will control the ResponsiveModal

    /** @type {'upcoming' | 'past'} */
    let mode = $state("upcoming")

    /** @type {Event[]} */
    let events = $derived(allEvents[mode])

    /** @type {Event | null} */
    let currentEvent = $state(null);

    /** @type {any[]} */
    let jsonLd = $state([]);

    /**
     * Opens the event details modal
     * @param {Event} event
     */
    function openEventDetails(event) {
        currentEvent = event;
        open = true;
    }

    /**
     * Closes the event details modal
     */
    function closeEventDetails() {
        open = false;
        // Optional: Delay clearing currentEvent to allow for outro transitions
        setTimeout(() => {
            if (!open) currentEvent = null;
        }, 300);
    }

    onMount(() => {
        if (data?.events) {
           allEvents = processEvents(data.events);
        } else {
            allEvents = { upcoming: [], past: [], excluded: [] };
            toast.error("No event data loaded.");
        }
        
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
                const eventDateFormatted = formatDate(event.date);
                return {
                    "@type": "Event",
                    "name": event.title,
                    "url": `https://events.mssnoau.org/${eventDateFormatted?.date || slugify(event.title)}/${slugify(event.title)}`,
                    "description": event.summary,
                    "startDate": event.date, // Use ISO string directly
                    "endDate": event.date,   // Use ISO string directly
                    "location": {
                        "@type": "Place",
                        "name": event.venue || "Obafemi Awolowo University",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Obafemi Awolowo University",
                            "addressLocality": "Ile-Ife",
                            "addressRegion": "Osun",
                            "postalCode": "200211",
                            "addressCountry": "NG"
                        }
                    },
                    ...(event.image && { "image": event.image }),
                     organizer: {
                        "@type": "Organization",
                        name: event.host || "MSSN OAU"
                    },
                    eventStatus: isPastDate(event.date) ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled", // Simplified status
                    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", // Assuming most are offline
                     ...(event.paid && event.price && {
                        offers: {
                            "@type": "Offer",
                            price: event.price,
                            priceCurrency: "NGN", // Assuming Naira, adjust if needed
                            url: event.url || `https://events.mssnoau.org/${eventDateFormatted?.date || slugify(event.title)}/${slugify(event.title)}`,
                            availability: "https://schema.org/InStock",
                            validFrom: new Date().toISOString() // Or a more specific registration start date
                        }
                    })
                };
            })
        ];
    });
</script>

<PageHeader>
    Our Events
    <br/>
    <Tabs.Root bind:value={mode} class="mt-4">
        <Tabs.List class="grid w-full grid-cols-2 max-w-xs mx-auto">
            <Tabs.Trigger value="upcoming" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Upcoming</Tabs.Trigger>
            <Tabs.Trigger value="past" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Last 12 Months</Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>
</PageHeader>

<Seo
        title="Our Events"
        titleTemplate="%s | MSSNOAU"
        description="Stay updated with events, programmes, and activities by the Muslim Students Society of Nigeria, OAU Branch. Join us for enriching experiences."
        canonical="https://mssnoau.org/events"
        openGraph={{
            url: 'https://mssnoau.org/events',
    title: 'Our Events | MSSNOAU',
            description: 'Stay updated with events, programmes, and activities by the Muslim Students Society of Nigeria, OAU Branch.',
    images: [
      {
                url: data.events?.[0]?.image || 'https://mssnoau.sirv.com/og/og-events.jpg', // Fallback OG image
        width: 1200,
                height: 630,
                alt: 'MSSNOAU Events'
      }
    ],
    siteName: 'MSSNOAU'
  }}
        schema={jsonLd}
/>

<div class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
        <!-- text - start -->
        <div class="mb-10 md:mb-16">
            <h2 class="mb-4 text-center text-2xl font-bold text-neutral-800 md:mb-6 lg:text-3xl font-primary">
                {mode === "upcoming" ? "Upcoming Events" : "Past Events"}
            </h2>

            <p class="mx-auto max-w-screen-md text-center text-neutral-600 md:text-lg font-secondary">
                {mode === "upcoming" ? "Join us for our upcoming programmes and activities. We look forward to seeing you!" : "A look back at some of our memorable events from the past year."}
            </p>
        </div>
        <!-- text - end -->

        {#if events.length > 0}
        <div class="grid gap-x-4 gap-y-8 sm:grid-cols-2 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            <!-- event - start -->
            {#each events as event, i (event.title + event.date)}
                {@const eventDateDetails = formatDate(event.date)} 
                <div class="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <button
                            type="button"
                            onclick={() => openEventDetails(event)}
                            class="group relative block h-48 overflow-hidden bg-neutral-100 md:h-64 focus:outline-none"
                    >
                        <img
                                src={event.image || "/images/placeholder-event.webp"}
                                loading="lazy"
                                alt={`Flyer for ${event.title}`}
                                class="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                        />
                        {#if mode === "upcoming" && !isPastDate(event.date)}
                        <div class="absolute bottom-2 right-2">
                             <span class="rounded-full bg-primary-700/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold tracking-wider text-white">
                                {format(event.date, 'my-locale')}
                            </span>
                        </div>
                        {/if}
                    </button>

                    <div class="flex flex-1 flex-col p-4 sm:p-6">
                        <h3 class="mb-2 text-lg font-semibold text-neutral-800 font-secondary">
                            <button
                                    type="button"
                                    onclick={() => openEventDetails(event)}
                                    class="transition duration-100 hover:text-primary-700 active:text-primary-800 text-left"
                            >
                            {event.title}
                            </button>
                        </h3>

                        <p class="mb-4 text-neutral-600 font-tertiary text-sm leading-relaxed">
                            {event.summary || "More details coming soon."}
                        </p>

                        <div class="mt-auto flex items-end justify-between">
                            <div class="flex items-center gap-2">
                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                   <CalendarDays class="h-5 w-5" />
                                </div>
                                <div>
                                    <div class="text-xs font-semibold text-primary-700">{eventDateDetails?.weekday || ''}, {eventDateDetails?.month || ''} {eventDateDetails?.daySuffix || ''}</div>
                                    <p class="text-xs text-neutral-600">{eventDateDetails?.year || ''} at {eventDateDetails?.time || ''}</p>
                                </div>
                            </div>

                            {#if event.paid}
                                <span class="rounded border px-2 py-1 text-sm text-neutral-600">{event.price || 'Paid Event'}</span>
                            {:else}
                                <span class="rounded border border-green-500 bg-green-50 px-2 py-1 text-sm text-green-700">Free</span>
                                {/if}
                        </div>
                    </div>
                </div>
            {/each}
            <!-- event - end -->
        </div>
        {:else}
            <div class="text-center py-12 px-4">
                 <div class="bg-gray-50 rounded-xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
                    <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                        <Info class="size-10 text-primary-400" />
                    </div>
                    <h3 class="text-xl font-medium text-primary-800 mb-3">No {mode} Events</h3>
                    <p class="text-gray-600 mb-6">
                        There are currently no {mode} events scheduled or listed. Please check back later or contact us for more information.
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>


{#if currentEvent}
{@const eventDateDetailsModal = formatDate(currentEvent.date)}
    <ResponsiveModal
        bind:open={open}
        title={currentEvent.title}
        description={currentEvent.host ? `Hosted by: ${currentEvent.host}` : undefined}
        onOpenChange={(val) => { if (!val) closeEventDetails(); }}
        contentClass="max-h-[90dvh]"
        side="bottom"
    >
        {#if currentEvent.image}
            <img src={currentEvent.image} alt={`Flyer for ${currentEvent.title}`} class="w-full rounded-lg object-cover aspect-[16/9] mb-4 border"/>
        {/if}
        
        <p class="text-sm text-gray-700 leading-relaxed">
            {@html currentEvent.summary || "Detailed information will be available soon."}
        </p>

        {#if currentEvent.additional_details}
             <div class="prose prose-sm max-w-none text-gray-600">
                {@html currentEvent.additional_details}
                </div>
                {/if}

        <div class="space-y-3 text-sm mt-5">
            <div class="flex items-start">
                <CalendarDays class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                <span class="text-gray-700">
                    {eventDateDetailsModal?.fullDate || ''} at {eventDateDetailsModal?.time || ''}
                    {#if mode === "upcoming" && !isPastDate(currentEvent.date)}
                    <span class="ml-2 text-xs font-medium text-green-700">({format(currentEvent.date, 'my-locale')})</span>
                    {/if}
                </span>
        </div>
            <div class="flex items-start">
                <MapPin class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                <span class="text-gray-700">{currentEvent.venue}</span>
            </div>
            <div class="flex items-start">
                <Ticket class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                <span class="text-gray-700">
                    {currentEvent.paid ? (currentEvent.price || "Paid Event - Check link for price") : "Free Admission"}
                </span>
            </div>
            {#if currentEvent.contact}
            <div class="flex items-start">
                <UserCircle class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                <span class="text-gray-700">Contact: {currentEvent.contact}</span>
            </div>
            {/if}
        </div>

            {#snippet footer()}
            {#if currentEvent.url}
            <Button as="a" href={currentEvent.url} target="_blank" class={buttonVariants({ class: "w-full" })}>
                Register / View Details <ExternalLink class="ml-2 h-4 w-4" />
            </Button>
            {:else}
            <Button onclick={closeEventDetails} variant="outline" class="w-full">Close</Button> 
            {/if}
            {/snippet}
    </ResponsiveModal>
{/if}

<style>
    .prose :global(p) {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .prose :global(ul), .prose :global(ol) {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>

