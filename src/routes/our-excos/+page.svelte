<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { Phone, Mail, ExternalLink, Copy, Check, ChevronDown } from "lucide-svelte";
    import copyTextToClipboard from "$lib/utils/copy.js";
    import { toast } from "svelte-sonner";
    import { tick, onMount } from "svelte";
    import { useId } from "bits-ui";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { JsonLd, MetaTags } from "svelte-meta-tags";
    import { fly, fade, scale } from "svelte/transition";
    import { spring } from "svelte/motion";
    import { Image } from '$lib/components/ui/image';

    let { data } = $props();

    let sessionSelectorOpen = $state(false);
    let sessions = $state([]);
    let selectedSession = $state(undefined);
    let isLoaded = $state(false);
    let hoveredMember = $state(null);
    
    // For animation effects
    let visible = $state(false);

    // Initialize sessions and selectedSession when data changes
    $effect(() => {
        const newSessions = data?.excos?.sessions || [];
        if (JSON.stringify(newSessions) !== JSON.stringify(sessions)) {
            sessions = newSessions;
            if (newSessions.length > 0) {
                // Initialize selectedSession: prefer "2024/2025" or default to the first
                const preferred = newSessions.find(s => s.session === "2024/2025");
                selectedSession = preferred ? preferred.session : newSessions[0].session;
            } else {
                selectedSession = undefined;
            }
        }

        if (data?.error) {
            console.error("Error loading executive data:", data.error);
            toast.error(`Failed to load data: ${data.error.substring(0, 100)}`);
        }
        
        // Set loaded state after a short delay for animation purposes
        setTimeout(() => {
            isLoaded = true;
        }, 300);
    });

    // Derived state for the currently selected session's full data
    const currentDisplaySessionData = $derived(
        selectedSession ? sessions.find(s => s.session === selectedSession) : undefined
    );

    const triggerId = useId();
    
    /** @param {string} id */
    function closeAndFocusTrigger(id) {
        sessionSelectorOpen = false;
        tick().then(() => {
            document.getElementById(id)?.focus();
        });
    }

    onMount(() => {
        visible = true;
    });
    
    // Function to get a random delay for staggered animations
    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Function to copy contact details with animation feedback
    function copyContactDetails(member, committee) {
        return () => {
            copyTextToClipboard(`${member.name}\nThe ${member.position} at ${committee.committee}, MSSNOAU\nPhone: ${member.phone}`)
            .then(() => {
                toast.success(member.name + "'s details copied to clipboard.");
            })
            .catch(() => {
                toast.error("Failed to copy " + member.name + "'s details to clipboard.")
            });
        };
    }
</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Executives"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/our-excos"
        openGraph={{
            url: 'https://mssnoau-frontend.vercel.app/our-excos',
    title: 'Our Executives | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/XkXWPtq/our-excos.webp',
        width: 1200,
        height: 640,
                alt: 'MSSN OAU Executives Page'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<JsonLd schema={{
            "@type": "WebPage",
    "name": "Our Executives | MSSNOAU",
    "description": "Meet the executives of the Muslim Students Society of Nigeria, Obafemi Awolowo University (OAU) Branch. Find contact information and committee details.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU.org"
    },
    "hasPart": currentDisplaySessionData && currentDisplaySessionData.executives && currentDisplaySessionData.executives.length > 0 ? {
        "@type": "ItemList",
        "itemListElement": currentDisplaySessionData.executives.flatMap(committee =>
            committee.members.map(member => ({
                "@type": "Person",
                "name": member.name,
                "jobTitle": member.position,
                "memberOf": {
                    "@type": "Organization",
                    "name": committee.committee
                },
                ...(member.photo ? { "image": member.photo } : {}),
                ...(member.phone ? { "telephone": member.phone } : {})
            }))
        )
    } : undefined
}}/>
<!-- End Meta Tags -->

<PageHeader>
    <div class="relative">
        {#if visible}
            <h1 in:fly={{ y: 30, duration: 800, delay: 200 }} class="relative z-10">
    Our Executives
                <span class="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-green-600 rounded-full"></span>
            </h1>
        {/if}
    </div>
    <br/>
    <!-- Session Button - only show if sessions are loaded -->
    {#if sessions.length > 0 && visible}
        <div in:fly={{ y: 30, duration: 800, delay: 400 }}>
    <Popover.Root bind:open={sessionSelectorOpen}>
                <Popover.Trigger id={triggerId}>
            <div class="flex justify-center mx-auto mt-4">
                        <button class="group inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/20 p-1 ps-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-green-700 transition-all duration-300"
                >
                            <span class="me-2 text-white text-sm font-medium">
                                {selectedSession || "Choose Session"}
                    </span>
                            <span class="group-hover:bg-white/30 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/20 font-semibold text-white text-sm transition-all duration-300">
                                <ChevronDown class="shrink-0 size-4 transition-transform duration-300 group-hover:rotate-180" />
        </span>
                </button>
            </div>
        </Popover.Trigger>
                <Popover.Content class="w-[300px] p-0 rounded-xl border border-green-100 shadow-xl" side="bottom" align="center">
                    <Command.Root class="rounded-xl overflow-hidden">
                        <Command.Input placeholder="Choose Session..." class="border-green-100 focus:ring-green-500" />
                <Command.List>
                    <Command.Empty>No results found.</Command.Empty>
                    <Command.Group>
                                {#each sessions as sessionItem (sessionItem.session)}
                            <Command.Item
                                            value={sessionItem.session}
                                            onSelect={value => {
                                                selectedSession = value;
                                        closeAndFocusTrigger(triggerId);
                                            }}
                                            class="aria-selected:bg-green-50 aria-selected:text-green-900"
                                    >
                                        <span>{sessionItem.session}</span>
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.List>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>
        </div>
    {/if}
</PageHeader>

<section class="py-24 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Case 1: Error from load function and no sessions (likely implies data.excos.sessions was also empty) -->
        {#if data && data.error && sessions.length === 0}
             <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-red-700 text-lg font-medium">{data.error}</p>
                        <p class="text-red-600 mt-1">Please try refreshing the page or contact the administrator.</p>
                    </div>
                </div>
             </div>
        <!-- Case 2: Data loaded, session selected, and executives exist for that session -->
        {:else if currentDisplaySessionData && currentDisplaySessionData.executives && currentDisplaySessionData.executives.length > 0}
            {#each currentDisplaySessionData.executives as committee, committeeIndex (committee.committee)}
                <div class="mb-16" in:fly={{ y: 30, duration: 800, delay: 600 + (committeeIndex * 200) }}>
                    <div class="text-xl text-green-800 font-semibold text-center font-secondary py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-6 after:flex-1 after:border-t after:border-green-300 after:ms-6">
                        <span class="relative px-4 py-2">
                            {committee.committee}
                            <span class="absolute inset-0 bg-green-50/50 rounded-lg -z-10 transform -skew-x-3"></span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-14 mt-8">
                        {#each committee.members as member, memberIndex (member.id)}
                            <AlertDialog.Root key={member.id}>
                                <AlertDialog.Trigger>
                                    <div 
                                        role="button"
                                        tabindex="0"
                                        class="group cursor-pointer text-center relative"
                                        onmouseenter={() => hoveredMember = member.id}
                                        onmouseleave={() => hoveredMember = null}
                                        in:scale={{ duration: 600, delay: 800 + getRandomDelay(0, 500) }}
                                    >
                                        <div class="relative mb-5 mx-auto w-28 h-28">
                                            <!-- Photo container with glassmorphism effect -->
                                            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-sm -z-10 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"></div>
                                            
                                            <!-- Photo -->
                                            <Image
                                                src={member.photo || "/images/placeholder.webp"}
                                                alt={member.name}
                                                className="w-28 h-28 rounded-2xl object-cover mx-auto transition-all duration-500 border-2 border-solid border-white/50 group-hover:border-green-600 shadow-md group-hover:shadow-green-200/50 group-hover:shadow-lg"
                                                width={112}
                                                height={112}
                                            />
                                            
                                            <!-- Decorative elements -->
                                            <div class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-600/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                                <ExternalLink class="text-white w-3 h-3" />
                                            </div>
                                        </div>
                                        
                                        <h4 class="text-xl text-gray-900 font-semibold mb-2 transition-all duration-500 group-hover:text-green-600">
                                            {member.name}
                                        </h4>
                                        <span class="text-gray-500 block transition-all duration-500 group-hover:text-gray-900 text-sm">
                                {member.position}
                            </span>
                                    </div>
                                </AlertDialog.Trigger>
                                <AlertDialog.Content class="lg:max-w-[60dvw] overflow-y-auto max-h-[90vh] scrollbar-hide rounded-xl border-green-100 shadow-xl">
                                    <AlertDialog.Header>
                                        <AlertDialog.Title class="text-green-800 flex items-center gap-2">
                                            {member.name}'s Profile
                                            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                {committee.committee}
                                            </span>
                                        </AlertDialog.Title>
                                        <AlertDialog.Description>
                                            Viewing {member.name}, The {member.position} at {committee.committee}, MSSNOAU
                                        </AlertDialog.Description>
                                    </AlertDialog.Header>
                                    
                                    <!-- Profile with enhanced styling -->
                                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-green-50/50 rounded-xl border border-green-100">
                                        <div class="shrink-0 relative">
                                            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-sm -z-10 transform scale-110"></div>
                                            <Image 
                                                className="shrink-0 size-24 rounded-full border-2 border-white shadow-md" 
                                                src={member.photo || "/images/placeholder.webp"}
                                                alt={member.name}
                                                width={96}
                                                height={96}
                                            />
                                        </div>
                                        <div class="grow">
                                            <h1 class="text-xl font-medium text-gray-800">
                                                {member.name}
                                            </h1>
                                            <p class="text-sm text-gray-600">
                                                The {member.position} at {committee.committee}, MSSNOAU
                                            </p>
                                            
                                            <!-- Contact buttons -->
                                            <div class="mt-3 flex flex-nowrap justify-center gap-1">
                                                <a 
                                                    href={`tel:${member.phone}`}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-300"
                                                >
                                                    <Phone class="w-3 h-3" />
                                                    Call
                                                </a>
                                                
                                                <a 
                                                    href={`https://wa.me/234${member.phone.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors duration-300"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                                         class="w-3 h-3 fill-current"><title>WhatsApp</title>
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                    </svg>
                                                    WhatsApp
                                                </a>
                                                
                                                <button 
                                                    onclick={copyContactDetails(member, committee)}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-300"
                                                >
                                                    <Copy class="w-3 h-3" />
                                                    Copy Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Contact details with enhanced styling -->
                                    <div class="mt-6">
                                        <h3 class="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                                        <ul class="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <li class="flex items-center gap-x-3 py-2 px-4 rounded-lg hover:bg-gray-50">
                                                <Phone class="shrink-0 size-5 text-green-600"/>
                                                <div>
                                                    <p class="text-xs text-gray-500 mb-0.5">Phone Number</p>
                                                    <a class="text-sm text-gray-900 font-medium hover:text-green-700 transition-colors"
                                                   href={`tel:${member.phone}`}>
                                                    {member.phone}
                                                </a>
                                                </div>
                                            </li>
                                            <li class="flex items-center gap-x-3 py-2 px-4 rounded-lg hover:bg-gray-50">
                                                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                                     class="shrink-0 size-5 text-[#25D366]"><title>WhatsApp</title>
                                                    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                <div>
                                                    <p class="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                                                    <a class="text-sm text-gray-900 font-medium hover:text-[#25D366] transition-colors"
                                                   href={`https://wa.me/234${member.phone.replace(/^0/, "").replace(/^234/, "").replace(/^\+234/, "").replaceAll(" ", "")}`}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                >
                                                    {member.phone}
                                                </a>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <AlertDialog.Footer>
                                        <AlertDialog.Cancel class="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">Close</AlertDialog.Cancel>
                                        <AlertDialog.Action 
                                            class="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                            onclick={copyContactDetails(member, committee)}
                                        >
                                            <Copy class="w-4 h-4 mr-2" />
                                            Copy Details
                                        </AlertDialog.Action>
                                    </AlertDialog.Footer>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
                        {/each}
                    </div>
                </div>
            {/each}
        <!-- Case 3: Data loaded, session selected, but no executives for that session -->
        {:else if currentDisplaySessionData && currentDisplaySessionData.executives && currentDisplaySessionData.executives.length === 0}
            <div class="max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 p-8 shadow-md text-center">
                <div class="mb-6 bg-green-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-medium text-gray-800 mb-2">No Executives Found</h3>
                <p class="text-gray-500 mb-6">We couldn't find any executive committees for the {selectedSession} session. Our records may be in the process of being updated.</p>
                
                <div class="inline-flex flex-col sm:flex-row gap-3">
                    <button 
                        class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        onclick={() => sessionSelectorOpen = true}
                    >
                        Select Different Session
                        <ChevronDown class="ml-2 size-4" />
                    </button>
                    <a 
                        href="/contact"
                        class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                        Contact Administration
                    </a>
                </div>
            </div>
        <!-- Case 4: No sessions loaded (e.g., initial state, or API returned empty sessions) and no error shown yet -->
        {:else if sessions.length === 0 && !(data && data.error)}
            <div class="max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 p-8 shadow-md text-center">
                <div class="mb-6 bg-green-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 class="text-xl font-medium text-gray-800 mb-2">No Sessions Available</h3>
                <p class="text-gray-500 mb-6">We couldn't find any academic sessions with executive information. Please check back later as we update our records.</p>
                
                <button 
                    onclick={() => window.location.reload()}
                    class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 22v-6h6"></path>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    Refresh Page
                </button>
            </div>
        {/if}
    </div>
</section>

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    
    /* Subtle hover animation for profile cards */
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    .group:hover {
        animation: float 2s ease-in-out infinite;
    }
</style>