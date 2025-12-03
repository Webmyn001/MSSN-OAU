<script>
    import { onMount } from 'svelte';
    import { prayerTimes as solahTimes, upcomingPrayer, formatTime } from '$lib/stores/prayerTimes';
    import { Badge } from '$lib/components/ui/badge';
    import { Clock, MapPin, Calendar, Moon, MapPinned } from '@lucide/svelte';
    import { mosques } from '$lib/stores/mosques';
    import PrayerTimeCard from './PrayerTimeCard.svelte';
    import { fade, fly } from 'svelte/transition';
    import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
    import AutoplayModule from 'embla-carousel-autoplay';
    import { getFormattedDateVerbose, getFormattedDateVerboseShort } from '$lib/utils/dateFormatting.js';
	import { page } from '$app/state';
    
        /** @typedef {{ adhan: string, iqamah: string }} PrayerTimeEntry */
    /** @typedef {{ subhi?: PrayerTimeEntry, dhuhr?: PrayerTimeEntry, asr?: PrayerTimeEntry, maghrib?: PrayerTimeEntry, isha?: PrayerTimeEntry, jumuah?: PrayerTimeEntry }} PagePrayerTimes */

    /**
     * @typedef {Object} MosquePrayerTimes
     * @property {string} [fajr]
     * // ... other prayers
     */

    /**
     * @typedef {Object} Mosque
     * @property {string} id
     * @property {string} label // Ensure this matches your $mosques store items
     * @property {string} [name]
     * @property {string} [address]
     * @property {string[]} [images]
     * @property {string} [url]
     * @property {string} [description]
     * @property {MosquePrayerTimes | Record<string, string>} [prayerTimes]
     */
    
    // Hijri date state
    let hijrahDate = $state("");
    let shortHijrahDate = $state("");

        /** @type {PagePrayerTimes | undefined} */
        const prayer_times_from_page_data = page.data?.info?.prayer_times;
    
    // Get the upcoming prayer index for styling
    const upcoming_solat = $derived($upcomingPrayer === 'fajr' ? 0 : 
                       $upcomingPrayer === 'dhuhr' ? 1 : 
                       $upcomingPrayer === 'asr' ? 2 : 
                       $upcomingPrayer === 'maghrib' ? 3 : 
                       $upcomingPrayer === 'isha' ? 4 : 0);
    
    // Prayer data for cards with enhanced backgrounds and colors
    const prayerData = [
        { 
            name: 'Fajr', 
            background: '/images/midnight.webp', 
            times: () => prayer_times_from_page_data?.subhi || $solahTimes.subhi,
            color: 'from-indigo-500/80 to-purple-600/80',
            icon: '🌅'
        },
        { 
            name: 'Dhuhr', 
            background: '/images/noon.webp', 
            times: () => prayer_times_from_page_data?.dhuhr || $solahTimes.dhuhr,
            color: 'from-amber-500/80 to-orange-600/80',
            icon: '☀️'
        },
        { 
            name: 'Asr', 
            background: '/images/evening.webp', 
            times: () => prayer_times_from_page_data?.asr || $solahTimes.asr,
            color: 'from-orange-400/80 to-rose-600/80',
            icon: '🌇'
        },
        { 
            name: 'Maghrib', 
            background: '/images/late-evening.webp', 
            times: () => prayer_times_from_page_data?.maghrib || $solahTimes.maghrib,
            color: 'from-rose-500/80 to-purple-700/80',
            icon: '🌆'
        },
        { 
            name: 'Isha', 
            background: '/images/night.webp', 
            times: () => prayer_times_from_page_data?.isha || $solahTimes.isha,
            color: 'from-blue-600/80 to-indigo-900/80',
            icon: '🌙'
        }
    ];
    
    // For mosque modal functionality
    let selectedMosque = $state("");
    let showMosqueModal = $state(false);
    let loaded = $state(false);
    
    // Get the selected mosque object
     // Make sure $mosques store provides items typed as Mosque[]
    // For example, if mosquesData is the raw array from the store:
    // /** @type {Mosque[]} */
    // const mosques = mosquesData;
    const selectedMosqueObject = $derived($mosques.find(mosque => mosque.id === selectedMosque));

    const handleBadgeClick = async (mosqueId) => {
                        selectedMosque = mosqueId;
                        if (!carouselLoadedForModal && $mosques.find(m => m.id === mosqueId)?.images?.length) {
                            const carouselMod = await import('$lib/components/ui/carousel/index.js');
                            Carousel = carouselMod;
                            carouselLoadedForModal = true;
                        }
                        showMosqueModal = true;
                    }
    
    // Carousel API instance
    let carouselAPI = $state();
    
    /** @type {import('$lib/components/ui/carousel/index.js') | null} */
    let Carousel = $state(null);
    let carouselLoadedForModal = $state(false);
    
    onMount(async () => {
        try {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); 
            const year = now.getFullYear();
            
            const formattedDate = `${day}-${month}-${year}`;
            
            const req = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
            
            if (!req.ok) throw new Error("Bad Response");
            
            const res = await req.json();
            
            if (!res || res.code !== 200) throw new Error("Invalid response format");
            
            hijrahDate = `${res.data.hijri.day} ${res.data.hijri.month.en}, ${res.data.hijri.year}${res.data.hijri.designation.abbreviated}`;
            shortHijrahDate = res.data.hijri.date.replaceAll("-", "/") + res.data.hijri.designation.abbreviated;
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            console.error("Error retrieving Hijrah Date:", error.message);
            hijrahDate = "Hijri date unavailable";
            shortHijrahDate = "Hijri date unavailable";
        }
        
        loaded = true;
    });

    // Remove dynamic imports of Dialog and Sheet, and associated states (dialogLoaded, sheetAndCarouselLoaded, isLargeScreen)
    // ResponsiveModal handles its own dynamic loading and screen size detection.

    // $effect for showMosqueModal is removed as ResponsiveModal handles its showing/hiding and dynamic parts.
    // We only need to ensure Carousel is loaded when the modal is about to be shown.
</script>

<!-- Prayer Times Section with Glassmorphism -->
<section 
    id="prayer-times" 
    class="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden"
>
    <!-- Background decorative elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl"></div>
    
    {#if loaded}
    <div in:fade={{ duration: 800, delay: 200 }} class="relative z-10 space-y-12">
        <!-- Header with glassmorphism effect -->
        <div class="backdrop-blur-xl bg-white/30 dark:bg-black/30 rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div class="space-y-2">
                    <h1 class="font-primary font-bold text-3xl sm:text-4xl lg:text-5xl text-primary-900 dark:text-primary-50 tracking-tight">
                        Prayer Times
                    </h1>
                    <p class="text-primary-700 dark:text-primary-300 font-secondary text-lg">
                        For all mosques at OAU, Ile-Ife.
                    </p>
                </div>

                <div class="flex items-center gap-4">
                    <!-- Date card with glassmorphism -->
                    <div class="backdrop-blur-md bg-white/40 dark:bg-black/40 p-4 rounded-xl border border-white/30 dark:border-white/10 shadow-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <Calendar class="h-4 w-4 text-primary-700 dark:text-primary-300" />
                            <p class="text-primary-800 dark:text-primary-200 font-tertiary text-sm sm:text-base">
                                <span class="hidden sm:inline">{getFormattedDateVerbose()}</span>
                                <span class="sm:hidden">{getFormattedDateVerboseShort()}</span>
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Moon class="h-4 w-4 text-primary-700 dark:text-primary-300" />
                            <p class="text-primary-900 dark:text-primary-100 font-tertiary font-semibold text-sm sm:text-base">
                                <span class="hidden sm:inline">{hijrahDate}</span>
                                <span class="sm:hidden">{shortHijrahDate}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Prayer Times Grid with staggered animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {#each prayerData as prayer, index}
                <div in:fly={{ y: 20, duration: 400, delay: 200 + (index * 100) }}>
                    <PrayerTimeCard 
                        prayerName={prayer.name}
                        adhanTime={prayer.times().adhan}
                        iqamahTime={prayer.times().iqamah}
                        background={prayer.background}
                        isUpcoming={upcoming_solat === index}
                        gradientColor={prayer.color}
                        icon={prayer.icon}
                    />
                </div>
            {/each}
        </div>

        <!-- Friday Prayer Notice with glassmorphism -->
        <div class="flex justify-center items-center w-full">
            <div class="backdrop-blur-xl bg-gradient-to-r from-primary-600/80 to-primary-800/80 text-white rounded-xl border border-white/20 p-5 font-tertiary text-sm shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div class="flex items-center justify-center gap-3">
                    <div class="bg-white/20 p-2 rounded-full">
                        <Clock class="h-5 w-5" />
                    </div>
                    <span>Jumu'ah: Khutbah {prayer_times_from_page_data?.jumuah?.adhan ? formatTime(prayer_times_from_page_data.jumuah.adhan) : '1:30 PM'},
                        Solah {prayer_times_from_page_data?.jumuah?.iqamah ? formatTime(prayer_times_from_page_data.jumuah.iqamah) : '2:00 PM'}</span>
                </div>
            </div>
        </div>

        <!-- Mosque Selection with glassmorphism -->
        <div class="backdrop-blur-xl bg-white/30 dark:bg-black/30 rounded-2xl shadow-xl border border-white/20 p-6 space-y-4">
            <div class="flex items-center gap-2">
                <MapPin class="h-5 w-5 text-primary-700 dark:text-primary-300" />
                <h3 class="font-secondary font-semibold text-primary-800 dark:text-primary-200 text-lg">Available Mosques</h3>
            </div>
            
            <div class="flex flex-wrap gap-3 max-w-full overflow-x-auto py-2 scrollbar-hide">
                {#each $mosques as mosque (mosque.id)} 
                    <Badge 
                    href={undefined}
                        class="cursor-pointer transition-all backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 hover:bg-primary-100/80 hover:text-primary-900 px-4 py-2 text-sm" 
                        variant="outline" 
                        role="button"
                        tabindex="0"
                        onclick={() => handleBadgeClick(mosque.id)}
                        onkeydown={/** @param {KeyboardEvent} e */ (e) => { if (e.key === 'Enter' || e.key === ' ') handleBadgeClick(); }}
                    >
                        {mosque.label}
                    </Badge>
                {/each}
            </div>
        </div>

{#if showMosqueModal && selectedMosqueObject}
            {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
                {@const ResponsiveModal = module.default}
                <ResponsiveModal
                    bind:open={showMosqueModal}
                    modalTitle={selectedMosqueObject.name || selectedMosqueObject.label}
                    modalDescription={selectedMosqueObject.address || 'Details for ' + (selectedMosqueObject.name || selectedMosqueObject.label)}
                >
                    {#snippet header()}
                        <div class="flex flex-col gap-1.5 text-center sm:text-left border-b pb-4 mb-4">
                            <h3 class="text-lg font-semibold leading-none tracking-tight">
                                {selectedMosqueObject.name || selectedMosqueObject.label}
                            </h3>
                            {#if selectedMosqueObject.address}
                                <p class="text-sm text-muted-foreground">
                                    <MapPinned class="inline-block h-4 w-4 mr-1" /> {selectedMosqueObject.address}
                                </p>
                            {/if}
            </div>
                    {/snippet}

                    <!-- Default slot content -->
                    <div class="py-2 space-y-4">
                        {#if carouselLoadedForModal && Carousel && selectedMosqueObject.images && selectedMosqueObject.images.length > 0}
                            <Carousel.Root plugins={[AutoplayModule({ delay: 3000, stopOnInteraction: true })]} class="w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg" bind:api={carouselAPI}>
                                <Carousel.Content>
                            {#each selectedMosqueObject.images as image, i}
                                        <Carousel.Item>
                                            <img src={image} alt={`${selectedMosqueObject.name || selectedMosqueObject.label} - Image ${i + 1}`} class="w-full h-64 object-cover" />
                                </Carousel.Item>
                            {/each}
                        </Carousel.Content>
                                {#if selectedMosqueObject.images.length > 1}
                                    <Carousel.Previous class="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                                    <Carousel.Next class="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                                {/if}
                    </Carousel.Root>
                        {:else if selectedMosqueObject.images && selectedMosqueObject.images.length > 0}
                            <p class="text-center text-muted-foreground">Loading images...</p>
                        {/if}
            
                {#if selectedMosqueObject.description}
                            <p class="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedMosqueObject.description}</p>
                {/if}
                
                        {#if selectedMosqueObject.prayerTimes && Object.keys(selectedMosqueObject.prayerTimes).length > 0}
                            <div class="mt-4 pt-4 border-t">
                                <h4 class="font-semibold mb-2 text-center">Prayer Times</h4>
                                <ul class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {#each Object.entries(selectedMosqueObject.prayerTimes) as [prayer, time]}
                                        <li class="flex justify-between">
                                            <span class="capitalize font-medium">{prayer}:</span>
                                            <span>{typeof time === 'string' ? formatTime(time) : time}</span>
                                        </li>
                            {/each}
                                </ul>
                    </div>
                {/if}
            </div>
            
                    {#snippet footer()}
                        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t pt-4 mt-4">
                            <Button variant="outline" on:click={() => showMosqueModal = false}>Close</Button>
                        </div>
                    {/snippet}
                </ResponsiveModal>
            {/await}
                {/if}
                
                    </div>
                {/if}
</section>

<style>
    /* Add custom scrollbar styling */
    :global(.scrollbar-hide) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    :global(.scrollbar-hide::-webkit-scrollbar) {
        display: none;
    }
    
    /* Add subtle animations */
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    
</style>