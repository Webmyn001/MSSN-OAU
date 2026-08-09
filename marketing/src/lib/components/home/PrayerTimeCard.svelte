<script>
    import { formatTime } from '$lib/stores/prayerTimes';
    import { scale, fade } from 'svelte/transition';

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
    
    /** @param {any} val */
    function toTime(val) {
        if (val == null || val === '') return null;
        if (typeof val === 'string' && /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(val.trim())) return val.trim();
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const n = Number(val);
            if (!isNaN(n) && n > 0) return n;
            const d = Date.parse(val);
            if (!isNaN(d)) return d;
        }
        return null;
    }

    const adhan = $derived(formatTime(toTime(adhanTime)));
    const iqamah = $derived(formatTime(toTime(iqamahTime)));
</script>

<div
    role="button"
    tabindex="0"
    class="relative group overflow-hidden rounded-2xl h-full w-full transition-all duration-300 hover:-translate-y-1 {isUpcoming ? 'shadow-xl ring-2 ring-amber-400/70 shadow-amber-500/20' : 'shadow-lg hover:shadow-2xl'}"
>
    <!-- Background -->
    <div 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style="background-image: url('{background}');"
    >
        <div class="absolute inset-0 bg-gradient-to-br {gradientColor} opacity-80"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25"></div>
    </div>

    <!-- Upcoming top glow line -->
    {#if isUpcoming}
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 z-20" in:fade={{ duration: 300 }}></div>
    {/if}

    <!-- Content -->
    <div class="relative z-10 flex flex-col justify-between gap-3 p-4 sm:p-5 h-full min-h-[132px]">
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="shrink-0 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-base shadow-inner" in:scale={{ duration: 300, delay: 150 }}>
                    {icon}
                </div>
                <h3 class="font-primary font-bold text-white text-sm sm:text-lg leading-tight drop-shadow truncate">
                    {prayerName}
                </h3>
            </div>
            {#if isUpcoming}
                <span class="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                    <span class="relative flex h-1 w-1">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60"></span>
                        <span class="relative inline-flex rounded-full h-1 w-1 bg-black"></span>
                    </span>
                    Next
                </span>
            {/if}
        </div>

        <!-- Times -->
        <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
            <div class="rounded-xl bg-black/35 backdrop-blur-sm border border-white/15 px-2 py-1.5 sm:px-2.5 sm:py-2 text-center min-w-0">
                <p class="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-white/60 truncate">Adhan</p>
                <p class="text-white font-primary font-semibold text-xs sm:text-[15px] tabular-nums whitespace-nowrap">{adhan}</p>
            </div>
            <div class="rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 px-2 py-1.5 sm:px-2.5 sm:py-2 text-center min-w-0 {isUpcoming ? 'bg-amber-300/25 border-amber-300/40' : ''}">
                <p class="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-white/60 truncate">Iqamah</p>
                <p class="text-white font-primary font-semibold text-xs sm:text-[15px] tabular-nums whitespace-nowrap">{iqamah}</p>
            </div>
        </div>
    </div>
</div>
