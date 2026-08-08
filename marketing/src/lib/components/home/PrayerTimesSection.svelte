<script>
    import { onMount } from 'svelte';
    import { upcomingPrayer, formatTime } from '$lib/stores/prayerTimes';
    import { Clock, MapPin, Calendar, Moon, MapPinned, MousePointerClick } from '@lucide/svelte';
    import PrayerTimeCard from './PrayerTimeCard.svelte';
    import { fade, fly } from 'svelte/transition';
    import AutoplayModule from 'embla-carousel-autoplay';
    import * as Carousel from '$lib/components/ui/carousel';
    import { getFormattedDateVerbose, getFormattedDateVerboseShort } from '$lib/utils/dateFormatting.js';
    import { API_BASE } from '$lib/api/base';

    /**
     * @typedef {{ adhan: string, iqamah: string }} PrayerTimeEntry
     * @typedef {{ subhi?: PrayerTimeEntry, dhuhr?: PrayerTimeEntry, asr?: PrayerTimeEntry, maghrib?: PrayerTimeEntry, isha?: PrayerTimeEntry, jumuah?: PrayerTimeEntry }} PrayerTimesData
     * @typedef {{ id: string, label: string, url: string, images: string[], address: string, description?: string }} MosqueData
     */

    /** @type {{ prayerTimes?: PrayerTimesData | null, prayerTimesUpdatedAt?: string, hijriDate?: string, shortHijriDate?: string, mosques?: MosqueData[] }} */
    let {
        prayerTimes: initialPrayerTimes = null,
        prayerTimesUpdatedAt = '',
        hijriDate: initialHijriDate = '',
        shortHijriDate: initialShortHijriDate = '',
        mosques: mosqueList = []
    } = $props();
    
    // Hijri date state
    let hijrahDate = $state(initialHijriDate || "");
    let shortHijrahDate = $state(initialShortHijriDate || "");

    const formattedUpdatedAt = $derived.by(() => {
        if (!prayerTimesUpdatedAt) return '';
        try {
            const d = new Date(prayerTimesUpdatedAt);
            return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) +
                ' at ' +
                d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    });
    
    // Get the upcoming prayer index for styling
    const upcoming_solat = $derived($upcomingPrayer === 'fajr' ? 0 : 
                       $upcomingPrayer === 'dhuhr' ? 1 : 
                       $upcomingPrayer === 'asr' ? 2 : 
                       $upcomingPrayer === 'maghrib' ? 3 : 
                       $upcomingPrayer === 'isha' ? 4 : 0);
    
    // Prayer times from props (SSR) or client-side fetch
    let apiPrayerTimes = $state(initialPrayerTimes || null);

    /** Safely extract prayer data array from apiPrayerTimes */
    function buildPrayerData(pt) {
        if (!pt || typeof pt !== 'object') return [];
        const names = ['subhi', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const meta = [
            { name: 'Fajr', background: '/images/midnight.webp', color: 'from-indigo-500/80 to-purple-600/80', icon: '🌅' },
            { name: 'Dhuhr', background: '/images/noon.webp', color: 'from-amber-500/80 to-orange-600/80', icon: '☀️' },
            { name: 'Asr', background: '/images/evening.webp', color: 'from-orange-400/80 to-rose-600/80', icon: '🌇' },
            { name: 'Maghrib', background: '/images/late-evening.webp', color: 'from-rose-500/80 to-purple-700/80', icon: '🌆' },
            { name: 'Isha', background: '/images/night.webp', color: 'from-blue-600/80 to-indigo-900/80', icon: '🌙' },
        ];
        return names.map((key, i) => {
            const entry = pt[key];
            if (!entry || typeof entry !== 'object') return null;
            return {
                ...meta[i],
                adhan: entry.adhan || '',
                iqamah: entry.iqamah || '',
            };
        }).filter(Boolean);
    }

    // Whether we have any prayer times to display
    // Gated on `loaded` to avoid Svelte 5 hydration timing issues where $state can be briefly undefined
    const hasPrayerTimes = $derived(loaded && buildPrayerData(apiPrayerTimes).length > 0);

    // Prayer data for cards with enhanced backgrounds and colors
    const prayerData = $derived(loaded ? buildPrayerData(apiPrayerTimes) : []);
    
    // For mosque modal functionality
    let selectedMosque = $state("");
    let showMosqueModal = $state(false);
    let loaded = $state(false);
    
    // For compact mosque accordion on homepage
    let expandedMosqueId = $state("");
    
    const selectedMosqueObject = $derived(mosqueList.find(mosque => mosque.id === selectedMosque));
    const expandedMosqueObject = $derived(mosqueList.find(mosque => mosque.id === expandedMosqueId));

    /** @param {string} mosqueId */
    function toggleMosque(mosqueId) {
        expandedMosqueId = expandedMosqueId === mosqueId ? "" : mosqueId;
    }

    const handleBadgeClick = (mosqueId) => {
        selectedMosque = mosqueId;
        showMosqueModal = true;
    }
    
    // Carousel API instance
    let carouselAPI = $state();
    
    onMount(async () => {
        // Fetch prayer times from API if props didn't provide them
        if (!apiPrayerTimes) {
            try {
                const res = await fetch(`${API_BASE}/public/prayer-times`);
                if (res.ok) {
                    const body = await res.json();
                    if (body?.success && body?.data) {
                        if (body.data.prayer_times) {
                            apiPrayerTimes = body.data.prayer_times;
                        }
                        if (body.data.hijriDate && !hijrahDate) {
                            hijrahDate = body.data.hijriDate;
                        }
                        if (body.data.shortHijriDate && !shortHijrahDate) {
                            shortHijrahDate = body.data.shortHijriDate;
                        }
                    }
                }
            } catch (err) {
                console.warn("Could not fetch prayer times from API server:", err);
            }
        }

        // Fallback Hijri date fetch from AlAdhan if not set
        if (!hijrahDate) {
            try {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0'); 
                const year = now.getFullYear();
                const formattedDate = `${day}-${month}-${year}`;
                
                const req = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
                if (req.ok) {
                    const res = await req.json();
                    if (res && res.code === 200) {
                        hijrahDate = `${res.data.hijri.day} ${res.data.hijri.month.en}, ${res.data.hijri.year}${res.data.hijri.designation.abbreviated}`;
                        shortHijrahDate = res.data.hijri.date.replaceAll("-", "/") + res.data.hijri.designation.abbreviated;
                    }
                }
            } catch (e) {
                console.error("Error retrieving Hijrah Date:", e);
                hijrahDate = "Hijri date unavailable";
                shortHijrahDate = "Hijri date unavailable";
            }
        }
        
        loaded = true;
    });
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
                        For all musollahs at OAU, Ile-Ife.
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
                        {#if formattedUpdatedAt}
                            <div class="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                                <Clock class="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                <p class="text-primary-700 dark:text-primary-300 font-tertiary text-xs">
                                    Updated: {formattedUpdatedAt}
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Prayer Times Grid with staggered animation -->
        {#if hasPrayerTimes}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {#each prayerData as prayer, index}
                <div class="h-full" in:fly={{ y: 20, duration: 400, delay: 200 + (index * 100) }}>
                    <PrayerTimeCard 
                        prayerName={prayer.name}
                        adhanTime={prayer.adhan}
                        iqamahTime={prayer.iqamah}
                        background={prayer.background}
                        isUpcoming={upcoming_solat === index}
                        gradientColor={prayer.color}
                        icon={prayer.icon}
                    />
                </div>
            {/each}
        </div>

		<!-- Friday Prayer Notice with glassmorphism -->
		{#if apiPrayerTimes?.jumuah}
		<div class="flex justify-center items-center w-full">
			<div class="backdrop-blur-xl bg-gradient-to-r from-primary-600/80 to-primary-800/80 text-white rounded-xl border border-white/20 p-5 font-tertiary text-sm shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
				<div class="flex items-center justify-center gap-3">
					<div class="bg-white/20 p-2 rounded-full">
						<Clock class="h-5 w-5" />
					</div>
					<span>Jumu'ah: Khutbah {formatTime(apiPrayerTimes.jumuah.adhan)},
						Salah {formatTime(apiPrayerTimes.jumuah.iqamah)}</span>
				</div>
			</div>
		</div>
		{/if}
        {:else}
        <!-- Empty state when API is unreachable -->
        <div class="text-center py-12">
            <Clock class="h-12 w-12 text-primary-300 mx-auto mb-4" />
            <p class="text-primary-600 font-secondary text-lg">Prayer times are currently unavailable.</p>
            <p class="text-primary-400 font-tertiary text-sm mt-1">Please check back later or contact the secretariat.</p>
        </div>
        {/if}

        <!-- Mosque & Musollah Finder (compact accordion) -->
        <div class="backdrop-blur-xl bg-white/30 dark:bg-black/30 rounded-2xl shadow-xl border border-white/20 p-5 sm:p-6">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    <MapPin class="h-5 w-5 text-primary-700 dark:text-primary-300" />
                    <h3 class="font-secondary font-semibold text-primary-800 dark:text-primary-200 text-base sm:text-lg">
                        Mosque & Musollah Finder
                    </h3>
                </div>
                {#if mosqueList.length > 0}
                    <span class="text-xs font-tertiary text-primary-600 dark:text-primary-400">
                        {mosqueList.length} locations
                    </span>
                {/if}
            </div>
            {#if mosqueList.length > 0}
                <p class="flex items-center gap-1.5 text-[11px] sm:text-xs font-tertiary text-primary-600 dark:text-primary-300 mb-3">
                    <MousePointerClick class="w-3.5 h-3.5 shrink-0" />
                    Tap a photo to view details & photos
                </p>
            {/if}

            {#if mosqueList.length > 0}
                <!-- Horizontal thumbnail strip -->
                <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-1 px-1">
                    {#each mosqueList as mosque (mosque.id)}
                        <button
                            type="button"
                            onclick={() => toggleMosque(mosque.id)}
                            aria-expanded={expandedMosqueId === mosque.id}
                            aria-label={`Toggle details for ${mosque.label}`}
                            class="snap-start shrink-0 w-28 rounded-xl overflow-hidden border-2 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 {expandedMosqueId === mosque.id ? 'border-primary-600 ring-2 ring-primary-300 scale-[1.02] shadow-lg' : 'border-white/30 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500'}"
                        >
                            <div class="relative h-24">
                                <img
                                    src={mosque.images?.[0] || "/images/placeholder.webp"}
                                    alt={mosque.label}
                                    loading="lazy"
                                    class="w-full h-full object-cover"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <span class="absolute bottom-1.5 left-2 right-2 text-white text-[11px] font-medium truncate drop-shadow">
                                    {mosque.label}
                                </span>
                            </div>
                        </button>
                    {/each}
                </div>

                <!-- Expanded accordion panel -->
                {#if expandedMosqueObject}
                    {#key expandedMosqueId}
                    <div class="mt-4 pt-4 border-t border-white/20 dark:border-white/10" in:fly={{ y: 10, duration: 250 }}>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="sm:w-2/5 shrink-0">
                                <img
                                    src={expandedMosqueObject.images?.[0] || "/images/placeholder.webp"}
                                    alt={expandedMosqueObject.label}
                                    loading="lazy"
                                    class="w-full h-40 sm:h-56 object-cover rounded-xl"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                    <div class="min-w-0">
                                        <h4 class="font-secondary font-semibold text-primary-900 dark:text-primary-100 text-base">
                                            {expandedMosqueObject.label}
                                        </h4>
                                        {#if expandedMosqueObject.address}
                                            <p class="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                                                <MapPinned class="w-3 h-3 shrink-0" />
                                                <span class="truncate min-w-0">{expandedMosqueObject.address}</span>
                                            </p>
                                        {/if}
                                    </div>
                                    {#if expandedMosqueObject.images && expandedMosqueObject.images.length > 1}
                                        <button
                                            type="button"
                                            onclick={() => handleBadgeClick(expandedMosqueObject.id)}
                                            class="text-xs font-semibold text-primary-700 dark:text-primary-300 hover:underline shrink-0 mt-1 inline-flex items-center gap-1"
                                        >
                                            View photos →
                                        </button>
                                    {/if}
                                </div>
                                {#if expandedMosqueObject.description}
                                    <p class="mt-3 text-sm text-primary-800/80 dark:text-primary-200/80 leading-relaxed">
                                        {expandedMosqueObject.description}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>
                    {/key}
                {/if}
            {:else}
                <p class="text-sm text-primary-600/70 dark:text-primary-300/70 font-tertiary">
                    Mosque and musollah locations coming soon.
                </p>
            {/if}
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
                        {#if selectedMosqueObject.images && selectedMosqueObject.images.length > 0}
                            <Carousel.Root plugins={[AutoplayModule({ delay: 3000, stopOnInteraction: true })]} class="w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg" bind:api={carouselAPI}>
                                <Carousel.Content>
                            {#each selectedMosqueObject.images as image, i}
                                        <Carousel.Item>
                                            <img src={image} alt={`${selectedMosqueObject.name || selectedMosqueObject.label} - Image ${i + 1}`} class="w-full h-80 object-cover rounded-lg" />
                                </Carousel.Item>
                            {/each}
                        </Carousel.Content>
                                {#if selectedMosqueObject.images.length > 1}
                                    <Carousel.Previous class="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                                    <Carousel.Next class="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                                {/if}
                    </Carousel.Root>
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