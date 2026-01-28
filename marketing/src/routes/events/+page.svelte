<script>
    import {Button, buttonVariants} from "$lib/components/ui/button/index.js";
    import {format, register} from 'timeago.js';
    import {toast} from "svelte-sonner";
    import {formatDate, isPastDate, months} from "$lib/utils/dates.js";
    import Seo from "$lib/components/SEO.svelte";
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import {onMount, tick} from "svelte";
    import slugify from "$lib/utils/slugify.js";
    import ResponsiveModal from "$lib/components/layout/ResponsiveModal.svelte";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { 
        CalendarDays, MapPin, Ticket, ExternalLink, X, Info, UserCircle, 
        Calendar, Clock, Tag, Users, ChevronRight, Filter, Search
    } from '@lucide/svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { SITE_URL } from '$lib/config';

    /** @type {{data: { events: Event[] | undefined }}} */
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
     * @property {string} [slug]
     */

    /**
     * @typedef {Object} ProcessedEvents
     * @property {Event[]} upcoming
     * @property {Event[]} past
     * @property {Event[]} excluded
     */

    /**
     * Processes and categorizes events into upcoming, past, and excluded events
     * @param {Event[] | undefined} eventsArray
     * @returns {ProcessedEvents}
     */
    function processEvents(eventsArray) {
        if (!Array.isArray(eventsArray)) {
            console.error('Events must be an array, received:', eventsArray);
            return { upcoming: [], past: [], excluded: [] };
        }

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);

        const dateCache = new Map();
        
        /**
         * @param {Event} event
         * @returns {Date}
         */
        const getEventDate = (event) => {
            if (!dateCache.has(event.date)) {
                dateCache.set(event.date, new Date(event.date));
            }
            return dateCache.get(event.date);
        };

        /** @param {Event} event */
        function adjustPeriodicalEvent(event) {
            if (!event.periodical) return event;

            const {periodical, day} = event;

            if (!['weekly', 'monthly'].includes(periodical)) {
                 console.error(`Invalid periodical type: ${periodical}`);
                 return event;
            }
            if (typeof day !== 'number' || day < 0 ||
                (periodical === 'weekly' && day > 6) ||
                (periodical === 'monthly' && day > 31)) {
                console.error(`Invalid day value: ${day} for ${periodical} event`);
                return event;
            }
            
            const newEvent = { ...event, date: new Date(event.date).toISOString() };
            const newEventDate = new Date(newEvent.date);


            if (periodical === 'weekly') {
                const currentDay = newEventDate.getDay();
                const daysToAdd = (day - currentDay + 7) % 7;
                newEventDate.setDate(newEventDate.getDate() + daysToAdd);
                while (newEventDate < now) {
                    newEventDate.setDate(newEventDate.getDate() + 7);
                }
            } else if (periodical === 'monthly') {
                newEventDate.setDate(day);
                while (newEventDate < now || (newEventDate.getMonth() === now.getMonth() && newEventDate.getFullYear() === now.getFullYear() && newEventDate.getDate() < day && newEventDate < now )) {
                    newEventDate.setMonth(newEventDate.getMonth() + 1);
                    newEventDate.setDate(day);
                    if (newEventDate.getDate() !== day) {
                        newEventDate.setDate(0);
                        newEventDate.setDate(day);
                         if (newEventDate < now) {
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
            /** @type {ProcessedEvents} */
            const initialAccumulator = { upcoming: [], past: [], excluded: [] };
            const categorizedEvents = eventsArray.reduce((acc, event) => {
                if (!event || typeof event.date !== 'string') { 
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
            }, initialAccumulator);

            categorizedEvents.upcoming.sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
            categorizedEvents.past.sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime());

            return categorizedEvents;
        } catch (error) {
            console.error('Error processing events:', error);
            return { upcoming: [], past: [], excluded: [] };
        }
    }

    /** @type {ProcessedEvents} */
    let allEvents = $state(processEvents(data?.events));

    $effect(() => {
        allEvents = processEvents(data?.events);
    });
    
    /**
     * Custom locale function for timeago
     * @param {number} _number The timeago/timein number (unused)
     * @param {number} index The index in the locale array
     * @returns {[string, string] | undefined} Tuple of [past, future] strings or undefined if index is out of bounds
     */
    const localeFunc = (_number, index) => {
        const locales = [
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
        ];
        return locales[index];
    };

    register('my-locale', localeFunc);

    let open = $state(false);
    let mode = $state("upcoming");
    let events = $derived(allEvents[mode]);
    /** @type {Event | null} */
    let currentEvent = $state(null);
    /** @type {import('schema-dts').Graph | undefined} */
    let jsonLd = $state(undefined);

    let visible = $state(false);
    let searchQuery = $state("");
    let showFilters = $state(false);
    let selectedCategory = $state("all");
    /** @type {string | null} */
    let hoveredEvent = $state(null);

    /** @type {HTMLButtonElement | null} */
    let filterButtonElement = $state(null); 
    /** @type {HTMLDivElement | null} */
    let filterPanelElement = $state(null);  

    const categories = $derived(
        ["all", ...new Set((events || []).filter(e => e.category).map(e => /** @type {string} */ (e.category)))]
    );

    const filteredEvents = $derived(
        (() => {
            let result = [...(events || [])];
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                result = result.filter(event => 
                    event.title.toLowerCase().includes(query) || 
                    event.summary.toLowerCase().includes(query) ||
                    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }
            if (selectedCategory !== "all") {
                result = result.filter(event => event.category === selectedCategory);
            }
            return result;
        })()
    );

    /** @param {Event} event */
    function openEventDetails(event) {
        currentEvent = event;
        open = true;
    }

    function closeEventDetails() {
        open = false;
        setTimeout(() => {
            if (!open) currentEvent = null;
        }, 300);
    }

    /** @param {SubmitEvent} e */
    function handleSearch(e) {
        e.preventDefault();
    }

    function resetFilters() {
        searchQuery = "";
        selectedCategory = "all";
    }

    onMount(async () => {
        const generateJsonLd = () => {
            const currentUrl = browser ? page.url.href : `${SITE_URL}/events`;
            /** @type {import('schema-dts').Event[]} */
            const schemaEvents = (allEvents.upcoming || []).map(event => {
                const eventSlug = event.slug || slugify(event.title);
                let schemaEventUrl = `${SITE_URL}/events/${eventSlug}`;
                if (event.url && (event.url.startsWith('http://') || event.url.startsWith('https://'))) {
                    schemaEventUrl = event.url;
                }

                /** @type {import('schema-dts').Event} */
                const schemaEvent = {
                    "@type": "Event",
                    name: event.title,
                    startDate: event.date, 
                    endDate: event.date, 
                    url: schemaEventUrl,
                    description: event.summary,
                    eventStatus: isPastDate(event.date) ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
                    location: {
                        "@type": "Place",
                        name: event.venue || "Obafemi Awolowo University",
                        address: {
                            "@type": "PostalAddress",
                            streetAddress: "Obafemi Awolowo University",
                            addressLocality: "Ile-Ife",
                            addressRegion: "Osun",
                            postalCode: "200211",
                            addressCountry: "NG"
                        }
                    },
                    organizer: {
                        "@type": "Organization",
                        name: event.host || "MSSN OAU"
                    },
                    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                };
                if (event.image) {
                    schemaEvent.image = [event.image];
                }
                if (event.paid && event.price) {
                    schemaEvent.offers = {
                        "@type": "Offer",
                        price: event.price,
                        priceCurrency: "NGN",
                        url: schemaEventUrl,
                        availability: "https://schema.org/InStock",
                        validFrom: event.registration_deadline || new Date().toISOString() 
                    };
                }
                return schemaEvent;
            });

            jsonLd = {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "WebPage",
                        name: "MSSN OAU Events",
                        description: "Upcoming and past events organized by MSSN OAU.",
                        url: currentUrl
                    },
                    ...schemaEvents
                ]
            };
        };

        generateJsonLd();
        
        await tick();
        visible = true;
    });

    $effect(() => {
      if (browser && (allEvents.upcoming.length > 0 || allEvents.past.length > 0)) {
            const generateJsonLd = () => {
                const currentUrl = page.url.href;
                /** @type {import('schema-dts').Event[]} */
                const schemaEvents = (allEvents.upcoming || []).map(event => {
                    const eventSlug = event.slug || slugify(event.title);
                    let schemaEventUrl = `${SITE_URL}/events/${eventSlug}`;
                    if (event.url && (event.url.startsWith('http://') || event.url.startsWith('https://'))) {
                        schemaEventUrl = event.url;
                    }
                    /** @type {import('schema-dts').Event} */
                    const schemaEvent = {
                        "@type": "Event",
                        name: event.title,
                        startDate: event.date, 
                        endDate: event.date, 
                        url: schemaEventUrl,
                        description: event.summary,
                        eventStatus: isPastDate(event.date) ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
                        location: {
                            "@type": "Place",
                            name: event.venue || "Obafemi Awolowo University",
                            address: {
                                "@type": "PostalAddress",
                                streetAddress: "Obafemi Awolowo University",
                                addressLocality: "Ile-Ife",
                                addressRegion: "Osun",
                                postalCode: "200211",
                                addressCountry: "NG"
                            }
                        },
                        organizer: {
                            "@type": "Organization",
                            name: event.host || "MSSN OAU"
                        },
                        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                    };
                     if (event.image) {
                        schemaEvent.image = [event.image];
                    }
                    if (event.paid && event.price) {
                        schemaEvent.offers = {
                            "@type": "Offer",
                            price: event.price,
                            priceCurrency: "NGN",
                            url: schemaEventUrl,
                            availability: "https://schema.org/InStock",
                            validFrom: event.registration_deadline || new Date().toISOString()
                        };
                    }
                    return schemaEvent;
                });

                jsonLd = {
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "WebPage",
                            name: "MSSN OAU Events",
                            description: "Upcoming and past events organized by MSSN OAU.",
                            url: currentUrl
                        },
                        ...schemaEvents
                    ]
                };
            };
            generateJsonLd();
        }
    });


    $effect(() => {
        if (showFilters && browser) {
            /** @param {MouseEvent} event */
            const handleClickOutside = (event) => {
                if (
                    filterButtonElement && !filterButtonElement.contains(/** @type {Node} */ (event.target)) &&
                    filterPanelElement && !filterPanelElement.contains(/** @type {Node} */ (event.target))
                ) {
                    showFilters = false;
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    });
</script>

<PageHeader>
    <div in:fly={{ y: -20, duration: 800, delay: 200 }}>
    Our Events
    <br/>
        <Tabs.Root bind:value={mode} class="mt-4">
            <Tabs.List class="grid w-full grid-cols-2 max-w-xs mx-auto bg-primary-50/50 backdrop-blur-sm rounded-lg p-1">
                <Tabs.Trigger 
                    value="upcoming" 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary-800 data-[state=active]:shadow-sm"
                >
                    Upcoming
                </Tabs.Trigger>
                <Tabs.Trigger 
                    value="past" 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary-800 data-[state=active]:shadow-sm"
                >
                    Last 12 Months
                </Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>
    </div>
</PageHeader>

<Seo
    title="Our Events"
    titleTemplate="%s | MSSNOAU"
    description="Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus."
    canonical={`${SITE_URL}/events`}
    openGraph={{
        url: `${SITE_URL}/events`,
        title: 'Our Events | MSSNOAU',
        description: 'Stay updated with events, programmes, and activities by the Muslim Students Society of Nigeria, OAU Branch.',
        images: [
          {
            url: data.events?.[0]?.image || 'https://mssnoau.sirv.com/og/og-events.jpg', 
            width: 1200,
            height: 630,
            alt: 'MSSNOAU Events'
          }
        ],
        siteName: 'MSSNOAU'
    }}
    schema={jsonLd}
/>

<div class="relative py-12 overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 md:px-8 relative z-10">
        {#if visible}
            <!-- Page Title -->
            <div 
                class="mb-10 md:mb-16"
                in:fly={{ y: 30, duration: 800, delay: 400 }}
            >
                <h2 class="mb-4 text-center text-2xl font-bold text-primary-800 md:mb-6 lg:text-3xl font-primary">
                    {mode === "upcoming" ? "Upcoming Events" : "Past Events"}
                </h2>

                <p class="mx-auto max-w-screen-md text-center text-neutral-600 md:text-lg font-secondary">
                    {mode === "upcoming" ? "Join us for our upcoming programmes and activities. We look forward to seeing you!" : "A look back at some of our memorable events from the past year."}
                </p>
                
                <!-- Search and Filter -->
                <div class="mt-8 max-w-2xl mx-auto">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <form class="relative flex-grow" onsubmit={handleSearch}>
                            <input
                                type="text"
                                bind:value={searchQuery}
                                placeholder="Search events..."
                                class="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button 
                                type="submit"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-700"
                            >
                                <Search class="size-5" />
                            </button>
                        </form>
                        
                        <div class="relative">
                            <Button 
                                variant="outline" 
                                class="flex items-center gap-2 w-full sm:w-auto"
                                onclick={() => showFilters = !showFilters}
                                bind:this={filterButtonElement}
                            >
                                <Filter class="size-4" />
                                Filter
                            </Button>
                            
                            {#if showFilters}
                                <div 
                                    class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10"
                                    transition:fade={{ duration: 200 }}
                                    bind:this={filterPanelElement}
                                >
                                    <h3 class="font-medium text-gray-900 mb-2">Categories</h3>
                                    <div class="space-y-2">
                                        {#each categories as category}
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="category" 
                                                    value={category} 
                                                    bind:group={selectedCategory}
                                                    class="text-primary-600 focus:ring-primary-500"
                                                />
                                                <span class="text-sm text-gray-700 capitalize">{category}</span>
                                            </label>
                                        {/each}
                                    </div>
                                    
                                    <div class="mt-4 flex justify-end">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onclick={resetFilters}
                                            class=""
                                        >
                                            Reset
                                        </Button>
                                    </div>
                            </div>
                            {/if}
                        </div>
                    </div>
                    
                    {#if searchQuery || selectedCategory !== "all"}
                        <div class="mt-4 flex items-center justify-between">
                            <p class="text-sm text-gray-600">
                                Showing {filteredEvents.length} of {events.length} events
                            </p>
                            
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onclick={resetFilters}
                                class="text-sm"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    {/if}
                </div>
            </div>

            {#if filteredEvents.length > 0}
                <div 
                    class="grid gap-x-4 gap-y-8 sm:grid-cols-2 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4"
                    in:fly={{ y: 30, duration: 800, delay: 600 }}
                >
                    {#each filteredEvents as event, i (event.title + event.date)}
                        {@const eventDateDetails = formatDate(event.date)} 
                                            {@const dateParts = [
                                                eventDateDetails?.weekday,
                                                (eventDateDetails?.month && eventDateDetails?.day && eventDateDetails?.daySuffix) ? `${eventDateDetails.month} ${eventDateDetails.day}${eventDateDetails.daySuffix}` : null
                                            ]}
                        <div 
                            class="group flex flex-col overflow-hidden rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300"
                            in:scale={{ duration: 600, delay: 800 + (i * 100) }}
                            onmouseenter={() => hoveredEvent = event.title}
                            onmouseleave={() => hoveredEvent = null}
                        >
                            <button
                                type="button"
                                onclick={() => openEventDetails(event)}
                                class="group relative block h-48 overflow-hidden bg-neutral-100 md:h-64 focus:outline-none"
                            >
                                <!-- Background gradient -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                
                                <img
                                    src={event.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                    loading="lazy"
                                    alt={`Flyer for ${event.title}`}
                                    class="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                                />
                                
                                {#if mode === "upcoming" && !isPastDate(event.date)}
                                    <div class="absolute top-3 right-3 z-20">
                                        <span class="rounded-full bg-primary-700/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold tracking-wider text-white shadow-sm">
                                            {format(event.date, 'my-locale')}
                        </span>
                                    </div>
                                {/if}
                                
                                {#if event.category}
                                    <div class="absolute bottom-3 left-3 z-20">
                                        <span class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary-800 shadow-sm">
                                            {event.category}
                                        </span>
                            </div>
                                {/if}
                            </button>

                            <div class="flex flex-1 flex-col p-4 sm:p-6 relative z-10">
                                <h3 class="mb-2 text-lg font-semibold text-primary-800 font-secondary group-hover:text-primary-700 transition-colors">
                                    <button
                                        type="button"
                                        onclick={() => openEventDetails(event)}
                                        class="transition duration-100 hover:text-primary-700 active:text-primary-800 text-left"
                                    >
                                        {event.title}
                                    </button>
                                </h3>

                                <p class="mb-4 text-neutral-600 font-tertiary text-sm leading-relaxed line-clamp-3">
                                    {event.summary || "More details coming soon."}
                                </p>

                                <div class="mt-auto flex items-end justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                           <CalendarDays class="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div class="text-xs font-semibold text-primary-700">
                                                {dateParts.filter(Boolean).join(', ') || 'Date not available'}
                                            </div>
                                            <p class="text-xs text-neutral-600">
                                                {(eventDateDetails?.year && eventDateDetails?.time) ? `${eventDateDetails.year} at ${eventDateDetails.time}` : (eventDateDetails?.year || eventDateDetails?.time || 'Time not available')}
                                            </p>
                                        </div>
                                    </div>

                                    {#if event.paid}
                                        <span class="rounded-full border border-amber-500 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">{event.price || 'Paid Event'}</span>
                                    {:else}
                                        <span class="rounded-full border border-green-500 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">Free</span>
                                {/if}
                                </div>
                                
                                <!-- View Details Button (visible on hover) -->
                                <div 
                                    class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                >
                                    <button
                                        type="button"
                                        onclick={() => openEventDetails(event)}
                                        class="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                                    >
                                        View Details
                                        <ChevronRight class="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div 
                    class="text-center py-12 px-4"
                    in:fade={{ duration: 800, delay: 600 }}
                >
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
                        <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                            <Info class="size-10 text-primary-400" />
                        </div>
                        <h3 class="text-xl font-medium text-primary-800 mb-3">No Events Found</h3>
                        <p class="text-gray-600 mb-6">
                            {searchQuery || selectedCategory !== "all" 
                                ? "No events match your current search or filter criteria. Try adjusting your filters or search terms."
                                : `There are currently no ${mode} events scheduled or listed. Please check back later or contact us for more information.`
                            }
                        </p>
                        
                        {#if searchQuery || selectedCategory !== "all"}
                            <Button 
                                variant="outline"
                                onclick={resetFilters}
                                class="mt-2"
                            >
                                Clear Filters
                            </Button>
                        {/if}
                    </div>
        </div>
            {/if}
        {/if}
    </div>
</div>

{#if currentEvent}
    {@const eventDateDetailsModal = formatDate(currentEvent.date)}
    <ResponsiveModal
        bind:open={open}
        title={currentEvent.title}
        description={currentEvent.host ? `Hosted by: ${currentEvent.host}` : undefined}
        onOpenChange={(/** @type {boolean} */ val) => { if (!val) closeEventDetails(); }}
        contentClass="max-h-[90dvh]"
        side="bottom"
    >
        {#if currentEvent.image}
            <div class="relative rounded-lg overflow-hidden mb-4 border border-gray-100 shadow-sm">
                <img 
                    src={currentEvent.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23f3f4f6' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='24'%3ENo Image Available%3C/text%3E%3C/svg%3E"} 
                    alt={`Flyer for ${currentEvent.title}`} 
                    class="w-full object-cover aspect-[16/9]"
                />
                
                {#if currentEvent.category}
                    <div class="absolute top-3 right-3">
                        <span class="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary-800 shadow-sm">
                            {currentEvent.category}
                    </span>
                </div>
                {/if}
            </div>
        {/if}
        
        <div class="bg-primary-50/50 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p class="text-sm text-gray-700 leading-relaxed">
                {@html currentEvent.summary || "Detailed information will be available soon."}
            </p>
        </div>

        {#if currentEvent.additional_details}
            <div class="prose prose-sm max-w-none text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 mb-4">
                {@html currentEvent.additional_details}
            </div>
        {/if}

        <div class="space-y-3 text-sm mt-5 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
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
            
            {#if currentEvent.capacity}
                <div class="flex items-start">
                    <Users class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                    <span class="text-gray-700">Capacity: {currentEvent.capacity} attendees</span>
                </div>
            {/if}
            
            {#if currentEvent.tags && currentEvent.tags.length > 0}
                <div class="flex items-start">
                    <Tag class="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
                    <div class="flex flex-wrap gap-2">
                        {#each currentEvent.tags as tag}
                            <span class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                                {tag}
                        </span>
                        {/each}
                    </div>
                </div>
                {/if}
        </div>
        
        {#snippet footer()}
            <div class="space-y-2 w-full">
                {#if currentEvent.url}
                    <Button as="a" href={currentEvent.url} target="_blank" class={buttonVariants({ class: "w-full bg-primary-700 hover:bg-primary-800" })}>
                        Register / View Details <ExternalLink class="ml-2 h-4 w-4" />
                    </Button>
                {/if}

                {#if currentEvent.image}
                    <Button
                        as="a"
                        href={currentEvent.image}
                        target="_blank"
                        variant="outline"
                        class="w-full"
                    >
                        View / Download Flyer <ExternalLink class="ml-2 h-4 w-4" />
                    </Button>
                {/if}

                {#if !currentEvent.url}
                    <Button onclick={closeEventDetails} variant="outline" class="w-full">Close</Button>
                {/if}
            </div>
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