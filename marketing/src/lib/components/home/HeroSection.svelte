<script>
    import { Button } from '$lib/components/ui/button';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import { spring } from 'svelte/motion';
    
    // For animated text reveal
    let visible = $state(true);
    
    onMount(() => {
        // Intro transitions replay after hydration
        visible = true;
    });
</script>

<section 
    class="relative py-24 md:py-32 w-full overflow-hidden"
>
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <!-- Animated soft gradient wash -->
        <div class="absolute -top-40 -right-40 size-[28rem] rounded-full bg-[#EBB957]/15 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-[#026d3b]/10 blur-3xl"></div>
        <!-- Subtle pattern overlay -->
        <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.03] mix-blend-overlay"></div>
    </div>

    <div class="container relative mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        <!-- Hero heading with enhanced text effect -->
        {#if visible}
        <div in:fade={{ duration: 1000, delay: 200 }} class="relative">
            <span
                in:fly={{ y: 30, duration: 800, delay: 100 }}
                class="inline-flex items-center gap-2 mb-6 rounded-full border border-[#EBB957]/30 bg-[#EBB957]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-primary-800 backdrop-blur-sm"
            >
                <span class="size-2 rounded-full bg-[#EBB957] animate-pulse"></span>
                Muslim Students' Society of Nigeria, OAU Branch
            </span>
            <h1 class="text-primary-900 oau my-6 text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl text-center tracking-tight" id="hero-text">
                <span in:fly={{ y: 30, duration: 800, delay: 300 }}>We are Great</span>
                <span class="inline-block relative oau mt-2">
                    <span class="relative z-10 yoruba text-[#28145B] inline-block" in:fly={{ y: 30, duration: 800, delay: 600 }}>
                        Ifẹ̀'s
                        <svg
                            class="absolute left-0 bottom-0 w-full opacity-70"
                            style="height: 10px; transform: translateY(7px);"
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M2,5 Q10,2.5 25,5.2 Q40,3 50,5.5 T73,4.8 T98,5"
                                stroke="#EBB957"
                                stroke-width="2.5"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </span>
                    <span class="absolute left-[-2px] top-0 z-0 yoruba text-[#EBB957] blur-[0.5px]" in:fly={{ y: 30, duration: 800, delay: 600 }}>Ìfẹ́'s</span>
                </span>
            </h1>
            
            <!-- Enhanced description with backdrop blur -->
            <div 
                in:fly={{ y: 30, duration: 800, delay: 900 }}
                class="relative mb-10 max-w-3xl mx-auto"
            >
                <p class="text-zinc-600 lg:text-xl xl:text-2xl leading-relaxed">
                    community of diverse, forward-thinking and progressive muslim men and women united in faith.
                </p>
                <div class="absolute -inset-4 -z-10 bg-gradient-to-r from-[#EBB957]/5 via-[#28145B]/5 to-[#EBB957]/5 rounded-2xl blur-xl opacity-70"></div>
            </div>
        </div>
        {/if}
        
        <!-- Blood cell-like particles -->
        {#await import("$lib/components/Sparkles/Sparkles.svelte") then S}
            {@const Sparkles = S.default}
            <div in:fade={{ duration: 1000, delay: 1200 }} class="w-full relative">
                <Sparkles
                    minSize={8}
                    maxSize={16}
                    particleDensity={60}
                    className="w-full mx-auto h-[25dvh]"
                    particleColor="#026d3b"
                    secondaryColor="#EBB957"
                    speed={12}
                />
            </div>
        {/await}
        
        <!-- Enhanced buttons with glassmorphism -->
        {#if visible}
        <div 
            in:fly={{ y: 30, duration: 800, delay: 1500 }}
            class="flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4 mt-4 relative z-10"
        >
            <Button 
                variant="default"
                size="lg"
                onclick={() => goto('/about')}
                class="w-full sm:w-auto hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
                About Us
            </Button>
            <Button 
                variant="outline"
                size="lg"
                onclick={() => goto('our-excos')}
                class="w-full sm:w-auto hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white/80 backdrop-blur-sm hover:bg-[#EBB957]/10 text-primary-900 border-[#EBB957]/30"
            >
                Our Excos
            </Button>
        </div>
        {/if}
    </div>
    
    <!-- Improved image gallery with natural layout -->
    <div class="mt-16 sm:mt-24 md:mt-32 aspect-video overflow-hidden md:aspect-auto md:h-[480px] relative">
        {#if visible}
        <div 
            in:fade={{ duration: 1500, delay: 1800 }}
            class="relative mx-auto flex max-w-4xl flex-col"
        >
            <!-- Main mosque image with enhanced styling -->
            <div 
                class="container mx-auto px-4 sm:px-6 relative"
                in:scale={{ duration: 1000, delay: 2000 }}
            >
                <!-- Profile images in a more natural arrangement -->
                <div class="absolute inset-0 pointer-events-none">
                    <!-- Left side profile images -->
                    <div class="absolute left-[-80px] top-[10%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/man_1.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-16 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <img 
                                src="/images/woman_1.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-14 rounded-full object-cover border-2 border-white shadow-md absolute -bottom-6 -right-4"
                            />
                        </div>
                    </div>
                    
                    <div class="absolute left-[-120px] top-[40%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/man_2.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-14 rounded-full object-cover border-2 border-white shadow-md"
                            />
                        </div>
                    </div>
                    
                    <div class="absolute left-[-60px] bottom-[15%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/woman_2.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-16 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <img 
                                src="/images/man_3.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-12 rounded-full object-cover border-2 border-white shadow-md absolute -top-8 -right-2"
                            />
                        </div>
                    </div>
                    
                    <!-- Right side profile images -->
                    <div class="absolute right-[-80px] top-[15%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/woman_3.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-16 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <img 
                                src="/images/man_4.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-14 rounded-full object-cover border-2 border-white shadow-md absolute -bottom-4 -left-6"
                            />
                        </div>
                    </div>
                    
                    <div class="absolute right-[-100px] top-[50%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/woman_4.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-14 rounded-full object-cover border-2 border-white shadow-md"
                            />
                        </div>
                    </div>
                    
                    <div class="absolute right-[-70px] bottom-[10%] hidden md:block">
                        <div class="relative">
                            <img 
                                src="/images/man_5.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-16 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <img 
                                src="/images/woman_5.webp" 
                                alt="community member"
                                loading="lazy"                                                                class="size-12 rounded-full object-cover border-2 border-white shadow-md absolute -top-6 -left-4"
                            />
                        </div>
                    </div>
                </div>
                
                <div class="relative rounded-lg sm:rounded-xl overflow-hidden group">
                    <!-- Decorative border -->
                    <div class="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-[#EBB957]/20 z-10 pointer-events-none"></div>
                    
                    <!-- Glassmorphism overlay -->
                    <div class="absolute inset-0 bg-gradient-to-b from-[#28145B]/5 to-[#EBB957]/5 mix-blend-overlay opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <!-- Image with subtle hover effect -->
                    <img
                        src="/images/bg-1.webp"
                        loading="eager"
                        fetchpriority="high"
                        alt="central mosque of unity"
                        class="mt-2 flex aspect-[16/9] min-h-[300px] max-h-[600px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    <!-- Caption with proper design system styling -->
                    <div class="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto backdrop-blur-md bg-white/30 border border-white/30 rounded-lg px-4 py-2 transform transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
                        <p class="text-[#28145B] font-medium text-sm md:text-base">Central Mosque of Unity, OAU Ilé-Ifẹ̀</p>
                    </div>
                </div>
            </div>
        </div>
        {/if}
    </div>
</section>

<style>
    .yoruba {
        font-family: "Charis SIL", sans-serif;
    }

    /* charis-sil-latin-400-normal */
    @font-face {
        font-family: 'Charis SIL';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff) format('woff');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    .oau {
        cursor: url('/oau-logo.png') 32 32, auto;
    }
</style>