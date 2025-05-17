<script>
    import { Clock } from '@lucide/svelte';
    import { formatTime } from '$lib/stores/prayerTimes';
    import { fly, scale, fade } from 'svelte/transition';
    import { spring } from 'svelte/motion';
    import { onMount, onDestroy } from 'svelte';

    // Modern props declaration
    /**
     * @typedef {Object} PrayerTimeCardProps
     * @property {string} prayerName
     * @property {string | number | Date} adhanTime
     * @property {string | number | Date} iqamahTime
     * @property {string} background
     * @property {boolean} [isUpcoming]
     * @property {string} [gradientColor]
     * @property {string} [icon]
     */
    
    /** @type {PrayerTimeCardProps} */
    let { 
        prayerName = '', 
        adhanTime = '', 
        iqamahTime = '', 
        background = '', 
        isUpcoming = false, 
        gradientColor = 'from-blue-500/80 to-purple-600/80', 
        icon = '🕌' 
    } = $props();
    
    // Spring animation for hover effect
    const hovered = spring(1);
    function handleMouseenter() {
        hovered.set(1.05);
    }
    function handleMouseleave() {
        hovered.set(1);
    }
    
    // For the circular progress indicator
    let progress = $state(0);
    let interval;
    
    onMount(() => {
        if (isUpcoming) {
            interval = setInterval(() => {
                progress = (progress + 1) % 100;
            }, 1000);
        }
    });
    onDestroy(() => {
        if (interval) clearInterval(interval);
    });

    // Helper to ensure formatTime gets a number or Date
    /** @param {any} val */
    function toTime(val) {
        if (typeof val === 'string') {
            const n = Number(val);
            if (!isNaN(n)) return n;
            const d = Date.parse(val);
            if (!isNaN(d)) return new Date(d);
            return undefined;
        }
        return val;
    }

    // Use $derived for cardClass in runes mode
    const cardClass = $derived(() => `relative overflow-hidden rounded-xl shadow-xl w-full ${isUpcoming ? 'min-h-64 sm:min-h-full' : 'min-h-48 sm:min-h-full'}`);
</script>

<div
    role="button"
    tabindex="0"
    class={cardClass}
    style="transform: scale({$hovered}); {isUpcoming ? 'z-index: 10;' : ''}"
    onmouseenter={handleMouseenter}
    onmouseleave={handleMouseleave}
>
    <div 
        class="aspect-square sm:aspect-auto sm:h-full flex flex-col justify-center items-center p-6 relative"
    >
        <!-- Background Image with Overlay -->
        <div 
            class="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
            style="background-image: url('{background}');"
        >
            <!-- Gradient overlay with glassmorphism (reduced opacity) -->
            <div class="absolute inset-0 bg-gradient-to-br {gradientColor} opacity-60 backdrop-blur-[2px]"></div>
            
            <!-- Glass panel effect (lower opacity) -->
            <div class="absolute inset-0 backdrop-blur-sm opacity-10"></div>
            
            <!-- Overlay: more transparent, closer to black for both states -->
            <div class={isUpcoming ? 'absolute inset-0 bg-black/20' : 'absolute inset-0 bg-black/70'}></div>
            
            <!-- Light reflection effect (removed for more visibility) -->
            <div class="absolute -top-1/2 -right-1/2 w-full h-full bg-white/20 rotate-45 transform-gpu"></div>
        </div>
        
        <!-- Content with glassmorphism -->
        <div class="z-10 flex flex-col items-center gap-4 text-center w-full">
            <!-- Prayer icon -->
            <div class="text-3xl mb-1" in:scale={{ duration: 400, delay: 300 }}>
                {icon}
            </div>
            
            <!-- Prayer name -->
            <h2 class="font-secondary font-bold text-white text-2xl drop-shadow-md">
                {prayerName}
            </h2>

            <!-- Time display with glassmorphism -->
            <div 
                class="backdrop-blur-xl bg-white/30 border border-white/40 rounded-full px-2 py-1 w-auto min-w-0 max-w-[150px] transition-all duration-300 hover:bg-white/40 group text-xs overflow-hidden text-ellipsis whitespace-nowrap"
            >
                <div class="flex items-center justify-center gap-1 min-w-0">
                    <Clock class="shrink-0 size-3 text-white group-hover:text-primary-900 transition-colors"/>
                    <span class="whitespace-nowrap font-medium font-primary text-white group-hover:text-primary-900 transition-colors text-xs overflow-hidden text-ellipsis block min-w-0">
                        {formatTime(toTime(adhanTime))} • {formatTime(toTime(iqamahTime))}
                    </span>
                </div>
            </div>
            
        </div>
    </div>
    <!-- Upcoming prayer indicator -->
    {#if isUpcoming}
        <div class="absolute top-2 right-2" in:scale={{ duration: 400, delay: 400 }}>
            <!-- Circular progress indicator -->
            <div class="relative w-16 h-16">
                <svg class="w-full h-full" viewBox="0 0 100 100">
                    <!-- Background circle -->
                    <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.3)" 
                        stroke-width="8"
                    />
                    
                    <!-- Progress circle -->
                    <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="white" 
                        stroke-width="8"
                        stroke-dasharray="251.2" 
                        stroke-dashoffset={251.2 - (251.2 * progress / 100)}
                        transform="rotate(-90 50 50)"
                        stroke-linecap="round"
                    />
                    
                    <!-- Center text -->
                    <text 
                        x="50" y="55" 
                        text-anchor="middle" 
                        fill="white" 
                        font-size="10"
                        font-weight="bold"
                    >
                        NEXT
                    </text>
                </svg>
            </div>
        </div>
        
        <!-- Pulsing effect for upcoming prayer -->
        <div 
            class="absolute inset-0 border-2 border-white/50 rounded-xl animate-pulse"
            in:fade={{ duration: 1000, delay: 500 }}
        ></div>
    {/if}
</div>

<style>
    /* Custom animations */
    @keyframes pulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    /* Enhance hover transitions */
    div {
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
</style>