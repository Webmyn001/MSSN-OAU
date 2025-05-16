<script lang="ts">
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { Phone, Mail, ExternalLink, Copy, Check, ChevronDown, MessageCircle, X, Info } from "@lucide/svelte";
    import copyTextToClipboard from "$lib/utils/copy.js";
    import { toast } from "svelte-sonner";
    import { tick } from "svelte";
    import { useId } from "bits-ui";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { JsonLd, MetaTags } from "svelte-meta-tags";
    import { fly, fade, scale } from "svelte/transition";
    import { Image } from '$lib/components/ui/image';
    import { browser } from '$app/environment';
    // import ResponsiveModal from "$lib/components/layout/ResponsiveModal.svelte";

    /**
     * @typedef {Object} SocialLink
     * @property {string} platform
     * @property {string} link
     */

    /**
     * @typedef {Object} Member
     * @property {string | number} id
     * @property {string} name
     * @property {string} position
     * @property {string} [phone]
     * @property {string} [email]
     * @property {string} [photo]
     * @property {string} [bio]
     * @property {SocialLink[]} [socials]
     * @property {string} [committeeName]
     */

    /**
     * @typedef {Object} Committee
     * @property {string} committee
     * @property {Member[]} members
     */

    /**
     * @typedef {Object} Session
     * @property {string} session
     * @property {Committee[]} executives
     */
    
    /**
     * @typedef {Object} ExcosData
     * @property {Session[]} sessions
     */

    /**
     * @typedef {Object} PagePropsData // Renamed to avoid conflict with a potential global PageData
     * @property {ExcosData} [excos]
     * @property {string} [error]
     */

    /** @type {{data: PagePropsData}} */
    let { data } = $props();

    let sessionSelectorOpen = $state(false);
    /** @type {Session[]} */
    let sessions = $state(/** @type {Session[]} */ ([]));
    /** @type {string | undefined} */
    let selectedSession = $state(/** @type {string | undefined} */ (undefined));
    let isLoaded = $state(false);
    /** @type {string | number | null} */
    let hoveredMember = $state(null);
    let visible = $state(false);
    
    /** @type {Member | null} */
    let activeMemberForModal = $state(null);
    let memberModalOpen = $state(false);

    $effect(() => {
        const newSessions = data?.excos?.sessions || [];
        if (JSON.stringify(newSessions) !== JSON.stringify(sessions)) {
            sessions = newSessions;
            if (selectedSession === undefined && newSessions.length > 0) {
                const preferred = newSessions.find(s => s.session === "2024/2025");
                selectedSession = preferred ? preferred.session : newSessions[0]?.session;
            } else if (newSessions.length === 0) {
                selectedSession = undefined;
            }
        }

        if (data?.error) {
            console.error("Error loading executive data:", data.error);
            toast.error(`Failed to load data: ${data.error.substring(0, 100)}`);
        }
        
        if (data?.excos?.sessions || data?.error) {
            setTimeout(() => { isLoaded = true; }, 300);
        } else {
            isLoaded = false;
        }
    });

    /** @type {Session | undefined} */
    const currentDisplaySessionData = $derived(
        selectedSession ? sessions.find(s => s.session === selectedSession) : undefined
    );

    const triggerId = useId();
    
    /** @param {string} id */
    function closeAndFocusTrigger(id) {
        sessionSelectorOpen = false;
        tick().then(() => {
            if (browser) {
                document.getElementById(id)?.focus();
            }
        });
    }

    $effect(() => {
        visible = true;
    });
    
    /** 
     * @param {number} min 
     * @param {number} max 
     * @returns {number} 
     */
    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /** 
     * @param {Member} member 
     * @param {string} committeeName 
     */
    function openMemberModal(member, committeeName) {
        activeMemberForModal = { ...member, committeeName };
        memberModalOpen = true;
    }

    function closeMemberModal() {
        memberModalOpen = false;
        setTimeout(() => {
            activeMemberForModal = null;
        }, 300); 
    }

    /** @param {Member} member */
    function copyContactDetails(member) {
        if (!member) return;
        // Ensure committeeName is a string, default to empty if undefined
        const committeeNameStr = member.committeeName || '';
        const details = `${member.name}\n${member.position}, ${committeeNameStr}, MSSNOAU${member.phone ? `\nPhone: ${member.phone}` : ''}${member.email ? `\nEmail: ${member.email}` : ''}`;
        copyTextToClipboard(details)
        .then(() => {
            toast.success(`${member.name}'s details copied.`);
            closeMemberModal();
        })
        .catch(() => {
            toast.error(`Failed to copy ${member.name}'s details.`);
        });
    }
</script>

<!-- Meta Tags -->
<MetaTags
        title="Our Executives"
        titleTemplate="%s | MSSNOAU"
        description="Meet the executives of the Muslim Students Society of Nigeria, OAU Branch. Find contact information and committee details for various sessions."
        canonical="https://mssnoau.org/our-excos"
        openGraph={{
            url: 'https://mssnoau.org/our-excos',
            title: 'Our Executives | MSSNOAU',
            description: 'Meet the executives of MSSN OAU. Committee members, positions, and contact details.',
            images: [
              {
                url: data?.excos?.sessions?.find(s => s.session === selectedSession)?.executives?.[0]?.members?.[0]?.photo || 'https://mssnoau.sirv.com/og/og-excos.jpg',
                width: 1200,
                height: 630,
                alt: `MSSN OAU Executives ${selectedSession || ''}`
              }
            ],
            siteName: 'MSSNOAU'
        }}
/>
{#if currentDisplaySessionData?.executives}
<JsonLd schema={{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Our Executives ${selectedSession ? `- ${selectedSession} Session` : ''} | MSSNOAU`,
    "description": `Meet the executives of the Muslim Students Society of Nigeria, OAU Branch for the ${selectedSession || 'current'} session.`,
    "url": `https://mssnoau.org/our-excos${selectedSession ? '?session=' + encodeURIComponent(selectedSession) : ''}`,
    "mainEntity": {
        "@type": "Organization",
        "name": `MSSN OAU Executives - ${selectedSession || 'Current'} Session`,
        "member": currentDisplaySessionData.executives.flatMap(committee =>
            committee.members.map(member => ({
                "@type": "Person",
                "name": member.name,
                "jobTitle": `${member.position}, ${committee.committee}`,
                "image": member.photo,
                "telephone": member.phone,
                "email": member.email,
                "worksFor": {
                    "@type": "Organization",
                    "name": "Muslim Students Society of Nigeria, OAU Branch"
                }
            }))
        )
    }
}}/>
{/if}
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
    {#if sessions.length > 0 && visible}
        <div in:fly={{ y: 30, duration: 800, delay: 400 }}>
            <Popover.Root bind:open={sessionSelectorOpen}>
                <Popover.Trigger id={triggerId} class="flex justify-center mx-auto mt-4">
                    <button class="group inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/20 p-1 ps-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-green-700 transition-all duration-300">
                        <span class="me-2 text-white text-sm font-medium">
                            {selectedSession || "Choose Session"}
                        </span>
                        <span class="group-hover:bg-white/30 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/20 font-semibold text-white text-sm transition-all duration-300">
                            <ChevronDown class="shrink-0 size-4 transition-transform duration-300 group-hover:rotate-180" />
                        </span>
                    </button>
                </Popover.Trigger>
                <Popover.Content class="w-[300px] p-0 rounded-xl border border-green-100 shadow-xl" side="bottom" align="center" portalProps={{ target: 'body' }}>
                    <Command.Root class="rounded-xl overflow-hidden">
                        <Command.Input placeholder="Search Session..." class="border-green-100 focus:ring-green-500" />
                        <Command.List class="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <Command.Empty class="py-6 text-center text-sm">No results found.</Command.Empty>
                            <Command.Group class="p-2" heading="Sessions" value="sessions_group">
                                {#each sessions as sessionItem (sessionItem.session)}
                                    <Command.Item
                                        value={sessionItem.session}
                                        class="aria-selected:bg-green-50 aria-selected:text-green-900 cursor-pointer"
                                        onSelect={() => {
                                            selectedSession = sessionItem.session;
                                            closeAndFocusTrigger(triggerId);
                                        }}
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

<section class="py-16 sm:py-24 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/5 rounded-full blur-3xl -z-10"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {#if data?.error && sessions.length === 0}
             <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                         <X class="h-6 w-6 text-red-400 bg-red-100 rounded-full p-0.5" />
                    </div>
                    <div class="ml-3">
                        <p class="text-red-700 text-lg font-medium">Error Loading Executives</p>
                        <p class="text-red-600 mt-1 text-sm">{data.error}. Please try refreshing the page or contact support.</p>
                    </div>
                </div>
             </div>
        {:else if !isLoaded && sessions.length === 0} <!-- Initial loading skeleton -->
            <div class="text-center text-gray-500 py-10">Loading executive details...</div>
             {#each Array(2) as _, committeeIndex}
                <div class="mb-16">
                    <div class="text-xl h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse my-3"></div>
                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-14 mt-8">
                        {#each Array(5) as _, memberIndex}
                            <div class="text-center relative">
                                <div class="relative mb-5 mx-auto w-28 h-28 bg-gray-200 rounded-full animate-pulse"></div>
                                <div class="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else if selectedSession && currentDisplaySessionData?.executives && currentDisplaySessionData.executives.length > 0}
            {#each currentDisplaySessionData.executives as committee, committeeIndex (committee.committee)}
                <div class="mb-16" in:fly={{ y: 30, duration: 800, delay: 100 + (committeeIndex * 150) }}>
                    <div class="text-xl text-green-800 font-semibold text-center font-secondary py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-6 after:flex-1 after:border-t after:border-green-300 after:ms-6">
                        <span class="relative px-4 py-2">
                            {committee.committee}
                            <span class="absolute inset-0 bg-green-50/50 rounded-lg -z-10 transform -skew-x-3"></span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-14 mt-8">
                        {#each committee.members as member (member.id)}
                            {@const isMemberModalOpen = activeMemberForModal?.id === member.id}
                            <div 
                                role="button"
                                tabindex="0"
                                class="group cursor-pointer text-center relative outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
                                onclick={() => openMemberModal(member, committee.committee)}
                                onkeydown={(e) => e.key === 'Enter' && openMemberModal(member, committee.committee)}
                                onmouseenter={() => hoveredMember = member.id}
                                onmouseleave={() => hoveredMember = null}
                                in:scale={{ duration: 600, delay: 200 + getRandomDelay(0, 400) }}
                            >
                                <div class="relative mb-5 mx-auto w-28 h-28">
                                    <Image 
                                        src={member.photo || "/images/avatar.webp"} 
                                        alt={`${member.name} - ${member.position}`}
                                        width={112}
                                        height={112}
                                        loading="lazy"
                                        className={`object-cover rounded-full shadow-xl transition-all duration-500 ease-in-out 
                                                ${hoveredMember === member.id ? 'ring-4 ring-green-500/70 ring-offset-2 scale-105' : 'ring-2 ring-green-200/50'}
                                                border-2 ${member.photo ? 'border-white' : 'border-green-100'}
                                        `}
                                    />
                                    <div class={`absolute bottom-0 right-0 bg-green-600 text-white p-1.5 rounded-full shadow-md transition-opacity duration-300 ${hoveredMember === member.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-80' }`}>
                                        <MessageCircle class="w-3 h-3" />
                                    </div>
                                </div>
                                <h3 class="text-md font-semibold text-green-900 group-hover:text-green-700 transition-colors">{member.name}</h3>
                                <p class="text-xs text-gray-600 group-hover:text-green-600 transition-colors">{member.position}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else if isLoaded && sessions.length > 0 && (!currentDisplaySessionData?.executives || currentDisplaySessionData.executives.length === 0)}
             <div class="text-center py-12 px-4">
                 <div class="bg-gray-50 rounded-xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
                    <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                        <Info class="size-10 text-primary-400" />
                    </div>
                    <h3 class="text-xl font-medium text-primary-800 mb-3">No Executives Found</h3>
                    <p class="text-gray-600 mb-6">
                        No executive members are listed for the selected session ({selectedSession || 'Unknown Session'}). Please select another session or check back later.
                    </p>
                </div>
            </div>
        {:else if isLoaded && sessions.length === 0 && !data?.error } <!-- Loaded but no sessions and no explicit error -->
            <div class="text-center py-12 px-4">
                 <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <Info class="h-6 w-6 text-yellow-500" />
                        </div>
                        <div class="ml-3">
                            <p class="text-yellow-700 text-lg font-medium">No Sessions Available</p>
                            <p class="text-yellow-600 mt-1 text-sm">Currently, there are no executive sessions available to display. Please check back later or contact support if you believe this is an error.</p>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</section>

{#if memberModalOpen && activeMemberForModal}
    {#await import('$lib/components/layout/ResponsiveModal.svelte') then module}
        {@const ResponsiveModal = module.default}
        <ResponsiveModal 
            bind:open={memberModalOpen}
            title={activeMemberForModal.name}
            description={`${activeMemberForModal.position}${activeMemberForModal.committeeName ? `, ${activeMemberForModal.committeeName}` : ''}`}
            onOpenChange={(isOpen) => { if (!isOpen) closeMemberModal(); }}
            contentClass="sm:max-w-md"
        >
            <!-- Trigger is implicit from the member card click -->
            <div class="space-y-4">
                <div class="flex justify-center pt-2">
                     <Image 
                        src={activeMemberForModal.photo || 'https://secure.gravatar.com/avatar/?d=mp&s=120'} 
                        alt={activeMemberForModal.name} 
                        width={120} 
                        height={120} 
                        className="rounded-full shadow-lg border-4 border-white"
                    />
                </div>

                {#if activeMemberForModal.bio}
                    <div class="text-sm text-gray-600 text-center prose prose-sm max-w-none">
                        {@html activeMemberForModal.bio}
                    </div>
                {/if}

                <div class="space-y-2 text-sm border-t pt-4 mt-4">
                    {#if activeMemberForModal.phone}
                        <a href={`tel:${activeMemberForModal.phone}`} class="flex items-center text-green-700 hover:underline justify-center sm:justify-start">
                            <Phone class="h-4 w-4 mr-2 shrink-0" /> {activeMemberForModal.phone}
                        </a>
                    {/if}
                    {#if activeMemberForModal.email}
                        <a href={`mailto:${activeMemberForModal.email}`} class="flex items-center text-green-700 hover:underline justify-center sm:justify-start">
                            <Mail class="h-4 w-4 mr-2 shrink-0" /> {activeMemberForModal.email}
                        </a>
                    {/if}
                </div>
                
                {#if activeMemberForModal.socials && activeMemberForModal.socials.length > 0}
                    <div class="flex justify-center sm:justify-start flex-wrap gap-2 pt-2 border-t mt-4">
                        {#each activeMemberForModal.socials as social (social.platform)}
                            <Button as="a" href={social.link} target="_blank" rel="noopener noreferrer" variant="outline" size="sm" class="text-xs flex items-center gap-1.5">
                                {social.platform} <ExternalLink class="h-3 w-3" />
                            </Button>
                        {/each}
                    </div>
                {/if}
            </div>

            {#snippet footer()} 
            <div class="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="outline" onclick={closeMemberModal} class="w-full sm:flex-1">Close</Button>
                <Button 
                    onclick={() => {
                        if (activeMemberForModal) {
                            copyContactDetails(activeMemberForModal);
                        }
                    }} 
                    class="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={!activeMemberForModal || (!activeMemberForModal.phone && !activeMemberForModal.email)}
                >
                    <Copy class="mr-2 h-4 w-4" /> Copy Details
                </Button>
            </div>
            {/snippet}
        </ResponsiveModal>
    {:catch error}
        <p class="text-red-500 text-center p-4">Error loading modal: {error.message}</p>
        <!-- You could offer a retry button or alternative content here -->
    {/await}
{/if}

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