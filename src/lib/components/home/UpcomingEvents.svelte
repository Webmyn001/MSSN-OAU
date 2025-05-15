<script>
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Check, BookUser, CalendarDays, Clock, MapPin } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import slugify from "$lib/utils/slugify.js";
    import { fly, fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    // Define the event type structure to fix type errors
    /**
     * @typedef {Object} Event
     * @property {string} title - Event title
     * @property {string} date - Event date
     * @property {string} image - Event image URL
     * @property {string} summary - Event description
     * @property {boolean} [paid] - Whether the event is paid
     * @property {string} [price] - Price of the event if paid
     */
    
    /** @type {{events: Array<{
        title: string;
        date: string;
        image: string;
        summary: string;
        paid?: boolean;
        price?: string;
    }>}} */
    let {
        events = [
        {
            title: "Weekly Ta'leem",
            date: "Every Sunday",
            time: "2:00 PM",
            location: "Computer Building",
            description: "Join us for our weekly Ta'leem sessions where we discuss topics related to Islam and spirituality.",
            image: "/images/events/taleem.webp"
        },
        {
            title: "Monthly Night Vigil",
            date: "Last Saturday of every month",
            time: "10:00 PM",
            location: "Central Mosque",
            description: "Join us for our monthly night vigil as we engage in midnight prayers, dhikr, and spiritual reflection.",
            image: "/images/events/night-vigil.webp"
        },
        {
            title: "Annual Ramadan Planning",
            date: "February 28th",
            time: "4:00 PM",
            location: "Central Mosque",
            description: "Join the planning committee for Ramadan activities and programs.",
            image: "/images/events/ramadan.webp"
        }
    ]
    } = $props();
    
    // For staggered animations
    let visible = $state(false);
    
    // For hover effects
    let hoveredCard = $state(null);
    
    onMount(() => {
        visible = true;
    });
</script>


<!-- Upcoming Events Section -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <!-- Title with enhanced styling -->
    <div class="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-10 lg:mb-14 relative z-10">
        <div class="text-center sm:text-left">
            {#if visible}
                <h2 
                    in:fly={{ y: 20, duration: 800, delay: 200 }}
                    class="text-2xl font-bold font-primary md:text-4xl md:leading-tight relative inline-block"
                >
                    Upcoming Events
                    <span class="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-700 rounded-full"></span>
                </h2>
                <p 
                    in:fly={{ y: 20, duration: 800, delay: 400 }}
                    class="mt-4 text-primary-800 font-secondary"
                >
                    More info and registration for some of our upcoming community events.
                </p>
            {/if}
        </div>

        <div class="mt-6 sm:mt-0">
            {#if visible}
                <a 
                    in:fly={{ y: 20, duration: 800, delay: 600 }}
                    class="py-3 text-nowrap px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-xl border border-primary-200 bg-white/80 backdrop-blur-sm text-primary-800 shadow-sm hover:bg-primary-50 hover:-translate-y-1 focus:outline-none focus:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
                    href="/events"
                >
                    All Events
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </a>
            {/if}
        </div>
    </div>
    <!-- End Title -->

    <!-- Grid with glassmorphism cards -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {#if visible}
            {#each events as event, i}
                <!-- Enhanced Card with glassmorphism -->
                <a 
                    in:fly={{ y: 20, duration: 800, delay: 800 + (i * 200) }}
                    class="group flex flex-col h-full focus:outline-none rounded-xl overflow-hidden backdrop-blur-sm bg-white/30 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                    href={`/events#${slugify(event.title + " " + event.date)}`}
                    onmouseenter={() => hoveredCard = event.title}
                    onmouseleave={() => hoveredCard = null}
                >
                    <div class="relative pt-[50%] sm:pt-[70%] overflow-hidden">
                        <img 
                            loading="lazy"
                            class="size-full absolute top-0 start-0 object-cover transition-transform duration-700 ease-in-out rounded-t-xl {hoveredCard === event.title ? 'scale-110' : 'scale-100'}"
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                        >
                        
                        <!-- Gradient overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {#if event.paid && event.price && event.price.length > 0}
                            <span class="font-tertiary absolute top-0 end-0 rounded-bl-xl text-xs font-medium bg-primary-800/90 backdrop-blur-sm text-white py-1.5 px-3 shadow-lg">
                                Paid - {event.price}
                            </span>
                        {/if}
                    </div>

                    <div class="p-5 flex-grow flex flex-col">
                        <h3 class="text-xl font-secondary font-semibold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">
                            {event.title}
                        </h3>
                        
                        <!-- Event details with icons -->
                        <div class="mt-3 space-y-2">
                            <div class="flex items-center gap-2">
                                <CalendarDays class="shrink-0 size-4 text-primary-700/70" />
                                <span class="text-sm text-gray-600">{event.date}</span>
                            </div>
                            
                            {#if event.time}
                                <div class="flex items-center gap-2">
                                    <Clock class="shrink-0 size-4 text-primary-700/70" />
                                    <span class="text-sm text-gray-600">{event.time}</span>
                                </div>
                            {/if}
                            
                            {#if event.location}
                                <div class="flex items-center gap-2">
                                    <MapPin class="shrink-0 size-4 text-primary-700/70" />
                                    <span class="text-sm text-gray-600">{event.location}</span>
                                </div>
                            {/if}
                        </div>
                        
                        <p class="mt-3 font-tertiary text-gray-600 line-clamp-2 text-ellipsis">
                            {event.summary}
                        </p>
                        
                        <div class="mt-auto pt-4">
                            <button 
                                onclick={() => goto(`/events#${slugify(event.title + " " + event.date)}`)}
                                class="inline-flex items-center gap-x-1 text-sm text-primary-700 font-medium font-secondary group-hover:text-primary-800 transition-colors duration-300"
                            >
                                <span class="relative">
                                    More Info
                                    <span class="absolute bottom-0 left-0 w-full h-0.5 bg-primary-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                                </span>
                                <svg class="shrink-0 size-4 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                     stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </a>
                <!-- End Card -->
            {/each}

            <!-- Article Card with enhanced glassmorphism -->
            <a 
                in:fly={{ y: 20, duration: 800, delay: 800 + (events.length * 200) }}
                class="group relative flex flex-col w-full min-h-60 bg-cover bg-center rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:shadow-lg col-span-full"
                href="/events/register"
                style="background-image: url('https://plus.unsplash.com/premium_photo-1676496046182-356a6a0ed002?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80')"
            >
                <!-- Enhanced overlay with glassmorphism -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-[2px] rounded-xl group-hover:backdrop-blur-[4px] transition-all duration-500"></div>
                
                <div class="flex-auto p-4 md:p-6 z-10">
                    <h3 class="text-xl text-white/90 group-hover:text-white font-tertiary transition-colors duration-300">
                        <span class="font-bold text-primary-100 font-secondary">How To</span> register for Paid MSSN Events online via the website.
                    </h3>
                </div>
                
                <div class="pt-0 p-4 md:p-6 mt-auto z-10">
                    <div class="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary-100 transition-colors duration-300">
                        <span class="relative">
                            Read Article
                            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-primary-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </span>
                        <svg 
                            class="shrink-0 size-4 transition-transform duration-300 group-hover:translate-x-1" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24"
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="2"
                            stroke-linecap="round" 
                            stroke-linejoin="round"
                        >
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            </a>
            <!-- End Article Card -->
        {/if}
    </div>
    <!-- End Grid -->
</div>
<!-- End Upcoming Events -->