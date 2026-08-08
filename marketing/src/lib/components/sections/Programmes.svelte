<script>
	import { SquareArrowOutUpRight, MessageCircle } from "@lucide/svelte";
	import { BookOpenText, NotebookPen, Presentation, UsersRound } from '@lucide/svelte';
	import { Image } from '$lib/components/ui/image';
	import { slide, fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from "$app/state";

    let { 
    /**
     * @typedef {Object} Programme
     * @property {string} title
     * @property {string} text
     * @property {string} image
     * @property {string} alt
     * @property {string} href
     * 
    */
        programmes = page.data?.programmes || []
     } = $props();

    /** Shuffles an array in place using Fisher-Yates. @param {any[]} arr @returns {any[]} */
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    
    /** @type {Array<{title: string, text?: string, image?: string, alt?: string, href?: string, summary?: string, description?: string}>} */
    let displayedProgrammes = $state([]);
    let selectedEvent = $state(programmes[0]?.title ?? '');
    const selectedImage = $derived(displayedProgrammes.find((/** @type {any} */ p) => p.title === selectedEvent)?.image);

    let initialised = false;

    $effect(() => {
        if (Array.isArray(programmes) && programmes.length > 0) {
            if (!initialised) {
                initialised = true;
                displayedProgrammes = programmes.length > 1 ? shuffle(programmes) : programmes;
                selectedEvent = displayedProgrammes[0].title;
            } else if (!selectedEvent || !programmes.some((p) => p.title === selectedEvent)) {
                selectedEvent = programmes[0].title;
            }
        }
    });
    
    // For tab hover effects
    let hoveredTab = $state(null);
    
    // For image display
    let imageLoaded = $state(true);
    let imageVisible = $state(true);
    const currentDisplayedImage = $derived(selectedImage || '');

    // For parallax effect
    /** @type {HTMLElement | undefined} */
    let containerEl;
    let mouseX = $state(0);
    let mouseY = $state(0);
    
    /** @param {MouseEvent} e */
    function handleMouseMove(e) {
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
    }
    
    // Icon mapping for programmes
    /** @type {Record<string, any>} */
    const iconMap = {
        "Tutorials": BookOpenText,
        "Madrasah": NotebookPen,
        "Al-Usrah": Presentation,
        "Sisters' Circle": UsersRound
    };
    
    // Function to get the correct icon for a programme
    /** @param {string} title */
    function getIcon(title) {
        return iconMap[title] || BookOpenText;
    }
</script>

<div 
    role="button"
    tabindex="0"
    class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto"
    bind:this={containerEl}
    onmousemove={handleMouseMove}
>
    <div class="relative p-6 md:p-16 overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
        
        <!-- Grid -->
        <div class="relative z-10 flex flex-col lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div class="order-2 mb-10 lg:mb-0 lg:order-2 lg:col-span-6 lg:col-start-8">
                <h2
                    class="text-2xl text-neutral-800 font-bold sm:text-3xl font-primary relative inline-block"
                    in:fly={{ y: 20, duration: 800, delay: 200 }}
                >
                    Our Programmes
                    <span class="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-700 rounded-full"></span>
                </h2>

                <!-- Tab Navs -->
                <nav 
                    role="tablist"
                    aria-label="Programmes"
                    class="relative grid gap-4 mt-5 md:mt-10"
                    in:fly={{ y: 20, duration: 800, delay: 400 }}
                >
                    {#each displayedProgrammes as programme, i}
                    {@const Icon = getIcon(programme.title)}
                        <button 
                            type="button"
                            role="tab"
                            onclick={() => {
                                selectedEvent = programme.title;
                                hoveredTab = null;
                            }}
                            onmouseenter={() => hoveredTab = programme.title}
                            onmouseleave={() => hoveredTab = null}
                            class="relative text-start hover:bg-white/50 focus:outline-none focus:bg-white/50 p-4 md:p-5 rounded-xl transition-all duration-300 {selectedEvent === programme.title ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'}"
                            id={programme.title} 
                            aria-selected={selectedEvent === programme.title}
                            in:fly={{ y: 20, duration: 800, delay: 400 + (i * 100) }}
                        >
                            <span class="flex gap-x-6">
                                <Icon
                                    class="shrink-0 mt-2 size-6 md:size-7 transition-all duration-300 {selectedEvent === programme.title || hoveredTab === programme.title ? 'text-primary-700 scale-110' : 'text-neutral-800'} cursor-pointer"
                                />
                                <span class="grow">
                                    <span class="block text-lg font-semibold font-secondary transition-all duration-300 {selectedEvent === programme.title || hoveredTab === programme.title ? 'text-primary-700' : 'text-neutral-800'}">{programme.title}</span>
                                    {#if selectedEvent === programme.title}
                                        <span in:slide={{ duration: 300 }} out:slide={{ duration: 300 }} class="block mt-1 text-neutral-800 font-tertiary">{programme.text || programme.summary || programme.description || ''}</span>
                                    {/if}
                                </span>
                            </span>
                        </button>
                    {/each}

                    <button 
                        type="button"
                        onclick={() => {
                            goto('/programmes');
                        }}
                        class="relative text-start hover:bg-white/50 focus:outline-none focus:bg-white/50 p-4 md:p-5 rounded-xl transition-all duration-300 group"
                        in:fly={{ y: 20, duration: 800, delay: 400 + (programmes.length * 100) }}
                    >
                        <span class="flex gap-x-6">
                            <SquareArrowOutUpRight class="shrink-0 mt-2 size-6 md:size-7 text-neutral-800 group-hover:text-primary-700 group-hover:scale-110 transition-all duration-300 cursor-pointer"/>
                            <span class="grow">
                                <span class="block text-lg font-semibold text-neutral-800 group-hover:text-primary-700 transition-all duration-300">See More</span>
                            </span>
                        </span>
                    </button>

                    <a
                        href="https://wa.me/2347076412101?text=Hello%2C%20I%27d%20like%20to%20enquire%20about%20MSSN%20programmes."
                        target="_blank"
                        rel="noopener noreferrer"
                        class="relative text-start hover:bg-white/50 focus:outline-none focus:bg-white/50 p-4 md:p-5 rounded-xl transition-all duration-300 group"
                        in:fly={{ y: 20, duration: 800, delay: 400 + ((programmes.length + 1) * 100) }}
                    >
                        <span class="flex gap-x-6">
                            <MessageCircle class="shrink-0 mt-2 size-6 md:size-7 text-neutral-800 group-hover:text-primary-700 group-hover:scale-110 transition-all duration-300 cursor-pointer"/>
                            <span class="grow">
                                <span class="block text-lg font-semibold text-neutral-800 group-hover:text-primary-700 transition-all duration-300">Enquiry</span>
                            </span>
                        </span>
                    </a>
                </nav>
                <!-- End Tab Navs -->
            </div>
            <!-- End Col -->

            <div class="order-1 lg:order-1 lg:col-span-6">
                <div 
                    class="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/30 border border-white/20 shadow-xl p-2"
                    in:fly={{ x: -20, duration: 800, delay: 200 }}
                    style="transform: perspective(1000px) rotateY({(mouseX - 0.5) * -5}deg) rotateX({(mouseY - 0.5) * 5}deg);"
                >
                    <!-- Tab Content with enhanced transitions -->
                    <div>
                        <div role="tabpanel" aria-labelledby={selectedEvent}>
                            <div class="relative overflow-hidden rounded-lg">
                                {#key currentDisplayedImage}
                                    <div class="relative {imageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-500">
                                        <Image 
                                            loading="eager" 
                                            className="rounded-lg shadow-lg transform transition-transform duration-700 hover:scale-105"
                                            width={640}
                                            height={400}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                                            src={currentDisplayedImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                            alt={selectedEvent}
                                        />
                                        
                                        <!-- Glassmorphism overlay -->
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
                                            <div class="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-lg px-4 py-2 transform transition-all duration-500 translate-y-4 opacity-0 hover:translate-y-0 hover:opacity-100">
                                                <p class="text-white font-medium text-sm md:text-base">{selectedEvent} Programme</p>
                                            </div>
                                        </div>
                                    </div>
                                {/key}
                            </div>
                        </div>
                    </div>
                    <!-- End Tab Content -->
                </div>

                <!-- SVG Element with animation -->
                <div 
                    class="hidden absolute top-0 end-0 translate-x-20 md:block lg:translate-x-20 animate-float"
                    in:fade={{ duration: 1000, delay: 800 }}
                >
                    <svg class="w-16 h-auto text-primary-800" width="121" height="135" viewBox="0 0 121 135"
                         fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164" stroke="currentColor"
                              stroke-width="10" stroke-linecap="round"/>
                        <path d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5" stroke="currentColor"
                              stroke-width="10" stroke-linecap="round"/>
                        <path d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874" stroke="currentColor"
                              stroke-width="10" stroke-linecap="round"/>
                    </svg>
                </div>
                <!-- End SVG Element -->
            </div>
            <!-- End Col -->
        </div>
        <!-- End Grid -->

        <!-- Background Color with glassmorphism -->
        <div class="absolute inset-0 grid grid-cols-12 size-full">
            <div class="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100/70 backdrop-blur-sm w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full"></div>
        </div>
        <!-- End Background Color -->
    </div>
</div>

<style>
    /* Floating animation for SVG */
    @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-10px) rotate(1deg); }
    }
    
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
</style>