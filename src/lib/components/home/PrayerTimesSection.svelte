<script lang="ts">
    import { onMount } from 'svelte';
    import { prayerTimes as solahTimes, upcomingPrayer, formatTime } from '$lib/stores/prayerTimes';
    import { Badge } from '$lib/components/ui/badge';
    import { Clock, MapPin, Calendar, Moon, MapPinned } from '@lucide/svelte';
    import { mosques } from '$lib/stores/mosques';
    import PrayerTimeCard from './PrayerTimeCard.svelte';
    import { fade, fly } from 'svelte/transition';
    import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
    import AutoplayModule from 'embla-carousel-autoplay';
    
    // For date formatting
    function getFormattedDateVerbose() {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('default', {month: 'long'});
        const year = now.getFullYear();
        
        const suffix =
            day % 10 === 1 && day !== 11 ? 'st' :
            day % 10 === 2 && day !== 12 ? 'nd' :
            day % 10 === 3 && day !== 13 ? 'rd' :
            'th';
            
        return `${day}${suffix} ${month}, ${year}`;
    }
    
    function getFormattedDateVerboseShort() {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('default', {month: 'short'});
        const year = now.getFullYear();
        
        return `${day} ${month}, ${year}`;
    }
    
    // Hijri date state
    let hijrahDate = $state("");
    let shortHijrahDate = $state("");
    
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
            times: () => $solahTimes.subhi,
            color: 'from-indigo-500/80 to-purple-600/80',
            icon: '🌅'
        },
        { 
            name: 'Dhuhr', 
            background: '/images/noon.webp', 
            times: () => $solahTimes.dhuhr,
            color: 'from-amber-500/80 to-orange-600/80',
            icon: '☀️'
        },
        { 
            name: 'Asr', 
            background: '/images/evening.webp', 
            times: () => $solahTimes.asr,
            color: 'from-orange-400/80 to-rose-600/80',
            icon: '🌇'
        },
        { 
            name: 'Maghrib', 
            background: '/images/late-evening.webp', 
            times: () => $solahTimes.maghrib,
            color: 'from-rose-500/80 to-purple-700/80',
            icon: '🌆'
        },
        { 
            name: 'Isha', 
            background: '/images/night.webp', 
            times: () => $solahTimes.isha,
            color: 'from-blue-600/80 to-indigo-900/80',
            icon: '🌙'
        }
    ];
    
    // For mosque modal functionality
    let selectedMosque = $state("");
    let showMosqueModal = $state(false);
    let loaded = $state(false);
    
    // Get the selected mosque object
    const selectedMosqueObject = $derived($mosques.find(mosque => mosque.id === selectedMosque));
    
    onMount(async () => {
        try {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); 
            const year = now.getFullYear();
            
            // Format the date as DD-MM-YYYY for API
            const formattedDate = `${day}-${month}-${year}`;
            
            const req = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
            
            if (!req.ok) throw new Error("Bad Response");
            
            const res = await req.json();
            
            if (!res || res.code !== 200) throw new Error("Invalid response format");
            
            hijrahDate = `${res.data.hijri.day} ${res.data.hijri.month.en}, ${res.data.hijri.year}${res.data.hijri.designation.abbreviated}`;
            shortHijrahDate = res.data.hijri.date.replaceAll("-", "/") + res.data.hijri.designation.abbreviated;
        } catch (e) {
            console.error("Error retrieving Hijrah Date:", e?.message);
            // Fallback values
            hijrahDate = "Hijri date unavailable";
            shortHijrahDate = "Hijri date unavailable";
        }
        
        loaded = true;
    });

    let Sheet = null;
    let Carousel = null;
    let Dialog = null;
    let sheetAndCarouselLoaded = false;
    let dialogLoaded = false;
    let isLargeScreen = false;

    function checkScreen() {
        isLargeScreen = window.matchMedia('(min-width: 640px)').matches;
    }

    onMount(() => {
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    });

    $effect(() => {
        if (showMosqueModal) {
            if (isLargeScreen && !dialogLoaded) {
                import('$lib/components/ui/dialog/index.js').then((mod) => {
                    Dialog = mod;
                dialogLoaded = true;
            });
        } else if (!isLargeScreen && !sheetAndCarouselLoaded) {
            Promise.all([
                import('$lib/components/ui/sheet/index.js'),
                import('$lib/components/ui/carousel/index.js')
            ]).then(([sheetMod, carouselMod]) => {
                Sheet = sheetMod;
                Carousel = carouselMod;
                sheetAndCarouselLoaded = true;
            });
        }
    }});
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
                    <span>Friday Sermon starts at 1:30 PM and Prayer commences at 2:00 PM</span>
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
                {#each $mosques as mosque}
                    <Badge 
                        class="cursor-pointer transition-all backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 hover:bg-primary-100/80 hover:text-primary-900 px-4 py-2 text-sm" 
                        variant="outline" 
                        onclick={async () => {
                            selectedMosque = mosque.id;
                            if (isLargeScreen) {
                                if (!dialogLoaded) {
                                    const mod = await import('$lib/components/ui/dialog/index.js');
                                    Dialog = mod;
                                    dialogLoaded = true;
                                }
                                if (!Carousel) {
                                    const carouselMod = await import('$lib/components/ui/carousel/index.js');
                                    Carousel = carouselMod;
                                }
                            } else {
                                if (!sheetAndCarouselLoaded) {
                                    const [sheetMod, carouselMod] = await Promise.all([
                                        import('$lib/components/ui/sheet/index.js'),
                                        import('$lib/components/ui/carousel/index.js')
                                    ]);
                                    Sheet = sheetMod;
                                    Carousel = carouselMod;
                                    sheetAndCarouselLoaded = true;
                                }
                            }
                            showMosqueModal = true;
                        }}
                    >
                        {mosque.label}
                    </Badge>
                {/each}
            </div>
        </div>
    </div>
    {/if}

    <!-- Mosque Modal Implementation with Enhanced Design -->
{#if showMosqueModal && selectedMosqueObject}
{#if isLargeScreen && dialogLoaded && Carousel}
    <Dialog.Root bind:open={showMosqueModal}>
        <Dialog.Content class="sm:max-w-[650px] rounded-xl border border-primary-100 shadow-xl backdrop-blur-sm bg-white/95 p-0 overflow-hidden">
            <!-- Header with gradient background -->
            <div class="relative">
                <!-- Background gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-b from-primary-800/90 to-primary-700/90 h-24"></div>
                
                <Dialog.Header class="relative z-10 px-6 pt-6 pb-12">
                    <Dialog.Title class="font-primary text-white text-2xl font-bold">{selectedMosqueObject.label}</Dialog.Title>
                    <Dialog.Description class="font-tertiary text-white/90 text-sm flex items-center mt-1">
                        <MapPin class="inline-block mr-1 h-3.5 w-3.5" />
                        {selectedMosqueObject.address}
                    </Dialog.Description>
                </Dialog.Header>
            </div>
            
            <!-- Carousel positioned to overlap the header -->
            <div class="relative -mt-8 px-4">
                <div class="rounded-xl overflow-hidden shadow-lg border border-white/20">
                    <Carousel.Root
                        plugins={[AutoplayModule({ delay: 5000 })]}
                        class="w-full"
                        opts={{ align: "center", loop: true }}
                    >
                        <Carousel.Content class="w-full">
                            {#each selectedMosqueObject.images as image, i}
                                <Carousel.Item class="basis-full">
                                    <div class="relative group">
                                        <img 
                                            class="h-[40dvh] sm:h-[50dvh] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={image || "/placeholder.svg"}
                                            alt={`${selectedMosqueObject.label} ${i + 1}`}
                                            loading="lazy"
                                        />
                                        <!-- Image counter badge -->
                                        <div class="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                            {i + 1} / {selectedMosqueObject.images.length}
                                        </div>
                                    </div>
                                </Carousel.Item>
                            {/each}
                        </Carousel.Content>
                        
                        <!-- Enhanced carousel controls -->
                        <Carousel.Previous class="left-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary-700 transition-colors" />
                        <Carousel.Next class="right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-primary-700 transition-colors" />
                        
                        <!-- Carousel indicators -->
                        <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
                            {#each selectedMosqueObject.images as _, i}
                                <button 
                                    class="w-2 h-2 rounded-full transition-all duration-300 {Carousel.api?.selectedScrollSnap() === i ? 'bg-white w-4' : 'bg-white/50'}"
                                    onclick={() => Carousel.api?.scrollTo(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                ></button>
                            {/each}
                        </div>
                    </Carousel.Root>
                </div>
            </div>
            
            <!-- Additional mosque information -->
            <div class="px-6 py-4">
                {#if selectedMosqueObject.description}
                    <p class="text-gray-700 text-sm leading-relaxed mb-4">{selectedMosqueObject.description}</p>
                {/if}
                
                <!-- Prayer times if available -->
                {#if selectedMosqueObject.prayerTimes}
                    <div class="bg-primary-50/50 rounded-lg p-3 mb-4">
                        <h3 class="text-sm font-medium text-primary-800 mb-2">Prayer Times</h3>
                        <div class="grid grid-cols-5 gap-2 text-xs">
                            {#each Object.entries(selectedMosqueObject.prayerTimes) as [prayer, time]}
                                <div class="text-center">
                                    <div class="font-medium text-primary-700">{prayer}</div>
                                    <div class="text-gray-600">{time}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
            
            <Dialog.Footer class="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-100">
                <div class="flex items-center text-xs text-gray-500">
                    <Clock class="h-3.5 w-3.5 mr-1" />
                    Open for all five daily prayers
                </div>
                
                <div class="flex gap-2">
                    <Dialog.Close class={buttonVariants({ variant: "outline", size: "sm" })}>
                        Close
                    </Dialog.Close>
                    {#if selectedMosqueObject.url}
                        <Button 
                            class="bg-primary-800 hover:bg-primary-700 text-white transition-colors"
                            size="sm"
                            onclick={() => window.open(selectedMosqueObject.url, '_blank')}
                        >
                            <MapPinned class="size-4 mr-1.5" />
                            View on Maps
                        </Button>
                    {/if}
                </div>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
{:else if !isLargeScreen && sheetAndCarouselLoaded}
    <Sheet.Root bind:open={showMosqueModal}>
        <Sheet.Content class="scrollbar-hide rounded-t-xl border-t border-primary-100 shadow-xl backdrop-blur-sm bg-white/95" onCloseAutoFocus={() => {}} side="bottom">
            <!-- Pull indicator -->
            <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 mt-2"></div>
            
            <!-- Header with gradient background -->
            <div class="relative">
                <!-- Background gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-r from-primary-800/90 to-primary-700/90 h-20 rounded-t-xl"></div>
                
                <Sheet.Header class="relative z-10 px-4 pt-4 pb-10">
                    <Sheet.Title class="font-primary text-white text-xl font-bold">{selectedMosqueObject.label}</Sheet.Title>
                    <Sheet.Description class="font-tertiary text-white/90 text-xs flex items-center mt-1">
                        <MapPin class="inline-block mr-1 h-3.5 w-3.5" />
                        {selectedMosqueObject.address}
                    </Sheet.Description>
                </Sheet.Header>
            </div>
            
            <!-- Carousel positioned to overlap the header -->
            <div class="relative -mt-6 px-4">
                <div class="rounded-xl overflow-hidden shadow-lg border border-white/20">
                    <Carousel.Root
                        plugins={[AutoplayModule({ delay: 5000 })]}
                        class="w-full"
                        opts={{ align: "center", loop: true }}
                    >
                        <Carousel.Content class="w-full">
                            {#each selectedMosqueObject.images as image, i}
                                <Carousel.Item class="basis-full">
                                    <div class="relative">
                                        <img 
                                            class="h-[35dvh] w-full object-cover"
                                            src={image || "/placeholder.svg"}
                                            alt={`${selectedMosqueObject.label} ${i + 1}`}
                                            loading="lazy"
                                        />
                                        <!-- Image counter badge -->
                                        <div class="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                            {i + 1} / {selectedMosqueObject.images.length}
                                        </div>
                                    </div>
                                </Carousel.Item>
                            {/each}
                        </Carousel.Content>
                        
                        <!-- Enhanced carousel controls -->
                        <Carousel.Previous class="left-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm text-white" />
                        <Carousel.Next class="right-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm text-white" />
                        
                        <!-- Carousel indicators -->
                        <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
                            {#each selectedMosqueObject.images as _, i}
                                <button 
                                    class="w-2 h-2 rounded-full transition-all duration-300 {Carousel.api?.selectedScrollSnap() === i ? 'bg-white w-4' : 'bg-white/50'}"
                                    onclick={() => Carousel.api?.scrollTo(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                ></button>
                            {/each}
                        </div>
                    </Carousel.Root>
                </div>
            </div>
            
            <!-- Additional mosque information -->
            <div class="px-4 py-4">
                {#if selectedMosqueObject.description}
                    <p class="text-gray-700 text-sm leading-relaxed mb-4">{selectedMosqueObject.description}</p>
                {/if}
                
                <!-- Prayer times if available -->
                {#if selectedMosqueObject.prayerTimes}
                    <div class="bg-primary-50/50 rounded-lg p-3 mb-4">
                        <h3 class="text-sm font-medium text-primary-800 mb-2">Prayer Times</h3>
                        <div class="grid grid-cols-5 gap-2 text-xs">
                            {#each Object.entries(selectedMosqueObject.prayerTimes) as [prayer, time]}
                                <div class="text-center">
                                    <div class="font-medium text-primary-700">{prayer}</div>
                                    <div class="text-gray-600">{time}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
            
            <Sheet.Footer class="flex-col gap-3 px-4 pb-8">
                <div class="flex items-center text-xs text-gray-500 mb-3 justify-center">
                    <Clock class="h-3.5 w-3.5 mr-1" />
                    Open for all five daily prayers
                </div>
                
                <div class="flex gap-2 w-full">
                    <Sheet.Close class={buttonVariants({ variant: "outline", size: "default", class: "flex-1" })}>
                        Close
                    </Sheet.Close>
                    {#if selectedMosqueObject.url}
                        <Button 
                            class="bg-primary-800 hover:bg-primary-700 text-white flex-1"
                            onclick={() => window.open(selectedMosqueObject.url, '_blank')}
                        >
                            <MapPinned class="size-4 mr-1.5" />
                            View on Maps
                        </Button>
                    {/if}
                </div>
            </Sheet.Footer>
        </Sheet.Content>
    </Sheet.Root>
{/if}
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