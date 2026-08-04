<script>
    import { fly, fade } from 'svelte/transition';
    import { Button } from '$lib/components/ui/button'
    import { Badge } from '$lib/components/ui/badge'
    import { ArrowLeft, Calendar, Clock, MapPin, Tag, Users, Info, ChevronRight, ExternalLink, Ticket, CalendarCheck, User, Phone, AlertCircle } from '@lucide/svelte';
    import { format, isPast, formatDistanceToNow } from 'date-fns';
    import { toast } from 'svelte-sonner';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { API_BASE } from '$lib/api/base';

    let { data } = $props();

    let eventData = $state();
    let eventExists = $state(true);
    let errorMessage = $state("");

    if (data && data.event && data.status === 200) {
        eventData = data.event;
        eventExists = true;
    } else {
        eventExists = false;
        errorMessage = data?.error?.message || "Event not found or could not be loaded.";
    }

    let visible = $state(false);
    let regName = $state("");
    let regEmail = $state("");
    let regPhone = $state("");
    let regLoading = $state(false);
    let regSuccess = $state(null);
    let regError = $state("");

    async function submitRegistration() {
        if (!eventData) return;
        if (!regName.trim() || !regEmail.trim()) {
            regError = "Please enter your Name and Email.";
            return;
        }

        regLoading = true;
        regError = "";
        regSuccess = null;
        try {
            const res = await fetch(`${API_BASE}/public/events/${eventData.id}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: regName.trim(), email: regEmail.trim(), phone: regPhone.trim() || null })
            });
            const json = await res.json();
            if (json.success) {
                regSuccess = json.data;
                toast.success("Registration completed successfully!");
                regName = ""; regEmail = ""; regPhone = "";
            } else { regError = json.error || "Registration failed"; }
        } catch { regError = "Unable to connect to registration server."; }
        finally { regLoading = false; }
    }

    onMount(() => {
        visible = true;
        if (browser) window.scrollTo(0, 0);
    });

    function formatEventDate(dateString) {
        const date = new Date(dateString);
        return {
            full: format(date, 'EEEE, MMMM d, yyyy h:mm a'),
            date: format(date, 'MMMM d, yyyy'),
            time: format(date, 'h:mm a'),
            relative: formatDistanceToNow(date, { addSuffix: true })
        };
    }

    const formattedEventDate = $derived.by(() => {
        if (!eventData?.date) return null;
        return formatEventDate(eventData.date);
    });

    const formattedEndDate = $derived.by(() => {
        if (!eventData?.endDate) return null;
        return formatEventDate(eventData.endDate);
    });

    const eventStatus = $derived.by(() => {
        if (!eventData) return { label: "Unknown", variant: "secondary", icon: Info };
        const endDate = new Date(eventData.endDate || eventData.date);
        const startDate = new Date(eventData.date);
        if (isPast(endDate)) return { label: "Past Event", variant: "destructive", icon: Calendar };
        const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3 && daysUntil >= 0) return { label: "Coming Soon", variant: "warning", icon: Clock };
        return { label: "Upcoming", variant: "default", icon: Calendar };
    });

    const isEventPast = $derived.by(() => {
        if (!eventData?.endDate && !eventData?.date) return true;
        return isPast(new Date(eventData.endDate || eventData.date));
    });
</script>

<section class="py-12 relative overflow-hidden min-h-[80vh]">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <div in:fade={{ duration: 300 }}>
                <a href="/events" class="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors mb-8">
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
                                            <p class="text-gray-700"><span class="font-semibold">Start:</span> {formattedEventDate.full}</p>
                                            <p class="text-sm text-gray-500 mt-0.5">{formattedEventDate.relative}</p>
                                            {#if formattedEndDate}
                                                <p class="text-gray-700 mt-1"><span class="font-semibold">End:</span> {formattedEndDate.full}</p>
                                                <p class="text-sm text-gray-500 mt-0.5">{formattedEndDate.relative}</p>
                                            {/if}
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
                                    {#if !isEventPast}
                                        {#if regSuccess}
                                            <div class="rounded-lg bg-green-50 p-4 border border-green-200 text-green-900 space-y-2 mt-4">
                                                <div class="flex items-center gap-2 font-bold text-sm text-green-800">
                                                    <span>&#10003; {regSuccess.message}</span>
                                                </div>
                                                <p class="text-xs">Your Ticket Code: <code class="bg-green-100 px-2 py-0.5 rounded font-mono font-bold text-green-900">{regSuccess.ticket?.ticketCode ?? ''}</code></p>
                                                <p class="text-[11px] text-gray-500">Screenshot or save your ticket code for check-in at the venue.</p>
                                            </div>
                                        {:else}
                                            <div class="mt-4 rounded-xl border border-primary-100 bg-gradient-to-b from-primary-50/80 to-white p-4 shadow-sm">
                                                <div class="flex items-center justify-between mb-3">
                                                    <h4 class="font-bold text-primary-900 text-sm flex items-center gap-2">
                                                        <Ticket class="h-4 w-4 text-primary-600" />
                                                        Register
                                                    </h4>
                                                    <span class="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Free</span>
                                                </div>
                                                {#if regError}
                                                    <div class="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{regError}</div>
                                                {/if}
                                                <div class="space-y-3">
                                                    <div>
                                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                                                        <input type="text" bind:value={regName} placeholder="Your full name" class="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                                                    </div>
                                                    <div>
                                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                                                        <input type="email" bind:value={regEmail} placeholder="student@example.com" class="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                                                    </div>
                                                    <div>
                                                        <label class="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                                                        <input type="tel" bind:value={regPhone} placeholder="08012345678" class="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                                                    </div>
                                                    <Button onclick={submitRegistration} disabled={regLoading} class="w-full font-bold text-xs py-2.5 rounded-lg shadow-sm text-white bg-primary-700 hover:bg-primary-800">
                                                        {#if regLoading}
                                                            <span class="flex items-center justify-center gap-2">
                                                                <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                                                                Registering...
                                                            </span>
                                                        {:else}
                                                            Register for Free
                                                        {/if}
                                                    </Button>
                                                </div>
                                            </div>
                                        {/if}

                                        {#if eventData.image}
                                            <Button as="a" href={eventData.image} target="_blank" variant="outline" class="w-full mt-3">
                                                View / Download Flyer <ExternalLink class="ml-2 h-4 w-4" />
                                            </Button>
                                        {/if}
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
                            <Button onclick={() => goto('/events')} variant="default" class="bg-primary-700 hover:bg-primary-800 text-white">
                                Browse All Events
                            </Button>
                            <Button onclick={() => window.location.reload()} variant="outline" class="border-primary-300 hover:bg-primary-50 text-primary-700">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</section>
