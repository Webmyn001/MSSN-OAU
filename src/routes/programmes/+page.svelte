<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { fly, fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { MetaTags } from "svelte-meta-tags";
    import * as Dialog from '$lib/components/ui/dialog';
    import * as Sheet from '$lib/components/ui/sheet';
    import { Button } from '$lib/components/ui/button';
    import { Loader2, X, ChevronRight, Info } from '@lucide/svelte';
    import { browser } from '$app/environment';
    
    let { data } = $props();
    
    /** @type {Array} */
    let programmes = $state([]);
    let visible = $state(false);
    let hoveredProgramme = $state(null);
    let selectedProgramme = $state(null);
    let isLoading = $state(false);
    let isDialogOpen = $state(false);
    let isSheetOpen = $state(false);
    let isLargeScreen = $state(true);
    let programmeDetails = $state(null);
    
    onMount(() => {
        visible = true;
        
        // Check if data.programmes is available
        if (data.programmes && data.programmes.length > 0) {
            programmes = data.programmes;
            console.log('Using API data:', programmes.length, 'programmes loaded');
        } else {
            // No fallback data, just keep programmes empty
            console.warn('API data not available, showing empty state');
            programmes = [];
        }
        
        console.log('Final programmes data:', programmes);
        
        if (browser) {
            isLargeScreen = window.innerWidth >= 768;
            
            const handleResize = () => {
                isLargeScreen = window.innerWidth >= 768;
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    });

    function openProgrammeDetails(programme) {
        selectedProgramme = programme;
        
        // Show dialog or sheet based on screen size
        if (isLargeScreen) {
            isDialogOpen = true;
        } else {
            isSheetOpen = true;
        }
        
        // Set loading state
        isLoading = true;
        
        // Simulate fetching details (in a real app, you'd fetch this data)
        // Since we're not actually fetching, just use the programme data directly
        setTimeout(() => {
            programmeDetails = {
                ...programme,
                description: programme.description || programme.text,
                schedule: programme.schedule || [],
                coordinators: programme.coordinators || [],
                benefits: programme.benefits || []
            };
            isLoading = false;
        }, 500);
    }
    
    function closeProgrammeDetails() {
        if (isLargeScreen) {
            isDialogOpen = false;
        } else {
            isSheetOpen = false;
        }
        
        setTimeout(() => {
            selectedProgramme = null;
            programmeDetails = null;
        }, 300);
    }
    $inspect(programmes)
</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Programmes"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'Our Programmes | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'Website screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<!-- End Meta Tags -->

<PageHeader>
    Our Programmes
</PageHeader>

<!-- Programmes Section with enhanced styling -->
<section class="py-6 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="mx-auto max-w-5xl space-y-16 px-6 relative z-10">
        {#if visible}
            {#if programmes.length > 0}
                <div 
                    class="relative mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    in:fly={{ y: 30, duration: 800, delay: 200 }}
                >
                    {#each programmes as programme, i}
                        <!-- Enhanced Programme Card -->
                        <div 
                            role="button"
                            tabindex="0"
                            class="flex flex-col rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-[360px]"
                            in:scale={{ duration: 600, delay: 400 + (i * 150) }}
                            onmouseenter={() => hoveredProgramme = programme.title}
                            onmouseleave={() => hoveredProgramme = null}
                            onclick={() => openProgrammeDetails(programme)}
                        >
                            <!-- Image section (top half) -->
                            <div class="relative w-full h-1/2 overflow-hidden">
                                <img 
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt={programme.title} 
                                    src={programme.image || "/images/placeholder.webp"} 
                                />
                                
                                <!-- Title overlay with blur -->
                                <div class="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 p-3">
                                    <h3 class="text-white font-medium font-secondary text-lg">{programme.title}</h3>
                                </div>
                            </div>
                            
                            <!-- Description section (bottom half) -->
                            <div class="flex-1 p-4 bg-white flex flex-col">
                                <p class="text-gray-700 text-sm flex-1">{programme.summary || ''}</p>
                                
                                <!-- View Details Button -->
                                <div class="pt-3 flex justify-end">
                                    <button
                                        class="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors group-hover:underline"
                                    >
                                        View Details
                                        <ChevronRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- End Programme Card -->
                    {/each}
                </div>
            {:else}
                <!-- Empty state -->
                <div 
                    class="flex flex-col items-center justify-center py-16 px-4"
                    in:fade={{ duration: 800, delay: 200 }}
                >
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-sm w-full max-w-lg text-center">
                        <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                            <Info class="size-10 text-primary-400" />
                        </div>
                        <h3 class="text-xl font-medium text-primary-800 mb-3">No Programmes Available</h3>
                        <p class="text-gray-600 mb-6">Our programmes are currently being updated. Please check back soon for a list of our exciting activities and initiatives.</p>
                        <div class="border-t border-gray-100 pt-4 mt-2">
                            <p class="text-sm text-gray-500">If you have any questions, please contact our team.</p>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
    
    <!-- Dialog for large screens -->
    <Dialog.Root bind:open={isDialogOpen}>
        <Dialog.Content class="sm:max-w-[600px]">
            <Dialog.Header>
                <Dialog.Title>{selectedProgramme?.title || 'Programme Details'}</Dialog.Title>
                <Dialog.Description>
                    Detailed information about this programme
                </Dialog.Description>
            </Dialog.Header>
            
            {#if isLoading}
                <div class="flex flex-col items-center justify-center py-12">
                    <Loader2 class="size-12 text-primary-700 animate-spin mb-4" />
                    <p class="text-gray-600">Loading programme details...</p>
                </div>
            {:else if programmeDetails}
                <div class="space-y-6">
                    <!-- Programme Image -->
                    <div class="flex justify-center">
                        <div class="p-4 rounded-full bg-primary-100">
                            <img 
                                src={programmeDetails.image || "/placeholder.svg"} 
                                alt={programmeDetails.title}
                                class="size-24 object-contain" 
                            />
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Description</h3>
                        <p class="text-gray-700">{@html programmeDetails.description}</p>
                    </div>
                    
                    <!-- Schedule -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Schedule</h3>
                        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                            {#each programmeDetails.schedule as item}
                                <div class="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p class="font-medium text-gray-800">{item.day}</p>
                                        <p class="text-sm text-gray-600">{item.time}</p>
                                    </div>
                                    <div class="text-sm text-gray-700">{item.location}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Coordinators -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Coordinators</h3>
                        <div class="space-y-3">
                            {#each programmeDetails.coordinators as coordinator}
                                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div class="size-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                                        {coordinator.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-800">{coordinator.name}</p>
                                        <p class="text-sm text-gray-600">{coordinator.role}</p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Benefits -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Benefits</h3>
                        <ul class="list-disc pl-5 space-y-1 text-gray-700">
                            {#each programmeDetails.benefits as benefit}
                                <li>{benefit}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}
            
            <Dialog.Footer>
                <Button variant="outline" onclick={closeProgrammeDetails}>
                    Close
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
    
    <!-- Sheet for small screens -->
    <Sheet.Root bind:open={isSheetOpen}>
        <Sheet.Content side="bottom" class="h-[85vh] overflow-y-auto">
            <div class="px-4 py-2 flex justify-between items-center border-b border-gray-100">
                <h2 class="text-lg font-medium text-gray-900">{selectedProgramme?.title || 'Programme Details'}</h2>
                <Button variant="ghost" size="icon" onclick={closeProgrammeDetails}>
                    <X class="size-4" />
                </Button>
            </div>
            
            {#if isLoading}
                <div class="flex flex-col items-center justify-center py-12">
                    <Loader2 class="size-12 text-primary-700 animate-spin mb-4" />
                    <p class="text-gray-600">Loading programme details...</p>
                </div>
            {:else if programmeDetails}
                <div class="p-4 space-y-6">
                    <!-- Programme Image -->
                    <div class="flex justify-center">
                        <div class="p-4 rounded-full bg-primary-100">
                            <img 
                                src={programmeDetails.image || "/placeholder.svg"} 
                                alt={programmeDetails.title}
                                class="size-20 object-contain" 
                            />
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <h3 class="text-base font-medium text-gray-900 mb-2">Description</h3>
                        <p class="text-sm text-gray-700">{@html programmeDetails.description}</p>
                    </div>
                    
                    <!-- Schedule -->
                    <div>
                        <h3 class="text-base font-medium text-gray-900 mb-2">Schedule</h3>
                        <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                            {#each programmeDetails.schedule as item}
                                <div class="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p class="font-medium text-sm text-gray-800">{item.day}</p>
                                        <p class="text-xs text-gray-600">{item.time}</p>
                                    </div>
                                    <div class="text-xs text-gray-700">{item.location}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Coordinators -->
                    <div>
                        <h3 class="text-base font-medium text-gray-900 mb-2">Coordinators</h3>
                        <div class="space-y-2">
                            {#each programmeDetails.coordinators as coordinator}
                                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div class="size-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs">
                                        {coordinator.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p class="font-medium text-sm text-gray-800">{coordinator.name}</p>
                                        <p class="text-xs text-gray-600">{coordinator.role}</p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Benefits -->
                    <div>
                        <h3 class="text-base font-medium text-gray-900 mb-2">Benefits</h3>
                        <ul class="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {#each programmeDetails.benefits as benefit}
                                <li>{benefit}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}
            
            <div class="p-4 border-t border-gray-100">
                <Button class="w-full" onclick={closeProgrammeDetails}>
                    Close
                </Button>
            </div>
        </Sheet.Content>
    </Sheet.Root>
</section>