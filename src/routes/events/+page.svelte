<script>
    import {Button} from "$lib/components/ui/button/index.js";
    import {format, register} from 'timeago.js'
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import {toast} from "svelte-sonner";
    import {formatDate, isPastDate, months} from "$lib/utils/dates.js";
    import {MetaTags} from "svelte-meta-tags";

    function sortEvents(events) {
        const today = new Date();

        // Helper to calculate the closest weekly date
        const getNextWeeklyDate = (day) => {
            const now = new Date(today);
            now.setDate(today.getDate() + ((7 - today.getDay() + day) % 7 || 7));
            return now;
        };

        // Helper to calculate the closest monthly date
        const getNextMonthlyDate = (day) => {
            const now = new Date(today);
            const currentMonth = now.getMonth();
            now.setDate(day);
            if (now < today) {
                now.setMonth(currentMonth + 1); // Move to next month if it's already passed
            }
            return now;
        };

        // Process and assign sortable dates for periodical events
        const enrichedEvents = events.map(event => {
            const enrichedEvent = { ...event };

            if (event.periodical === "weekly" && event.day !== undefined) {
                const nextDate = getNextWeeklyDate(event.day);
                enrichedEvent.date = nextDate.toISOString(); // Update the date
                enrichedEvent.sortableDate = nextDate;
            } else if (event.periodical === "monthly" && event.day !== undefined) {
                const nextDate = getNextMonthlyDate(event.day);
                enrichedEvent.date = nextDate.toISOString(); // Update the date
                enrichedEvent.sortableDate = nextDate;
            } else if (event.date) {
                enrichedEvent.sortableDate = new Date(event.date);
            } else {
                enrichedEvent.sortableDate = null; // Events without dates go to the bottom
            }

            return enrichedEvent;
        });

        // Sort events by the closest date
        return enrichedEvents.sort((a, b) => {
            const dateA = a.sortableDate;
            const dateB = b.sortableDate;

            // If both have valid dates
            if (dateA && dateB) {
                return dateA - dateB; // Earlier dates come first
            }

            // Events without valid dates are pushed to the bottom
            if (!dateA) return 1;
            if (!dateB) return -1;
        });
    }


    const rawEvents = [
        {
            "title": "Islamic Finance Summit",
            "image": "/images/al-usrah.webp",
            "summary": "A summit featuring esteemed guest speakers discussing Islamic finance principles and applications.",
            "paid": false,
            "price": "",
            "date": "2024-05-16T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "Jihad Week 1445 AH Qur'an Competition",
            "image": "/images/committees/jwc.webp",
            "summary": "A celebration of knowledge, spirituality, and community through a Qur'an recitation competition.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "Ramadan Iftar Gatherings",
            "image": "/images/committees/business-committee.webp",
            "summary": "Daily Iftar gatherings during Ramadan to foster unity and gratitude among Muslim students.",
            "paid": false,
            "price": "",
            "date": "2024-04-01T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "Muslimah Ball - An Halāl Dinner",
            "image": "/images/committees/an-nuur.webp",
            "summary": "A special event for Muslim sisters featuring a Halāl dinner and various engaging activities.",
            "paid": true,
            "price": "₦2,000",
            "date": "2024-11-30T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "FYB Dinner and UNIFEMGA Induction",
            "image": "/images/committees/jwc.webp",
            "summary": "A grand dinner and induction ceremony celebrating the achievements of final year brethren.",
            "paid": true,
            "price": "₦5,000",
            "date": "2024-08-11T00:00:00Z",
            "venue": "OAU Central Mosque of Unity",
            "url": "",
        },
        {
            "title": "70th Anniversary Jihad Week Debating Competition",
            "image": "/images/committees/business-committee.webp",
            "summary": "A debating competition as part of the activities marking the 70th Anniversary of MSSN.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "Ramadan Feeding Program",
            "image": "/images/committees/an-nuur.webp",
            "summary": "A program providing meals to students during Ramadan, showcasing dedication and collaboration.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "Obafemi Awolowo University",
            "url": "",
        },
        {
            "title": "Health Checkup and Seminar",
            "image": "/images/committees/jwc.webp",
            "summary": "Health checkup and seminar as part of the Jihad Week activities.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "OAU Central Mosque",
            "url": "",
        },
        {
            "title": "Inspiring Workshops and Panel Sessions",
            "image": "/images/committees/business-committee.webp",
            "summary": "Workshops and panel sessions aimed at inspiring and educating students.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "OAU Central Mosque",
            "url": "",
        },
        {
            "title": "Qur'an Recitation and Tafsir Sessions",
            "image": "/images/committees/an-nuur.webp",
            "summary": "Sessions focusing on Qur'an recitation and interpretation during Jihad Week.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "OAU Central Mosque",
            "url": "",
        },
        {
            "title": "Al-Usrah",
            "image": "/images/committees/jwc.webp",
            "summary": "Weekly sessions for strengthening ourselves in the Deen.",
            "paid": false,
            "price": "",
            "date": "2025-01-17T00:00:00Z",
            "venue": "OAU Central Mosque",
            "url": "",
            "periodical": "weekly",
            "day": 1
        }
    ]
    const events = sortEvents(rawEvents)




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


    let currentEvent = events[0];

    let open = false;
</script>

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
<!-- End Meta Tags -->

<div class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
        <!-- text - start -->
        <div class="mb-10 md:mb-16">
            <h2 class="mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl">Our Events</h2>

            <p class="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">This is a section of some simple
                filler text, also known as placeholder text. It shares some characteristics of a real written text but
                is random or otherwise generated.</p>
        </div>
        <!-- text - end -->

        <div class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">

            {#each events as event, i}
                <!-- Article Start -->
                <button onclick={() => {
                currentEvent = events[i]
                open = !open
            }}
                        class="group relative flex h-48 aspect-video sm:aspect-square flex-col overflow-hidden rounded-xl bg-gray-100 shadow-lg md:h-64 lg:h-72">
                    <article
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
                            <div class="absolute inset-0 {isPastDate(event.date) ? 'bg-black/70' : 'bg-black/30'} blur-sm rounded-[10px]"></div>
                            <time datetime="2022-10-10" class="block backdrop-blur-sm font-mono z-10 text-xs text-neutral-200">
                                {formatDate(event.date).date}
                            </time>

                            <span
                                    class="mb-4 text-ellipsis backdrop-blur-sm sm:mb-0 mt-0.5 block text-md z-10 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium text-primary-100">
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
                                        currentEvent = events[i]
                                        open = !open
                                    }}
                                            class="bg-primary-800 hover:bg-primary-800/90 text-white active:bg-primary-800/90">Register
                                    </Button>
                                {/if}
                            </div>
                            <!-- end mobile only-->
                        </div>
                    </article>
                </button>
                <!-- Article End -->
            {/each}

        </div>
    </div>
</div>


<AlertDialog.Root {open}>
    <AlertDialog.Content>
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
                    <dd class="text-gray-700 sm:col-span-2">{formatDate(currentEvent.date).time} on {formatDate(currentEvent.date).date} ({format(currentEvent.date)}
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
            {#if currentEvent.paid}
                <AlertDialog.Action onclick={() => (window.open(event.url, '_blank'))}>Register</AlertDialog.Action>
            {/if}
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>