<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { fly, fade, scale } from 'svelte/transition';
    // import { onMount } from 'svelte'; // To be replaced by $effect
    import SEO from '$lib/components/SEO.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Loader2, X, ChevronRight, Info } from '@lucide/svelte';
    import ResponsiveModal from '$lib/components/layout/ResponsiveModal.svelte';

    /**
     * @typedef {Object} ProgrammeScheduleItem
     * @property {string} day
     * @property {string} time
     * @property {string} [venue]
     */

    /**
     * @typedef {Object} ProgrammeCoordinator
     * @property {string} name
     * @property {string} [role]
     * @property {string} [contact]
     */

    /**
     * @typedef {Object} Programme
     * @property {string | number} id
     * @property {string} title
     * @property {string} [summary]
     * @property {string} [description]
     * @property {string} [image]
     * @property {string} [text] - Legacy field for description
     * @property {ProgrammeScheduleItem[]} [schedule]
     * @property {ProgrammeCoordinator[]} [coordinators]
     * @property {string[]} [benefits]
     */

    /**
     * @typedef {Object} PageData
     * @property {Programme[]} [programmes]
     * @property {any} [props] // For $props()
     */

    /** @type {PageData} */
    let { data } = $props();
    
    /** @type {Programme[]} */
    let programmes = $state([]);
    let visible = $state(false);
    /** @type {Programme | null} */
    let hoveredProgramme = $state(null);
    /** @type {Programme | null} */
    let selectedProgramme = $state(null);
    let isLoading = $state(false);
    /** @type {Programme | null} */
    let programmeDetails = $state(null);
    let modalOpen = $state(false);
    
    $effect(() => {
        visible = true;
        // Check if data.programmes is available
        if (data?.programmes && data.programmes.length > 0) {
            programmes = data.programmes;
            console.log('Using API data:', programmes.length, 'programmes loaded');
        } else {
            // No fallback data, just keep programmes empty
            console.warn('API data not available, showing empty state');
            programmes = [];
        }
        
        console.log('Final programmes data:', programmes);
    });

    /** @param {Programme} programme */
    function openProgrammeDetails(programme) {
        selectedProgramme = programme;
        modalOpen = true;
        
        isLoading = true;
        
        setTimeout(() => {
            if (selectedProgramme) { // Ensure selectedProgramme is still valid
                programmeDetails = {
                    ...selectedProgramme,
                    description: selectedProgramme.description || selectedProgramme.text,
                    schedule: selectedProgramme.schedule || [],
                    coordinators: selectedProgramme.coordinators || [],
                    benefits: selectedProgramme.benefits || []
                };
            }
            isLoading = false;
        }, 500);
    }
    
    function closeProgrammeDetails() {
        modalOpen = false;
        // Delay reset for animation
        setTimeout(() => {
            selectedProgramme = null;
            programmeDetails = null;
        }, 300);
    }
    $inspect(programmes, selectedProgramme, programmeDetails)
</script>

<SEO
    title="Our Programmes"
    description="Explore the diverse programmes and activities offered by MSSNOAU, designed to foster spiritual growth, academic excellence, and community engagement for Muslim students at OAU."
    path="/programmes"
    type="WebPage" 
    images={[
        {
            url: 'https://i.ibb.co/zbWfh5B/home.webp', // Consider a more specific image for programmes
            width: 1200,
            height: 640,
            alt: 'MSSNOAU Programmes'
        }
    ]}
    keywords={["mssnoau programmes", "mssn oau events", "islamic activities oau", "muslim student programmes oau", "oau mssn activities"]}
/>

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
                    {#each programmes as programme, i (programme.id)}
                        <!-- Enhanced Programme Card -->
                        <div 
                            role="button"
                            tabindex="0"
                            class="flex flex-col rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-[360px]"
                            in:scale={{ duration: 600, delay: 400 + (i * 150) }}
                            onmouseenter={() => hoveredProgramme = programme}
                            onmouseleave={() => hoveredProgramme = null}
                            onclick={() => openProgrammeDetails(programme)}
                            onkeydown={(e) => { if (e.key === 'Enter') openProgrammeDetails(programme) }}
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
                                    <div class="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors group-hover:underline">
                                        View Details
                                        <ChevronRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
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
    
    {#if selectedProgramme}
        <ResponsiveModal 
            bind:open={modalOpen} 
            title={selectedProgramme.title}
            description={`Detailed information about the ${selectedProgramme.title} programme.`}
            onOpenChange={(isOpen) => { if (!isOpen) closeProgrammeDetails(); }}
            contentClass="sm:max-w-[600px]"
        >
            <!-- Default slot for main content -->
            <div class="py-6 px-1">
                {#if isLoading}
                    <div class="flex flex-col items-center justify-center py-12">
                        <Loader2 class="size-12 text-primary-700 animate-spin mb-4" />
                        <p class="text-gray-600">Loading programme details...</p>
                    </div>
                {:else if programmeDetails}
                    <div class="space-y-6">
                        <div class="flex justify-center my-4">
                            <div class="p-2 rounded-lg bg-primary-50 border border-primary-100 shadow-sm">
                                <img 
                                    src={programmeDetails.image || "/images/placeholder.webp"} 
                                    alt={programmeDetails.title}
                                    class="h-28 w-28 object-contain rounded-md" 
                                />
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Description</h3>
                            <div class="prose prose-sm max-w-none text-gray-700">{@html programmeDetails.description || 'No description available.'}</div>
                        </div>
                        
                        {#if programmeDetails.schedule && programmeDetails.schedule.length > 0}
                            <div>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Schedule</h3>
                                <div class="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                                    {#each programmeDetails.schedule as item (item.day + item.time) }
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <p class="font-medium text-gray-800">{item.day}</p>
                                                <p class="text-xs text-gray-500">{item.time}</p>
                                            </div>
                                            <p class="text-sm text-gray-600 sm:text-right">{item.venue || 'Online'}</p>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        {#if programmeDetails.coordinators && programmeDetails.coordinators.length > 0}
                            <div>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Coordinators</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {#each programmeDetails.coordinators as coordinator (coordinator.name)}
                                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p class="font-medium text-gray-800">{coordinator.name}</p>
                                            {#if coordinator.role}<p class="text-xs text-gray-500">{coordinator.role}</p>{/if}
                                            {#if coordinator.contact}<p class="text-xs text-primary-600 hover:underline"><a href="tel:{coordinator.contact}">{coordinator.contact}</a></p>{/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        {#if programmeDetails.benefits && programmeDetails.benefits.length > 0}
                            <div>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Benefits/Objectives</h3>
                                <ul class="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                                    {#each programmeDetails.benefits as benefit (benefit)}
                                        <li>{benefit}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}

                        {#if !programmeDetails.description && !(programmeDetails.schedule && programmeDetails.schedule.length > 0) && !(programmeDetails.coordinators && programmeDetails.coordinators.length > 0) && !(programmeDetails.benefits && programmeDetails.benefits.length > 0)}
                            <p class="text-center text-gray-500 py-8">More details coming soon for this programme.</p>
                        {/if}
                    </div>
                {/if}
            </div>

            {#snippet footer()}
                <Button variant="outline" onclick={closeProgrammeDetails} class="">Close</Button>
                <!-- Add other actions if needed, e.g., Register button -->
            {/snippet}
        </ResponsiveModal>
    {/if}
</section>

<style>
    .prose :global(p) {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .prose :global(ul) {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>