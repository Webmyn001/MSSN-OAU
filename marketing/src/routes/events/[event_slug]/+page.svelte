<script>
    import { fly, fade, scale } from 'svelte/transition';
    import { Button } from '$lib/components/ui/button'
    import { Badge } from '$lib/components/ui/badge'
    import { ArrowLeft, Calendar, Clock, MapPin, Tag, Users, Info, ChevronRight, ExternalLink, Ticket, CalendarCheck, User, Phone, AlertCircle } from '@lucide/svelte';
    import { format, isPast, formatDistanceToNow } from 'date-fns';
    import { toast } from 'svelte-sonner';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    /**
     * @typedef {any} IconType  // Changed from SvelteComponentType to any for simplicity with Lucide icons
     */

    /**
     * @typedef {Object} EventType
     * @property {string} title - The title of the event
     * @property {string} slug - The unique slug identifier
     * @property {string} image - URL of event image
     * @property {string} summary - Short summary description
     * @property {boolean} paid - Whether the event requires payment
     * @property {string} [price] - Price of the event if paid
     * @property {string} date - Date and time of the event (ISO string)
     * @property {string} venue - Location of the event
     * @property {string} [url] - Registration or details URL
     * @property {string} [host] - Organizing entity
     * @property {string} [contact] - Contact information
     * @property {string} [category] - Event category
     * @property {string[]} [tags] - Related tags
     * @property {number} [capacity] - Maximum attendees
     * @property {string} [registration_deadline] - Deadline for registration (ISO string)
     * @property {string} [additional_details] - Further information
     */

    /**
     * @typedef {Object} EventStatus
     * @property {string} label - Display label for the status
     * @property {string} variant - Visual variant for the badge
     * @property {IconType} icon - Icon component to display (using any for broader compatibility)
     */

    /**
     * @typedef {Object} FormattedDate
     * @property {string} full
     * @property {string} date
     * @property {string} time
     * @property {string} relative
     */

    let { data } = $props();

    /** @type {EventType | undefined} */
    let eventData = $state();
    let eventExists = $state(true);
    let errorMessage = $state("");

    if (data && data.event && data.status === 200) {
        eventData = data.event;
        eventExists = true;
    } else {
        console.error("Error fetching event data:", data?.error);
        eventExists = false;
        errorMessage = data?.error?.message || "Event not found or could not be loaded.";
        // eventData remains undefined
    }

    let visible = $state(false);
    
    onMount(() => {
        visible = true;
        if (browser) {
            window.scrollTo(0, 0);
        }
    });
    
    /**
     * Returns status badge configuration for the event
     * @param {EventType} event - The event object to analyze
     * @returns {EventStatus}
     */
    function getEventStatusBadge(event) {
        const eventDate = new Date(event.date);
        if (isPast(eventDate)) {
            return { label: "Past Event", variant: "destructive", icon: Calendar };
        }
        const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3 && daysUntil >= 0) {
            return { label: "Coming Soon", variant: "warning", icon: Clock };
        }
        const deadlineDate = event.registration_deadline ? new Date(event.registration_deadline) : null;
        if (deadlineDate && isPast(deadlineDate)) {
            return { label: "Registration Closed", variant: "secondary", icon: CalendarCheck };
        }
        return { label: "Upcoming", variant: "default", icon: Calendar };
    }
    
    /**
     * Format dates for display
     * @param {string} dateString - ISO date string to format
     * @returns {FormattedDate}
     */
    function formatEventDate(dateString) {
        const date = new Date(dateString);
        return {
            full: format(date, 'EEEE, MMMM d, yyyy h:mm a'),
            date: format(date, 'MMMM d, yyyy'),
            time: format(date, 'h:mm a'),
            relative: formatDistanceToNow(date, { addSuffix: true })
        };
    }
    
    function handleRegister() {
        if (!eventData) return;
        if (isPast(new Date(eventData.date))) {
            toast.error("This event has already passed!");
            return;
        }
        if (eventData.url) {
            window.open(eventData.url, '_blank');
        } else if(eventData.url === '') {
            toast.info("Registration link not available yet.");
        } else {
            toast.info("Registration link not available.");
        }   
    }

    const formattedEventDate = $derived.by(() => {
        if (!eventData?.date) return null;
        return formatEventDate(eventData.date);
    });

    const deadlineFormatted = $derived.by(() => {
        if (!eventData?.registration_deadline) return null;
        return formatEventDate(eventData.registration_deadline);
    });

    const eventStatus = $derived.by(() => {
        if (!eventData) return { label: "Unknown", variant: "secondary", icon: Info };
        return getEventStatusBadge(eventData);
    });

    const isEventPast = $derived.by(() => {
        if (!eventData?.date) return true; // Default to past if no date
        return isPast(new Date(eventData.date));
    });

</script>

<section class="py-12 relative overflow-hidden min-h-[80vh]">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <div in:fade={{ duration: 300 }}>
                <a 
                    href="/events"
                    class="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors mb-8"
                >
                    <ArrowLeft class="h-4 w-4" />
                    Back to all events
                </a>
            </div>

            {#if eventExists && eventData}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-8">
                        <div class="space-y-4" in:fly={{ y: 20, duration: 600, delay: 100 }}>
                            <div class="flex flex-wrap items-center gap-3">
                                {#if eventStatus}
                                <Badge variant={eventStatus.variant} class="flex items-center gap-1.5" href="#">
                                    <eventStatus.icon class="h-3.5 w-3.5" />
                                    {eventStatus.label}
                                </Badge>
                                {/if}
                                
                                {#if eventData.category}
                                    <Badge variant="outline" class="bg-white/80 backdrop-blur-sm flex items-center gap-1.5" href="#">
                                        <Tag class="h-3.5 w-3.5" />
                                        {eventData.category}
                                    </Badge>
                                {/if}
                            </div>
                            <h1 class="text-3xl md:text-4xl font-bold text-primary-800 font-primary tracking-tight">
                                {eventData.title}
                            </h1>
                            <p class="text-gray-700 text-lg font-secondary">
                                {eventData.summary}
                            </p>
                        </div>
                        
                        <div class="rounded-xl overflow-hidden border border-primary-100 shadow-lg" in:fly={{ y: 20, duration: 600, delay: 200 }}>
                            <img 
                                src={eventData.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23f3f4f6' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='24'%3ENo Image Available%3C/text%3E%3C/svg%3E"} 
                                alt={eventData.title}
                                class="w-full h-auto object-cover aspect-video"
                            />
                        </div>
                            
                        <div class="space-y-6" in:fly={{ y: 20, duration: 600, delay: 300 }}>
                            <h2 class="text-2xl font-semibold text-primary-800 font-primary relative inline-block">
                                About This Event
                                <span class="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-primary-600/70 rounded-full"></span>
                            </h2>
                            {#if eventData.additional_details}
                                <div class="bg-white/40 backdrop-blur-sm rounded-xl border border-primary-100/50 p-6 shadow-sm">
                                    <p class="text-gray-700 whitespace-pre-line">
                                        {eventData.additional_details}
                                    </p>
                                </div>
                            {/if}
                            {#if eventData.tags && eventData.tags.length > 0}
                                <div class="space-y-2">
                                    <h3 class="text-lg font-semibold text-primary-800 font-secondary">Topics</h3>
                                    <div class="flex flex-wrap gap-2">
                                        {#each eventData.tags as tag}
                                            <Badge variant="outline" class="bg-white/80 backdrop-blur-sm capitalize" href="#">
                                                {tag}
                                            </Badge>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                        
                        <div class="mt-12 pt-8 border-t border-gray-200" in:fly={{ y: 20, duration: 600, delay: 400 }}>
                            <div class="flex flex-col sm:flex-row items-center gap-4 justify-between bg-primary-50/50 backdrop-blur-sm rounded-xl p-6 border border-primary-100">
                                <div>
                                    <h3 class="text-lg font-semibold text-primary-800">Discover More Events</h3>
                                    <p class="text-primary-700">Check out our upcoming events and activities</p>
                                </div>
                                <Button onclick={() => goto('/events')} class="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white">
                                    See All Events
                                    <ChevronRight class="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="lg:col-span-1">
                        <div class="sticky top-24 space-y-6" in:fly={{ x: 20, duration: 600, delay: 200 }}>
                            <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-primary-100 shadow-lg overflow-hidden">
                                <div class="bg-primary-700 p-6 text-white">
                                    <h2 class="text-xl font-semibold font-secondary">Event Details</h2>
                                </div>
                                <div class="p-6 space-y-6">
                                    {#if formattedEventDate}
                                    <div class="flex items-start gap-3">
                                        <Calendar class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                        <div>
                                            <h3 class="text-sm font-medium text-gray-900">Date & Time</h3>
                                            <p class="text-gray-700">{formattedEventDate.full}</p>
                                            <p class="text-sm text-gray-500 mt-1">{formattedEventDate.relative}</p>
                                        </div>
                                    </div>
                                    {/if}
                                    <div class="flex items-start gap-3">
                                        <MapPin class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                        <div>
                                            <h3 class="text-sm font-medium text-gray-900">Location</h3>
                                            <p class="text-gray-700">{eventData.venue}</p>
                                        </div>
                                    </div>
                                    {#if eventData.host}
                                        <div class="flex items-start gap-3">
                                            <User class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-900">Organizer</h3>
                                                <p class="text-gray-700">{eventData.host}</p>
                                            </div>
                                        </div>
                                    {/if}
                                    {#if eventData.contact}
                                        <div class="flex items-start gap-3">
                                            <Phone class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-900">Contact</h3>
                                                <p class="text-gray-700 break-words">{eventData.contact}</p>
                                            </div>
                                        </div>
                                    {/if}
                                    {#if eventData.capacity}
                                        <div class="flex items-start gap-3">
                                            <Users class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-900">Capacity</h3>
                                                <p class="text-gray-700">{eventData.capacity} attendees</p>
                                            </div>
                                        </div>
                                    {/if}
                                    {#if eventData.paid}
                                        <div class="flex items-start gap-3">
                                            <Ticket class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-900">Price</h3>
                                                <p class="text-gray-700">{eventData.price || 'Paid Event'}</p>
                                            </div>
                                        </div>
                                    {/if}
                                    {#if deadlineFormatted}
                                        <div class="flex items-start gap-3">
                                            <CalendarCheck class="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h3 class="text-sm font-medium text-gray-900">Registration Deadline</h3>
                                                <p class="text-gray-700">{deadlineFormatted.date}</p>
                                            </div>
                                        </div>
                                    {/if}
                                    {#if !isEventPast}
                                        <div class="space-y-2 mt-4">
                                            <Button 
                                                class="w-full {eventData.paid ? 'bg-primary-700 hover:bg-primary-800 text-white' : ''}"
                                                variant={eventData.paid ? "default" : "outline"}
                                                onclick={handleRegister}
                                            >
                                                {eventData.paid ? 'Register Now' : 'RSVP to Event'}
                                            </Button>

                                            {#if eventData.image}
                                                <Button
                                                    as="a"
                                                    href={eventData.image}
                                                    target="_blank"
                                                    variant="outline"
                                                    class="w-full"
                                                >
                                                    View / Download Flyer <ExternalLink class="ml-2 h-4 w-4" />
                                                </Button>
                                            {/if}
                                        </div>
                                    {:else}
                                        <div class="bg-gray-100 rounded-lg p-3 text-center text-gray-700 font-medium mt-4">
                                            This event has already passed
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center py-16 text-center" in:fade={{ duration: 400 }}>
                    <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-primary-100 shadow-lg p-10 max-w-2xl mx-auto">
                        <div class="mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                            <AlertCircle class="h-8 w-8 text-red-600" />
                        </div>
                        <h2 class="text-2xl font-bold text-primary-800 mb-3">Event Not Found</h2>
                        <p class="text-gray-600 mb-6">
                            {errorMessage || "We couldn't find the event you're looking for. It may have been removed or the URL might be incorrect."}
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                onclick={() => goto('/events')}
                                variant="default"
                                class="bg-primary-700 hover:bg-primary-800 text-white"
                            >
                                Browse All Events
                            </Button>
                            <Button 
                                onclick={() => window.location.reload()}
                                variant="outline"
                                class="border-primary-300 hover:bg-primary-50 text-primary-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</section>