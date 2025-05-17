<script>
    import { fly, fade, scale } from 'svelte/transition';
    import {Button} from '$lib/components/ui/button'
    import {Badge} from '$lib/components/ui/badge'
    import ResponsiveModal from '$lib/components/layout/ResponsiveModal.svelte';
    import { Calendar, Clock, MapPin, Tag, Users, Info, ChevronRight, ExternalLink, Ticket, CalendarCheck, User, Phone } from '@lucide/svelte';
    import { format, isPast, formatDistanceToNow, addDays, subDays } from 'date-fns';
    import { toast } from 'svelte-sonner';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    // Sample Data for Testing
    const today = new Date();
    const sampleEvents = [
        {
            id: 'evt1',
            title: 'Inspiring Weekly Halaqah',
            date: addDays(today, 3).toISOString(),
            summary: 'Join us for our regular weekly session of knowledge and reflection. All are welcome!',
            image: 'https://placehold.co/600x400/4CAF50/FFFFFF/png?text=Weekly+Halaqah&font=arial',
            venue: 'Central Mosque, OAU Campus',
            paid: false,
            price: 'Free',
            url: null,
            host: 'MSSNOAU Dawah Committee',
            contact: 'dawah@mssnoau.org',
            capacity: 150,
            tags: ['Halaqah', 'Knowledge', 'Community'],
            additional_details: 'An enriching session to boost your iman and understanding of Islam. Please come with your writing materials.',
            periodical: 'weekly',
        },
        {
            id: 'evt2',
            title: 'Grand Annual Conference 2024',
            date: addDays(today, 30).toISOString(), 
            summary: 'Our flagship annual conference featuring renowned scholars, workshops, and networking opportunities.',
            image: 'https://placehold.co/600x400/FFC107/000000/png?text=Annual+Conference&font=roboto',
            venue: 'Oduduwa Hall, OAU',
            paid: true,
            price: '₦2,000 (Early Bird)',
            url: 'https://mssnoau.org/conference-register',
            host: 'MSSNOAU Central Executive Council',
            contact: 'conference@mssnoau.org / 08012345670',
            capacity: 1000,
            tags: ['Conference', 'Islam', 'Scholars', 'Youth'],
            additional_details: 'Register early to secure your spot. Accommodation assistance available for external participants. Visit our website for more details.',
            periodical: 'once',
        },
        {
            id: 'evt3',
            title: 'Sisters\' Circle: Ramadan Prep',
            date: subDays(today, 7).toISOString(), // A past event
            summary: 'A special session for sisters to discuss and prepare for the blessed month of Ramadan.',
            image: 'https://placehold.co/600x400/E91E63/FFFFFF/png?text=Sisters+Circle&font=montserrat',
            venue: 'Amphitheatre, OAU',
            paid: false,
            price: 'Free for Sisters',
            url: null,
            host: 'MSSNOAU Sisters\' Wing',
            contact: 'sisters@mssnoau.org',
            capacity: 200,
            tags: ['SistersOnly', 'Ramadan', 'Workshop'],
            additional_details: 'Practical tips, spiritual reminders, and Q&A session. Childcare facilities will be available.',
            periodical: 'monthly',
        },
        {
            id: 'evt4',
            title: 'Community Iftar & Lecture',
            date: addDays(today, 1).toISOString(), // Coming soon
            summary: 'Break your fast with the community and listen to an inspiring lecture. Meals will be provided.',
            image: 'https://placehold.co/600x400/00BCD4/FFFFFF/png?text=Community+Iftar&font=lato',
            venue: 'Mosque Premises, OAU',
            paid: false,
            price: 'Free',
            url: null,
            host: 'MSSNOAU Welfare Committee',
            contact: 'welfare@mssnoau.org',
            capacity: 300,
            tags: ['Iftar', 'Community', 'Lecture', 'Ramadan (if applicable)'],
            additional_details: 'Come with your families and friends. Donations are welcome to support future Iftars.',
            periodical: 'once',
        }
    ];

    let events = sampleEvents;
    
    let visible = false;
    let currentEvent = null;
    let showEventModal = false;
    let hoveredEvent = null;
    
    onMount(() => {
        visible = true;
        if (browser) {
            const handleResize = () => {
                // ResponsiveModal handles isLargeScreen internally
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    });
    
    function openEventDetails(event) {
        currentEvent = event;
        showEventModal = true;
    }
    
    function closeEventDetails() {
        showEventModal = false;
        setTimeout(() => {
            currentEvent = null;
        }, 300);
    }
    
    function handleRegister(event) {
        if (isPast(new Date(event.date))) {
            toast.error("This event has already passed!");
            return;
        }
        
        if (event.url) {
            window.open(event.url, '_blank');
        } else {
            toast.info("Registration link not available yet.");
        }
    }
    
    function getEventStatusBadge(event) {
        const eventDate = new Date(event.date);
        
        if (isPast(eventDate)) {
            return { label: "Past Event", variant: "destructive", icon: Calendar };
        }
        
        const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 3 && daysUntil >= 0) { // Check if it's upcoming within 3 days
            return { label: "Coming Soon", variant: "warning", icon: Clock };
        }
        
        if (event.periodical === "weekly") {
            return { label: "Weekly", variant: "secondary", icon: CalendarCheck };
        }
        
        if (event.periodical === "monthly") {
            return { label: "Monthly", variant: "secondary", icon: CalendarCheck };
        }
        
        return { label: "Upcoming", variant: "default", icon: Calendar };
    }
    
    function formatEventDate(dateString) {
        const date = new Date(dateString);
        return {
            full: format(date, 'EEEE, MMMM d, yyyy h:mm a'),
            date: format(date, 'MMMM d, yyyy'),
            time: format(date, 'h:mm a'),
            relative: formatDistanceToNow(date, { addSuffix: true })
        };
    }
</script>

{#snippet eventModalHeader(event)}
    {@const status = getEventStatusBadge(event)}
    <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-foreground pr-8">{event.title}</h2>
            <Badge variant={status.variant} class="flex items-center gap-1.5 whitespace-nowrap">
                <svelte:component this={status.icon} class="size-3.5" />
                {status.label}
            </Badge>
        </div>
    </div>
{/snippet}

{#snippet eventModalFooter(event)}
    {@const isEventPast = isPast(new Date(event.date))}
    <Button variant="outline" on:click={closeEventDetails} class={isEventPast ? 'w-full' : ''}>
        Close
    </Button>
    {#if !isEventPast}
        <Button 
            variant={event.paid ? "default" : "outline"}
            class={`w-full md:w-auto ${event.paid ? "bg-primary-700 hover:bg-primary-800" : ""}`}
            on:click={() => handleRegister(event)}
        >
            {event.paid ? 'Register Now' : 'RSVP'}
        </Button>
    {/if}
{/snippet}

<section class="py-12 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <!-- Page Title -->
            <div 
                class="text-center mb-12"
                in:fly={{ y: 30, duration: 800, delay: 200 }}
            >
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-800 font-secondary mb-4">
                    Upcoming Events
                </h1>
                <p class="text-gray-600 max-w-2xl mx-auto font-tertiary">
                    Join us for these inspiring gatherings and activities designed to strengthen our community and faith.
                </p>
            </div>
            
            <!-- Events Grid -->
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {#each events as event, i}
                    {@const status = getEventStatusBadge(event)}
                    {@const formattedDate = formatEventDate(event.date)}
                    
                    <!-- Event Card -->
                    <div 
                        class="group relative overflow-hidden rounded-xl border border-primary-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                        in:fly={{ y: 30, duration: 800, delay: 400 + (i * 150) }}
                        on:mouseenter={() => hoveredEvent = event.title}
                        on:mouseleave={() => hoveredEvent = null}
                    >
                        <!-- Background gradient -->
                        <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <!-- Event Image -->
                        <div class="relative h-48 overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <img 
                                src={event.image || "/placeholder.svg?height=192&width=384"} 
                                alt={event.title}
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            <!-- Status Badge -->
                            <div class="absolute top-3 right-3 z-20">
                                <Badge variant={status.variant} class="flex items-center gap-1.5">
                                    <svelte:component this={status.icon} class="size-3.5" />
                                    {status.label}
                                </Badge>
                            </div>
                            
                            <!-- Date Badge -->
                            <div class="absolute bottom-3 left-3 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
                                <span class="text-primary-800 font-bold text-xl leading-none">
                                    {format(new Date(event.date), 'd')}
                                </span>
                                <span class="text-primary-700 text-xs uppercase">
                                    {format(new Date(event.date), 'MMM')}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Event Content -->
                        <div class="p-5 relative z-10">
                            <h3 class="text-xl font-semibold text-primary-800 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                {event.title}
                            </h3>
                            
                            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                                {event.summary}
                            </p>
                            
                            <!-- Event Details -->
                            <div class="space-y-2 mb-4">
                                <div class="flex items-center text-sm text-gray-700">
                                    <Clock class="size-4 mr-2 text-primary-600" />
                                    <span>{formattedDate.time}</span>
                                </div>
                                
                                <div class="flex items-center text-sm text-gray-700">
                                    <MapPin class="size-4 mr-2 text-primary-600" />
                                    <span>{event.venue}</span>
                                </div>
                                
                                {#if event.paid}
                                    <div class="flex items-center text-sm text-gray-700">
                                        <Ticket class="size-4 mr-2 text-primary-600" />
                                        <span>{event.price || 'Paid Event'}</span>
                                    </div>
                                {/if}
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <button
                                    class="text-primary-700 text-sm font-medium hover:text-primary-800 transition-colors flex items-center gap-1 px-3 py-2 rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                    on:click={() => openEventDetails(event)}
                                >
                                    View Details
                                    <ChevronRight class="size-4" />
                                </button>
                                
                                {#if !isPast(new Date(event.date))}
                                    <Button 
                                        size="sm"
                                        variant={event.paid ? "default" : "outline"}
                                        class={event.paid ? "bg-primary-700 hover:bg-primary-800" : ""}
                                        on:click={() => handleRegister(event)}
                                    >
                                        {event.paid ? 'Register' : 'RSVP'}
                                    </Button>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <!-- End Event Card -->
                {/each}
            </div>
        {/if}
    </div>
    
    <!-- ResponsiveModal for Event Details -->
    {#if currentEvent}
        {@const formattedFullDate = formatEventDate(currentEvent.date)}
        <ResponsiveModal 
            bind:open={showEventModal} 
            title=""  <!-- Title handled by header snippet -->
            description={currentEvent.summary} 
            onOpenChange={(val) => { if (!val) closeEventDetails(); }}
            contentClass="p-0 md:max-w-[600px]" <!-- Remove padding for custom layout inside -->
        >
            {#snippet header()}
                {@render eventModalHeader(currentEvent)}
            {/snippet}
            <!-- Children slot content -->
            <div class="space-y-6 p-6 overflow-y-auto max-h-[calc(85vh-180px)] md:max-h-[calc(100vh-250px)]">
                {#if currentEvent.image}
                    <div class="rounded-lg overflow-hidden">
                        <img 
                            src={currentEvent.image || "/placeholder.svg"} 
                            alt={currentEvent.title}
                            class="w-full h-48 md:h-64 object-cover"
                        />
                    </div>
                {/if}
                <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-start">
                            <Calendar class="size-5 mr-3 text-primary-600 mt-0.5" />
                            <div>
                                <h4 class="text-sm font-medium text-gray-900">Date & Time</h4>
                                <p class="text-sm text-gray-700">{formattedFullDate.full}</p>
                                <p class="text-xs text-gray-500 mt-1">{formattedFullDate.relative}</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <MapPin class="size-5 mr-3 text-primary-600 mt-0.5" />
                            <div>
                                <h4 class="text-sm font-medium text-gray-900">Location</h4>
                                <p class="text-sm text-gray-700">{currentEvent.venue}</p>
                            </div>
                        </div>
                        {#if currentEvent.host}
                            <div class="flex items-start">
                                <User class="size-5 mr-3 text-primary-600 mt-0.5" />
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Host</h4>
                                    <p class="text-sm text-gray-700">{currentEvent.host}</p>
                                </div>
                            </div>
                        {/if}
                        {#if currentEvent.contact}
                            <div class="flex items-start">
                                <Phone class="size-5 mr-3 text-primary-600 mt-0.5" />
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Contact</h4>
                                    <p class="text-sm text-gray-700">{currentEvent.contact}</p>
                                </div>
                            </div>
                        {/if}
                        {#if currentEvent.capacity}
                            <div class="flex items-start">
                                <Users class="size-5 mr-3 text-primary-600 mt-0.5" />
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Capacity</h4>
                                    <p class="text-sm text-gray-700">{currentEvent.capacity} attendees</p>
                                </div>
                            </div>
                        {/if}
                        {#if currentEvent.paid}
                            <div class="flex items-start">
                                <Ticket class="size-5 mr-3 text-primary-600 mt-0.5" />
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Price</h4>
                                    <p class="text-sm text-gray-700">{currentEvent.price}</p>
                                </div>
                            </div>
                        {/if}
                    </div>
                    {#if currentEvent.tags && currentEvent.tags.length > 0}
                        <div class="flex items-start pt-2 border-t border-gray-200">
                            <Tag class="size-5 mr-3 text-primary-600 mt-0.5" />
                            <div>
                                <h4 class="text-sm font-medium text-gray-900">Tags</h4>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    {#each currentEvent.tags as tag}
                                        <Badge variant="outline" class="bg-white">{tag}</Badge>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
                {#if currentEvent.additional_details}
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Additional Information</h3>
                        <p class="text-gray-700">{currentEvent.additional_details}</p>
                    </div>
                {/if}
            </div>
            {#snippet footer()}
                 {@render eventModalFooter(currentEvent)}
            {/snippet}
        </ResponsiveModal>
    {/if}
</section>